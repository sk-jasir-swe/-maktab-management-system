import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'

const initialForm = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  status: 'active',
}

function Notices() {
  const [notices, setNotices] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    try {
      setLoading(true)
      setError('')

      const response = await apiRequest('/notices')

      setNotices(
        Array.isArray(response)
          ? response
          : response.notices || []
      )
    } catch (err) {
      setError(err.message || 'Unable to load notices.')
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
      date: new Date().toISOString().split('T')[0],
    })

    setEditingId(null)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(notice) {
    setFormData({
      title: notice.title || '',
      description: notice.description || '',
      date: notice.date
        ? new Date(notice.date).toISOString().split('T')[0]
        : '',
      status: notice.status || 'active',
    })

    setEditingId(notice._id)
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
    setFormData(initialForm)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      }

      if (editingId) {
        await apiRequest(`/notices/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        setSuccess('Notice updated successfully.')
      } else {
        await apiRequest('/notices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        setSuccess('Notice created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialForm)

      await fetchNotices()
    } catch (err) {
      setError(err.message || 'Unable to save notice.')
    } finally {
      setSaving(false)
    }
  }

  const filteredNotices = notices.filter((notice) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch = [
      notice.title,
      notice.description,
    ].some((value) =>
      String(value || '').toLowerCase().includes(searchText)
    )

    const matchesStatus =
      filterStatus === 'all' || notice.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const activeCount = notices.filter(
    (notice) => notice.status === 'active'
  ).length

  const inactiveCount = notices.filter(
    (notice) => notice.status === 'inactive'
  ).length

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/10 bg-[#0b2018] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071711] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm text-emerald-300 transition hover:text-emerald-200"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Notices Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Create, update and manage important announcements.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#071711] transition hover:bg-emerald-300"
          >
            + Create Notice
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
            className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
          >
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total Notices',
              value: notices.length,
              icon: '📢',
            },
            {
              label: 'Active Notices',
              value: activeCount,
              icon: '✅',
            },
            {
              label: 'Inactive Notices',
              value: inactiveCount,
              icon: '⏸️',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">
                  {item.label}
                </p>

                <span className="text-2xl">{item.icon}</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-emerald-300">
                {loading ? '...' : item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Create / Edit Form */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-emerald-300/20 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Notice' : 'Create New Notice'}
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Enter the notice details below.
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
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="title"
                    className="text-sm text-white/75"
                  >
                    Notice Title *
                  </label>

                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter notice title"
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="text-sm text-white/75"
                  >
                    Notice Date *
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="text-sm text-white/75"
                  >
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

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm text-white/75"
                  >
                    Description *
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter complete notice details"
                    rows={5}
                    required
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-[#071711] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Notice'
                      : 'Publish Notice'}
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
            placeholder="Search by notice title or description..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-300/40"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b2018] px-4 py-3 text-white outline-none focus:border-emerald-300/40"
          >
            <option value="all">All Notices</option>
            <option value="active">Active Notices</option>
            <option value="inactive">Inactive Notices</option>
          </select>

          <button
            type="button"
            onClick={fetchNotices}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10"
          >
            ↻ Refresh
          </button>
        </section>

        {/* Notices List */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">All Notices</h2>

            <span className="text-sm text-white/45">
              {filteredNotices.length} notice(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading notices...
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">📢</div>

              <h3 className="mt-4 text-lg font-semibold">
                No notices found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Try another search or create a new notice.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/6">
              {filteredNotices.map((notice) => (
                <article
                  key={notice._id}
                  className="p-6 transition hover:bg-white/2.5 sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {notice.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            notice.status === 'active'
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {notice.status || 'unknown'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-white/40">
                        Notice Date:{' '}
                        {notice.date
                          ? new Date(notice.date).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                          : '—'}
                      </p>

                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/65">
                        {notice.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditForm(notice)}
                      className="shrink-0 self-start rounded-lg border border-emerald-300/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-300/10"
                    >
                      Edit Notice
                    </button>
                  </div>
                </article>
              ))}
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

export default Notices