import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'

const reports = [
  { id: 'fees', label: 'Fee Collection', endpoint: '/reports/fees' },
  {
    id: 'monthly',
    label: 'Monthly Fees',
    endpoint: '/reports/fees/monthly',
  },
  {
    id: 'salaries',
    label: 'Teacher Salaries',
    endpoint: '/reports/salaries',
  },
  {
    id: 'students',
    label: 'Students',
    endpoint: '/reports/students',
  },
  {
    id: 'admissions',
    label: 'Admissions',
    endpoint: '/reports/admissions',
  },
]

function Reports() {
  const [activeTab, setActiveTab] = useState('fees')
  const [refreshKey, setRefreshKey] = useState(0)
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let ignore = false
    const selectedReport = reports.find((report) => report.id === activeTab)

    async function fetchReport() {
      if (!selectedReport) return

      try {
        const response = await apiRequest(selectedReport.endpoint)
        const data = response.data
        let nextReportData
        let nextSummary = null

        if (activeTab === 'students') {
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Invalid student report data.')
          }

          nextSummary = data
          nextReportData = [
            {
              label: 'Total Students',
              count: data.totalStudents ?? 0,
            },
            {
              label: 'Active Students',
              count: data.activeStudents ?? 0,
            },
            {
              label: 'Inactive Students',
              count: data.inactiveStudents ?? 0,
            },
          ]
        } else if (Array.isArray(data)) {
          nextReportData = data
        } else {
          throw new Error('Invalid report data received from server.')
        }

        if (!ignore) {
          setSummary(nextSummary)
          setReportData(nextReportData)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Unable to load report.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchReport()

    return () => {
      ignore = true
    }
  }, [activeTab, refreshKey])

  function prepareReportLoad() {
    setLoading(true)
    setError('')
    setReportData([])
    setSummary(null)
  }

  function handleReportChange(tab) {
    if (tab === activeTab) return

    prepareReportLoad()
    setActiveTab(tab)
  }

  function handleRefresh() {
    prepareReportLoad()
    setRefreshKey((key) => key + 1)
  }

  function formatAmount(value) {
    return Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    })
  }

  function formatMonth(month) {
    if (!month) return '—'

    return new Date(2000, Number(month) - 1, 1).toLocaleDateString(
      'en-IN',
      { month: 'long' },
    )
  }

  function getStatusClass(status) {
    if (['paid', 'accepted', 'active'].includes(status)) {
      return 'bg-cyan-400/10 text-cyan-300'
    }

    if (status === 'pending') {
      return 'bg-amber-400/10 text-amber-300'
    }

    if (['rejected', 'cancelled', 'inactive'].includes(status)) {
      return 'bg-red-400/10 text-red-300'
    }

    return 'bg-white/10 text-white/60'
  }

  function getStatusLabel(status) {
    if (!status) return 'Unknown'

    return String(status).charAt(0).toUpperCase() + String(status).slice(1)
  }

  function getReportColumns() {
    switch (activeTab) {
      case 'fees':
        return [
          {
            label: 'Payment Status',
            render: (item) => getStatusLabel(item._id),
            isStatus: true,
          },
          {
            label: 'Total Amount',
            render: (item) => formatAmount(item.totalAmount),
          },
          {
            label: 'Total Payments',
            render: (item) => item.totalPayments ?? 0,
          },
        ]

      case 'monthly':
        return [
          {
            label: 'Month',
            render: (item) => formatMonth(item._id?.month),
          },
          {
            label: 'Year',
            render: (item) => item._id?.year ?? '—',
          },
          {
            label: 'Total Collection',
            render: (item) => formatAmount(item.totalAmount),
          },
          {
            label: 'Total Payments',
            render: (item) => item.totalPayments ?? 0,
          },
        ]

      case 'salaries':
        return [
          {
            label: 'Salary Status',
            render: (item) => getStatusLabel(item._id),
            isStatus: true,
          },
          {
            label: 'Total Salary Amount',
            render: (item) => formatAmount(item.totalAmount),
          },
          {
            label: 'Total Payments',
            render: (item) => item.totalPayments ?? 0,
          },
        ]

      case 'students':
        return [
          {
            label: 'Category',
            render: (item) => item.label,
          },
          {
            label: 'Number of Students',
            render: (item) => item.count,
          },
        ]

      case 'admissions':
        return [
          {
            label: 'Admission Status',
            render: (item) => getStatusLabel(item._id),
            isStatus: true,
          },
          {
            label: 'Total Admissions',
            render: (item) => item.totalAdmissions ?? 0,
          },
        ]

      default:
        return []
    }
  }

  const columns = getReportColumns()

  const filteredData = reportData.filter((item) => {
    const searchText = search.trim().toLowerCase()

    if (!searchText) return true

    return JSON.stringify(item).toLowerCase().includes(searchText)
  })

  const currentReport = reports.find(
    (report) => report.id === activeTab,
  )

  // Collected amount mein sirf paid fees/salaries count hongi.
  const totalAmount = reportData.reduce((total, item) => {
    if (activeTab === 'fees' || activeTab === 'salaries') {
      return total + (
        item._id === 'paid' ? Number(item.totalAmount || 0) : 0
      )
    }

    if (activeTab === 'monthly') {
      return total + Number(item.totalAmount || 0)
    }

    return total
  }, 0)

  // Sirf paid payments ka count.
  const totalPayments = reportData.reduce((total, item) => {
    if (activeTab === 'fees' || activeTab === 'salaries') {
      return total + (
        item._id === 'paid' ? Number(item.totalPayments || 0) : 0
      )
    }

    if (activeTab === 'monthly') {
      return total + Number(item.totalPayments || 0)
    }

    return total
  }, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-9">
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
            Reports Management
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Review fee collections, salaries, students and admissions.
          </p>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Report selection */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <button
              type="button"
              key={report.id}
              onClick={() => {
                handleReportChange(report.id)
                setSearch('')
              }}
              className={`rounded-2xl border p-5 text-left backdrop-blur-xl transition ${
                activeTab === report.id
                  ? 'border-cyan-300/40 bg-cyan-400/10'
                  : 'border-white/10 bg-white/[0.04] hover:border-cyan-300/20 hover:bg-white/[0.06]'
              }`}
            >
              <p className="text-sm text-white/50">Report</p>

              <h2 className="mt-3 text-lg font-semibold">
                {report.label}
              </h2>

              <p className="mt-2 text-xs text-white/40">
                {activeTab === report.id
                  ? 'Currently viewing'
                  : 'Click to view report'}
              </p>
            </button>
          ))}
        </section>

        {/* Summary cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">Report Type</p>

            <p className="mt-3 text-xl font-semibold text-cyan-300">
              {currentReport?.label}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="text-sm text-white/50">
              {activeTab === 'students' ? 'Total Students' : 'Report Categories'}
            </p>

            <p className="mt-3 text-3xl font-bold text-cyan-300">
              {loading
                ? '...'
                : activeTab === 'students'
                  ? summary?.totalStudents ?? 0
                  : reportData.length}
            </p>
          </div>

          {(activeTab === 'fees' ||
            activeTab === 'monthly' ||
            activeTab === 'salaries') && (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <p className="text-sm text-white/50">
                  {activeTab === 'salaries'
                    ? 'Paid Salary Amount'
                    : 'Total Collection'}
                </p>

                <p className="mt-3 text-2xl font-bold text-cyan-300">
                  {loading ? '...' : formatAmount(totalAmount)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <p className="text-sm text-white/50">
                  {activeTab === 'salaries'
                    ? 'Paid Salary Payments'
                    : 'Paid Payments'}
                </p>

                <p className="mt-3 text-2xl font-bold text-cyan-300">
                  {loading ? '...' : totalPayments}
                </p>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <p className="text-sm text-white/50">Active Students</p>

                <p className="mt-3 text-3xl font-bold text-cyan-300">
                  {loading ? '...' : summary?.activeStudents ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
                <p className="text-sm text-white/50">Inactive Students</p>

                <p className="mt-3 text-3xl font-bold text-cyan-300">
                  {loading ? '...' : summary?.inactiveStudents ?? 0}
                </p>
              </div>
            </>
          )}
        </section>

        {/* Report table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {currentReport?.label}
              </h2>

              <p className="mt-1 text-sm text-white/45">
                {filteredData.length} record(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report..."
                className="min-w-0 rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
              />

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10 disabled:opacity-50"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading report...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-200">
              Report load nahi ho payi. Refresh karke try karo.
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">📊</div>

              <h3 className="mt-4 text-lg font-semibold">
                No report data found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Abhi is report mein data available nahi hai, ya search se match nahi mila.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.label}
                        className="px-6 py-4 font-medium"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredData.map((item, index) => (
                    <tr
                      key={item._id ?? item.label ?? index}
                      className="transition hover:bg-white/[0.025]"
                    >
                      {columns.map((column) => {
                        const value = column.render(item)

                        return (
                          <td
                            key={column.label}
                            className="px-6 py-4 text-white/65"
                          >
                            {column.isStatus ? (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                  item._id,
                                )}`}
                              >
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </td>
                        )
                      })}
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

export default Reports