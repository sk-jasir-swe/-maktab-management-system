import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../services/api'
import '../../../App.css'

function StudentDetails() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [classTimeFilter, setClassTimeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        setError('')

        const response = await apiRequest('/students')
        setStudents(response.students || [])
      } catch (err) {
        setError(err.message || 'Unable to load students.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesName = (student.name || '')
        .toLowerCase()
        .includes(search.trim().toLowerCase())

      const matchesClassTime =
        classTimeFilter === 'all' ||
        student.classTime === classTimeFilter

      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter

      return matchesName && matchesClassTime && matchesStatus
    })
  }, [students, search, classTimeFilter, statusFilter])

  function formatClassTime(value) {
    const labels = {
      morning: 'Morning',
      after_asr: 'After Asr',
      after_maghrib: 'After Maghrib',
    }

    return labels[value] || value || '—'
  }

  function formatDate(value) {
    if (!value) return '—'

    const date = new Date(value)

    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString()
  }

  const detailFields = selectedStudent
    ? [
        ['Student Name', selectedStudent.name],
        ['Father Name', selectedStudent.fatherName],
        ['Mother Name', selectedStudent.motherName],
        ['Date of Birth', formatDate(selectedStudent.dateOfBirth)],
        ['Gender', selectedStudent.gender],
        ['Phone Number', selectedStudent.phone],
        ['WhatsApp Number', selectedStudent.whatsappNumber],
        ['Address', selectedStudent.address],
        ['Class Time', formatClassTime(selectedStudent.classTime)],
        ['Admission Date', formatDate(selectedStudent.admissionDate)],
        ['Status', selectedStudent.status],
      ]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] text-white">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8">
          <Link
            to="/admin/dashboard"
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Student Details
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Search students by name and view their complete records.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name..."
            aria-label="Search by student name"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/50"
          />

          <select
            value={classTimeFilter}
            onChange={(event) => setClassTimeFilter(event.target.value)}
            aria-label="Filter by class time"
            className="rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none focus:border-cyan-300/50"
          >
            <option value="all">All Class Timings</option>
            <option value="morning">Morning</option>
            <option value="after_asr">After Asr</option>
            <option value="after_maghrib">After Maghrib</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by student status"
            className="rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none focus:border-cyan-300/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </section>

        <section className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-white/55">
            {loading
              ? 'Loading students...'
              : `${filteredStudents.length} student(s) found`}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setClassTimeFilter('all')
              setStatusFilter('all')
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
          >
            Clear Filters
          </button>
        </section>

        {/* Student list */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-semibold">No students found</p>
              <p className="mt-2 text-sm text-white/45">
                Try changing the name or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Father Name</th>
                    <th className="px-6 py-4">WhatsApp</th>
                    <th className="px-6 py-4">Class Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="transition hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-medium">
                        {student.name || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {student.fatherName || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {student.whatsappNumber || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {formatClassTime(student.classTime)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            student.status === 'active'
                              ? 'bg-cyan-400/10 text-cyan-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {student.status || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-300/10"
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

        {/* Full details modal */}
        {selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-details-title"
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111935] p-6 shadow-2xl sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Student Record
                  </p>

                  <h2
                    id="student-details-title"
                    className="mt-2 text-2xl font-bold"
                  >
                    {selectedStudent.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close student details"
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {selectedStudent.photo?.url && (
                <img
                  src={selectedStudent.photo.url}
                  alt={selectedStudent.name}
                  className="mt-6 h-28 w-28 rounded-2xl border border-white/10 object-cover"
                />
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {detailFields.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs text-white/40">{label}</p>
                    <p className="mt-2 break-words text-sm font-medium text-white/90">
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="mt-7 rounded-xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
              >
                Close Details
              </button>
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

export default StudentDetails