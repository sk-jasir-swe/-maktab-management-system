import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'

const initialForm = {
  teacher: '',
  amount: '',
  month: new Date().toISOString().slice(0, 7),
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  status: 'paid',
  note: '',
}

const inputClass =
  'w-full rounded-xl border border-cyan-100/15 bg-[#111935] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10'

const glassPanel =
  'rounded-3xl border border-white/[0.10] bg-[#171a3c]/75 shadow-xl shadow-black/10 backdrop-blur-xl'

function SalaryPayments() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [teachers, setTeachers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Date range filter
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedToDate, setAppliedToDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [paymentResponse, teacherResponse] = await Promise.all([
        apiRequest('/salary-payments'),
        apiRequest('/teachers'),
      ])

      setPayments(paymentResponse.salaryPayments || [])
      setTeachers(teacherResponse.teachers || [])
    } catch (err) {
      setError(err.message || 'Failed to load salary payments.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openAddForm() {
    setForm({
      ...initialForm,
      month: new Date().toISOString().slice(0, 7),
      paymentDate: new Date().toISOString().slice(0, 10),
    })

    setEditingId(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function openEditForm(payment) {
    setForm({
      teacher: payment.teacher?._id || '',
      amount: payment.amount ?? '',
      month: payment.month || '',
      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().slice(0, 10)
        : '',
      paymentMethod: payment.paymentMethod || 'cash',
      status: payment.status || 'pending',
      note: payment.note || '',
    })

    setEditingId(payment._id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function applyDateFilter(event) {
    event.preventDefault()

    if (fromDate && toDate && fromDate > toDate) {
      setError('From Date cannot be later than To Date.')
      return
    }

    setError('')
    setAppliedFromDate(fromDate)
    setAppliedToDate(toDate)
  }

  function resetDateFilter() {
    setFromDate('')
    setToDate('')
    setAppliedFromDate('')
    setAppliedToDate('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!editingId && !form.teacher) {
      setError('Please select a teacher.')
      return
    }

    if (
      form.amount === '' ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) < 0
    ) {
      setError('Please enter a valid salary amount.')
      return
    }

    if (!form.month.trim()) {
      setError('Please select the salary month.')
      return
    }

    const payload = {
      amount: Number(form.amount),
      month: form.month,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      status: form.status,
      note: form.note,
    }

    if (!editingId) {
      payload.teacher = form.teacher
    }

    setSaving(true)

    try {
      if (editingId) {
        await apiRequest(`/salary-payments/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        setSuccess('Salary payment updated successfully.')
      } else {
        await apiRequest('/salary-payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        setSuccess('Salary payment recorded successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm({
        ...initialForm,
        month: new Date().toISOString().slice(0, 7),
        paymentDate: new Date().toISOString().slice(0, 10),
      })

      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to save salary payment.')
    } finally {
      setSaving(false)
    }
  }

  // Date, search and status filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const teacherName = payment.teacher?.name || ''
      const teacherSubject = payment.teacher?.subject || ''

      const matchesSearch =
        teacherName.toLowerCase().includes(search.toLowerCase()) ||
        teacherSubject.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || payment.status === statusFilter

      const paymentDate = payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().slice(0, 10)
        : ''

      const matchesFromDate =
        !appliedFromDate ||
        (paymentDate && paymentDate >= appliedFromDate)

      const matchesToDate =
        !appliedToDate ||
        (paymentDate && paymentDate <= appliedToDate)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      )
    })
  }, [
    payments,
    search,
    statusFilter,
    appliedFromDate,
    appliedToDate,
  ])

  // Summary cards use the filtered records.
  const totalPaid = filteredPayments
    .filter((payment) => payment.status === 'paid')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)

  const totalPending = filteredPayments
    .filter((payment) => payment.status === 'pending')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)

  const paidCount = filteredPayments.filter(
    (payment) => payment.status === 'paid',
  ).length

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed px-4 py-6 text-white sm:px-8 sm:py-8"
      style={{
        background:
          'radial-gradient(ellipse at 10% 0%, rgba(0,213,160,0.08), transparent 35%), linear-gradient(135deg, #0b1026 0%, #081e16 55%, #071910 100%)',
        minHeight: '100vh',
        width: '100%',
        isolation: 'isolate',
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-7 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-cyan-300"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Finance Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Salary Payments
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage teacher salaries and payment history.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-[#00d5a0] px-5 py-3 font-semibold text-[#06251a] shadow-lg transition hover:bg-[#38e6b7]"
          >
            + Record Salary
          </button>
        </header>

        {/* Alerts */}
        {error && !showForm && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-200">
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Records"
            value={filteredPayments.length}
            icon="📋"
          />

          <StatCard
            title="Total Salary Paid"
            value={`₹${formatAmount(totalPaid)}`}
            icon="💰"
          />

          <StatCard
            title="Pending Salary"
            value={`₹${formatAmount(totalPending)}`}
            icon="⏳"
          />

          <StatCard
            title="Paid Payments"
            value={paidCount}
            icon="✅"
          />
        </section>

        {/* Add/Edit Form */}
        {showForm && (
          <section className={`${glassPanel} mb-8 p-5 sm:p-7`}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? 'Update Salary Payment' : 'Record New Salary'}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Enter the teacher salary details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {!editingId && (
                  <FormField label="Select Teacher">
                    <select
                      name="teacher"
                      value={form.teacher}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Choose teacher</option>

                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} — {teacher.subject}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}

                <FormField label="Salary Amount (₹)">
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="Enter salary amount"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Salary Month">
                  <input
                    type="month"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Payment Date">
                  <input
                    type="date"
                    name="paymentDate"
                    value={form.paymentDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Payment Method">
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </FormField>

                <FormField label="Payment Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </FormField>

                <div className="sm:col-span-2 lg:col-span-3">
                  <FormField label="Note (Optional)">
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add a note..."
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#00d5a0] px-6 py-3 font-semibold text-[#06251a] transition hover:bg-[#38e6b7] disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Payment'
                      : 'Save Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Salary Records */}
        <section className={`${glassPanel} overflow-hidden`}>
          <div className="border-b border-white/8 p-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Salary Records</h2>

                <p className="mt-1 text-sm text-gray-400">
                  {filteredPayments.length} records found
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search teacher or subject..."
                  className={inputClass}
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={inputClass}
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date Range Filter */}
            <form
              onSubmit={applyDateFilter}
              className="rounded-2xl border border-cyan-300/10 bg-[#0b2118]/70 p-4"
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-cyan-200">
                  Filter by Payment Date
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Select a date range to update salary summary and records.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                <FormField label="From Date">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="To Date">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    min={fromDate || undefined}
                    className={inputClass}
                  />
                </FormField>

                <button
                  type="submit"
                  className="rounded-xl bg-[#00d5a0] px-5 py-3 text-sm font-semibold text-[#06251a] transition hover:bg-[#38e6b7]"
                >
                  Apply Filter
                </button>

                <button
                  type="button"
                  onClick={resetDateFilter}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                >
                  Reset
                </button>
              </div>

              {(appliedFromDate || appliedToDate) && (
                <p className="mt-3 text-xs text-cyan-300">
                  Applied range:{' '}
                  {appliedFromDate ? formatDate(appliedFromDate) : 'Any date'}{' '}
                  – {appliedToDate ? formatDate(appliedToDate) : 'Any date'}
                </p>
              )}
            </form>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading salary payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-3 text-4xl">💰</div>

              <h3 className="font-semibold">No salary payments found</h3>

              <p className="mt-2 text-sm text-gray-400">
                Record a salary payment or change your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-250 text-left text-sm">
                <thead className="border-b border-white/8 bg-white/[0.035] text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-5 py-4">Teacher</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Salary Month</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Payment Date</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/6">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition hover:bg-cyan-400/4.5"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-100">
                        {payment.teacher?.name || 'Unknown teacher'}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {payment.teacher?.subject || '—'}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {payment.month || '—'}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#55e6b8]">
                        ₹{formatAmount(payment.amount)}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {formatDate(payment.paymentDate)}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {formatLabel(payment.paymentMethod)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(payment)}
                          className="rounded-lg border border-cyan-400/25 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-gray-500">
          Salary payment history is retained for record keeping.
        </p>
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-300">
        {label}
      </span>

      {children}
    </label>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#171a3c]/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-[#1b2048]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/[0.07] blur-3xl transition group-hover:bg-cyan-300/13" />

      <div className="relative mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-400/8 text-xl">
          {icon}
        </span>
      </div>

      <p className="relative wrap-break-word text-2xl font-bold tracking-tight text-[#55e6b8] sm:text-3xl">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    paid: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    pending: 'border-amber-300/20 bg-amber-400/10 text-amber-300',
    cancelled: 'border-red-400/20 bg-red-400/10 text-red-300',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || 'border-white/10 bg-white/5 text-gray-400'
      }`}
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  )
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))
}

function formatDate(date) {
  if (!date) return '—'

  const dateString =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `${date}T12:00:00`
      : date

  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatLabel(value) {
  if (!value) return '—'

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default SalaryPayments