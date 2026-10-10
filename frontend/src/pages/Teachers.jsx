import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'
import '../App.css'

const initialForm = {
  name: '',
  phone: '',
  whatsappNumber: '',
  email: '',
  subject: '',
  address: '',
  joiningDate: new Date().toISOString().split('T')[0],
  status: 'active',
}

function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [photo, setPhoto] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  async function fetchTeachers() {
    try {
      setLoading(true)
      setError('')

      const response = await apiRequest('/teachers')
      setTeachers(response.teachers || [])
    } catch (err) {
      setError(err.message || 'Unable to load teachers.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openAddForm() {
    setFormData({
      ...initialForm,
      joiningDate: new Date().toISOString().split('T')[0],
    })

    setPhoto(null)
    setEditingId(null)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(teacher) {
    setFormData({
      name: teacher.name || '',
      phone: teacher.phone || '',
      whatsappNumber: teacher.whatsappNumber || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
      address: teacher.address || '',
      joiningDate: teacher.joiningDate
        ? new Date(teacher.joiningDate).toISOString().split('T')[0]
        : '',
      status: teacher.status || 'active',
    })

    setPhoto(null)
    setEditingId(teacher._id)
    setError('')
    setSuccess('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setPhoto(null)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    const phone = formData.phone.trim()
    const whatsappNumber = formData.whatsappNumber.trim()

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must contain exactly 10 digits.')
      return
    }

    if (!/^\d{10}$/.test(whatsappNumber)) {
      setError('WhatsApp number must contain exactly 10 digits.')
      return
    }

    if (photo && photo.size > 5 * 1024 * 1024) {
      setError('Photo size must not exceed 5 MB.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const body = new FormData()

      Object.entries({
        ...formData,
        phone,
        whatsappNumber,
      }).forEach(([key, value]) => {
        body.append(key, value)
      })

      if (photo) {
        body.append('photo', photo)
      }

      const endpoint = editingId
        ? `/teachers/${editingId}`
        : '/teachers'

      await apiRequest(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        body,
      })

      setSuccess(
        editingId
          ? 'Teacher updated successfully.'
          : 'Teacher added successfully.',
      )

      setShowForm(false)
      setEditingId(null)
      setPhoto(null)

      await fetchTeachers()
    } catch (err) {
      setError(err.message || 'Unable to save teacher.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(teacher) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${teacher.name}?`,
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await apiRequest(`/teachers/${teacher._id}`, {
        method: 'DELETE',
      })

      setTeachers((previous) =>
        previous.filter((item) => item._id !== teacher._id),
      )

      setSuccess('Teacher deleted successfully.')
    } catch (err) {
      setError(err.message || 'Unable to delete teacher.')
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch = [
      teacher.name,
      teacher.phone,
      teacher.whatsappNumber,
      teacher.email,
      teacher.subject,
    ].some((value) =>
      String(value || '').toLowerCase().includes(searchText),
    )

    const matchesStatus =
      filterStatus === 'all' || teacher.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const activeCount = teachers.filter(
    (teacher) => teacher.status === 'active',
  ).length

  const inactiveCount = teachers.filter(
    (teacher) => teacher.status === 'inactive',
  ).length

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10'

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Teachers Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Manage teacher profiles, contact details and status.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300"
          >
            + Add Teacher
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-200"
          >
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total Teachers',
              value: teachers.length,
              icon: '👨‍🏫',
            },
            {
              label: 'Active Teachers',
              value: activeCount,
              icon: '✅',
            },
            {
              label: 'Inactive Teachers',
              value: inactiveCount,
              icon: '⏸️',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-cyan-300">
                {loading ? '...' : item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Add / Edit Form */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-cyan-300/20 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Teacher' : 'Add New Teacher'}
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Enter the teacher details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="text-sm text-white/75">
                    Teacher Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="text-sm text-white/75">
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="whatsappNumber"
                    className="text-sm text-white/75"
                  >
                    WhatsApp Number *
                  </label>

                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="10-digit WhatsApp number"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm text-white/75">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="teacher@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="text-sm text-white/75">
                    Subject *
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Quran, Arabic"
                    required
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label
                    htmlFor="joiningDate"
                    className="text-sm text-white/75"
                  >
                    Joining Date
                  </label>

                  <input
                    id="joiningDate"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="text-sm text-white/75">
                    Status *
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="address" className="text-sm text-white/75">
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>

                {/* Photo */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="photo" className="text-sm text-white/75">
                    Teacher Photo (Optional)
                  </label>

                  <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setPhoto(event.target.files?.[0] || null)
                    }
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-[#0b1026]"
                  />

                  <p className="mt-2 text-xs text-white/40">
                    JPG, PNG or WEBP. Maximum size 5 MB.
                  </p>

                  {photo && (
                    <p className="mt-2 text-sm text-cyan-300">
                      Selected: {photo.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Teacher'
                      : 'Save Teacher'}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-6 py-3 text-white/70 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and Filter */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, WhatsApp, email or subject..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          >
            <option value="all">All Teachers</option>
            <option value="active">Active Teachers</option>
            <option value="inactive">Inactive Teachers</option>
          </select>

          <button
            type="button"
            onClick={fetchTeachers}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10"
          >
            ↻ Refresh
          </button>
        </section>

        {/* Teachers Table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">All Teachers</h2>

            <span className="text-sm text-white/45">
              {filteredTeachers.length} teacher(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">👨‍🏫</div>

              <h3 className="mt-4 text-lg font-semibold">
                No teachers found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Try another search or add a new teacher.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4 font-medium">Teacher</th>
                    <th className="px-6 py-4 font-medium">Subject</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">WhatsApp</th>
                    <th className="px-6 py-4 font-medium">Joining Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher._id}
                      className="transition hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {teacher.photo?.url ? (
                            <img
                              src={teacher.photo.url}
                              alt={teacher.name}
                              className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-cyan-400/10 text-lg text-cyan-300">
                              {teacher.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-white">
                              {teacher.name}
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              {teacher.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {teacher.subject || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {teacher.phone || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {teacher.whatsappNumber || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {teacher.joiningDate
                          ? new Date(
                              teacher.joiningDate,
                            ).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            teacher.status === 'active'
                              ? 'bg-cyan-400/10 text-cyan-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {teacher.status || 'unknown'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(teacher)}
                            className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-300/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(teacher)}
                            className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-8 text-center text-xs text-white/30">
          Al-Noor Maktab Management System
        </footer>
      </main>
    </div>
  )
}

export default Teachers