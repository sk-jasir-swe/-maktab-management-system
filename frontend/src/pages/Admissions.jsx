import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'
import '../App.css'

function Admissions() {
  const [admissions, setAdmissions] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAdmission, setSelectedAdmission] = useState(null)

  useEffect(() => {
    fetchAdmissions()
  }, [])

  async function fetchAdmissions() {
    try {
      setLoading(true)
      setError('')

      const response = await apiRequest('/admissions')

      setAdmissions(response.admissions || [])
    } catch (err) {
      setError(err.message || 'Unable to load admissions.')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(admission, status) {
    const action = status === 'accepted' ? 'accept' : 'reject'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the admission of ${admission.studentName}?`,
    )

    if (!confirmed) return

    try {
      setProcessingId(admission._id)
      setError('')
      setSuccess('')

      const response = await apiRequest(
        `/admissions/${admission._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      )

      setAdmissions((previous) =>
        previous.map((item) =>
          item._id === admission._id
            ? { ...item, status: response.admission?.status || status }
            : item,
        ),
      )

      if (selectedAdmission?._id === admission._id) {
        setSelectedAdmission((previous) => ({
          ...previous,
          status: response.admission?.status || status,
        }))
      }

      setSuccess(
        response.message ||
          (status === 'accepted'
            ? 'Admission accepted successfully.'
            : 'Admission rejected successfully.'),
      )
    } catch (err) {
      setError(err.message || 'Unable to update admission status.')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredAdmissions = admissions.filter((admission) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch = [
      admission.studentName,
      admission.fatherName,
      admission.phone,
    ].some((value) =>
      String(value || '').toLowerCase().includes(searchText),
    )

    const matchesStatus =
      filterStatus === 'all' || admission.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const pendingCount = admissions.filter(
    (item) => item.status === 'pending',
  ).length

  const acceptedCount = admissions.filter(
    (item) => item.status === 'accepted',
  ).length

  const rejectedCount = admissions.filter(
    (item) => item.status === 'rejected',
  ).length

  const stats = [
    {
      label: 'Total Applications',
      value: admissions.length,
      icon: '📋',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: '⏳',
    },
    {
      label: 'Accepted',
      value: acceptedCount,
      icon: '✅',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: '❌',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071711] text-white">
      {/* Background */}
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
              Admissions Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Review applications and manage admission decisions.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdmissions}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
          >
            ↻ Refresh Applications
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
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-emerald-300">
                {loading ? '...' : item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Search and Filter */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name, father name or phone..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-emerald-300/40"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b2018] px-4 py-3 text-white outline-none focus:border-emerald-300/40"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </section>

        {/* Admissions Table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">Admission Applications</h2>

            <span className="text-sm text-white/45">
              {filteredAdmissions.length} application(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading applications...
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">📋</div>

              <h3 className="mt-4 text-lg font-semibold">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Try another filter or check again later.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="bg-white/3 text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Father Name</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Class Time</th>
                    <th className="px-6 py-4 font-medium">Applied On</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/6">
                  {filteredAdmissions.map((admission) => (
                    <tr
                      key={admission._id}
                      className="transition hover:bg-white/2.5"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">
                          {admission.studentName}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {admission.gender || '—'}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {admission.fatherName || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {admission.phone || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {admission.classTime === 'after_asr'
                          ? 'After Asr'
                          : admission.classTime === 'after_maghrib'
                            ? 'After Maghrib'
                            : admission.classTime === 'morning'
                              ? 'Morning'
                              : admission.classTime || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {admission.createdAt
                          ? new Date(admission.createdAt).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            admission.status === 'accepted'
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : admission.status === 'rejected'
                                ? 'bg-red-400/10 text-red-300'
                                : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {admission.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAdmission(admission)}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
                          >
                            View
                          </button>

                          {admission.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={processingId === admission._id}
                                onClick={() =>
                                  updateStatus(admission, 'accepted')
                                }
                                className="rounded-lg border border-emerald-300/20 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-300/10 disabled:opacity-50"
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                disabled={processingId === admission._id}
                                onClick={() =>
                                  updateStatus(admission, 'rejected')
                                }
                                className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Admission Details Modal */}
        {selectedAdmission && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedAdmission(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="admission-details-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b2018] p-6 shadow-2xl sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Application Details
                  </p>

                  <h2
                    id="admission-details-title"
                    className="mt-2 text-2xl font-bold"
                  >
                    {selectedAdmission.studentName}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {[
                  ['Student Name', selectedAdmission.studentName],
                  ['Father Name', selectedAdmission.fatherName],
                  ['Mother Name', selectedAdmission.motherName],
                  ['Date of Birth', selectedAdmission.dateOfBirth
                    ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString()
                    : '—'],
                  ['Gender', selectedAdmission.gender],
                  ['Phone', selectedAdmission.phone],
                  ['Class Time', selectedAdmission.classTime],
                  ['Status', selectedAdmission.status],
                  ['Address', selectedAdmission.address],
                  ['Application Date', selectedAdmission.createdAt
                    ? new Date(selectedAdmission.createdAt).toLocaleDateString()
                    : '—'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/3 p-4"
                  >
                    <p className="text-xs text-white/40">{label}</p>

                    <p className="mt-2 wrap-break-word text-sm font-medium text-white/85">
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {selectedAdmission.status === 'pending' && (
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={processingId === selectedAdmission._id}
                    onClick={() =>
                      updateStatus(selectedAdmission, 'accepted')
                    }
                    className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-[#071711] transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    Accept Admission
                  </button>

                  <button
                    type="button"
                    disabled={processingId === selectedAdmission._id}
                    onClick={() =>
                      updateStatus(selectedAdmission, 'rejected')
                    }
                    className="rounded-xl border border-red-400/20 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                  >
                    Reject Admission
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-white/30">
          Al-Noor Maktab Management System
        </footer>
      </main>
    </div>
  )
}

export default Admissions