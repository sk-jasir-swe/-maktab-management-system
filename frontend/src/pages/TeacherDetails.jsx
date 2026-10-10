import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'
import '../App.css'

function TeacherDetails() {
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTeachers()
  }, [])

  async function loadTeachers() {
    try {
      setLoading(true)
      setError('')

      const response = await apiRequest('/teachers')
      setTeachers(response.teachers || [])
    } catch (err) {
      setError(err.message || 'Unable to load teacher details.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return teachers.filter((teacher) => {
      const matchesName = (teacher.name || '')
        .toLowerCase()
        .includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        teacher.status === statusFilter

      return matchesName && matchesStatus
    })
  }, [teachers, search, statusFilter])

  function formatDate(date) {
    if (!date) return 'Not provided'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not provided'
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function DetailItem({ label, value }) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">
          {label}
        </p>

        <p className="mt-2 break-words text-sm font-medium text-white/90">
          {value || 'Not provided'}
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">
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
              Teacher Details
            </h1>

            <p className="mt-3 text-sm text-white/50">
              Search teachers and view their complete profiles.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTeachers}
            disabled={loading}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </header>

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">Total Teachers</p>
            <p className="mt-3 text-3xl font-bold text-cyan-300">
              {loading ? '...' : teachers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">Active Teachers</p>
            <p className="mt-3 text-3xl font-bold text-emerald-300">
              {loading
                ? '...'
                : teachers.filter(
                    (teacher) => teacher.status === 'active',
                  ).length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">Inactive Teachers</p>
            <p className="mt-3 text-3xl font-bold text-amber-300">
              {loading
                ? '...'
                : teachers.filter(
                    (teacher) => teacher.status === 'inactive',
                  ).length}
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-6 grid gap-4 sm:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search teacher by name..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none focus:border-cyan-300/50"
          >
            <option value="all">All Teachers</option>
            <option value="active">Active Teachers</option>
            <option value="inactive">Inactive Teachers</option>
          </select>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Teacher List */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Teacher Directory
            </h2>

            <span className="text-sm text-white/45">
              {filteredTeachers.length} teacher(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading teacher details...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">👨‍🏫</div>

              <h3 className="mt-4 text-lg font-semibold">
                No teachers found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Try another name or change the status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Teacher
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Subject
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Phone
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Details
                    </th>
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
                              className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-lg font-bold text-cyan-300">
                              {teacher.name
                                ?.charAt(0)
                                ?.toUpperCase() || '?'}
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

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            teacher.status === 'active'
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {teacher.status || 'unknown'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedTeacher(teacher)}
                          className="rounded-lg border border-cyan-300/20 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-300/10"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Teacher Details Modal */}
        {selectedTeacher && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedTeacher(null)
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-details-title"
              className="my-6 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#10172f] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                <div>
                  <h2
                    id="teacher-details-title"
                    className="text-xl font-bold"
                  >
                    Full Teacher Details
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    Complete teacher profile
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeacher(null)}
                  aria-label="Close teacher details"
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/70 transition hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Profile */}
              <div className="p-6 sm:p-8">
                <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:text-left">
                  {selectedTeacher.photo?.url ? (
                    <img
                      src={selectedTeacher.photo.url}
                      alt={selectedTeacher.name}
                      className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-cyan-400/10 text-4xl font-bold text-cyan-300">
                      {selectedTeacher.name
                        ?.charAt(0)
                        ?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold">
                      {selectedTeacher.name}
                    </h3>

                    <p className="mt-2 text-sm text-cyan-300">
                      {selectedTeacher.subject || 'Subject not provided'}
                    </p>

                    <span
                      className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        selectedTeacher.status === 'active'
                          ? 'bg-emerald-400/10 text-emerald-300'
                          : 'bg-amber-400/10 text-amber-300'
                      }`}
                    >
                      {selectedTeacher.status || 'unknown'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Teacher Name"
                    value={selectedTeacher.name}
                  />

                  <DetailItem
                    label="Subject"
                    value={selectedTeacher.subject}
                  />

                  <DetailItem
                    label="Phone Number"
                    value={selectedTeacher.phone}
                  />

                  <DetailItem
                    label="WhatsApp Number"
                    value={selectedTeacher.whatsappNumber}
                  />

                  <DetailItem
                    label="Email Address"
                    value={selectedTeacher.email}
                  />

                  <DetailItem
                    label="Joining Date"
                    value={formatDate(selectedTeacher.joiningDate)}
                  />

                  <DetailItem
                    label="Account Status"
                    value={
                      selectedTeacher.status
                        ? selectedTeacher.status
                            .charAt(0)
                            .toUpperCase() +
                          selectedTeacher.status.slice(1)
                        : 'Not provided'
                    }
                  />

                  <DetailItem
                    label="Record Created"
                    value={formatDate(selectedTeacher.createdAt)}
                  />

                  <div className="sm:col-span-2">
                    <DetailItem
                      label="Address"
                      value={selectedTeacher.address}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-7 flex flex-wrap justify-end gap-3">
                  {selectedTeacher.whatsappNumber && (
                    <a
                      href={`https://wa.me/91${selectedTeacher.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                    >
                      Open WhatsApp
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(null)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-white/30">
          Al-Noor Maktab Management System
        </footer>
      </main>
    </div>
  )
}

export default TeacherDetails