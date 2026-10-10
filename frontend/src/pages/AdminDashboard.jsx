import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import '../App.css'

function AdminDashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await apiRequest('/dashboard')
        setDashboardData(response.data ?? response)
      } catch (err) {
        setError(err.message || 'Unable to load dashboard.')

        if (
          err.message?.toLowerCase().includes('token') ||
          err.message?.toLowerCase().includes('unauthorized')
        ) {
          navigate('/admin/login', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [navigate])

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await apiRequest('/admin/logout', {
        method: 'POST',
      })

      navigate('/admin/login', { replace: true })
    } catch (err) {
      setError(err.message || 'Logout failed. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  const menuItems = [
    {
      title: 'Students',
      description: 'Manage student records and profiles.',
      path: '/admin/students',
      icon: '👨‍🎓',
    },
    {
      title: 'Teachers',
      description: 'Manage teachers and their details.',
      path: '/admin/teachers',
      icon: '👨‍🏫',
    },
    {
      title: 'Admissions',
      description: 'Review pending admission applications.',
      path: '/admin/admissions',
      icon: '📝',
    },
    {
      title: 'Fee Payments',
      description: 'Manage admission, monthly and exam fees.',
      path: '/admin/fees',
      icon: '💰',
    },
    {
      title: 'Salary Payments',
      description: 'Manage teacher salary payment records.',
      path: '/admin/salaries',
      icon: '💵',
    },
    {
      title: 'Exams & Results',
      description: 'Manage examinations and student results.',
      path: '/admin/exams',
      icon: '📚',
    },
    {
      title: 'Notices',
      description: 'Publish and manage important notices.',
      path: '/admin/notices',
      icon: '📢',
    },
    {
      title: 'Reports',
      description: 'View financial and student reports.',
      path: '/admin/reports',
      icon: '📊',
    },
  ]

  function getValue(...keys) {
    const sources = [
      dashboardData,
      dashboardData?.stats,
      dashboardData?.summary,
    ]

    for (const source of sources) {
      if (!source) continue

      for (const key of keys) {
        if (source[key] !== undefined && source[key] !== null) {
          return source[key]
        }
      }
    }

    return '—'
  }

  const stats = [
    {
      title: 'Total Students',
      value: getValue('totalStudents', 'studentsCount'),
      icon: '🎓',
    },
    {
      title: 'Total Teachers',
      value: getValue('totalTeachers', 'teachersCount'),
      icon: '👨‍🏫',
    },
    {
      title: 'Pending Admissions',
      value: getValue('pendingAdmissions', 'pendingAdmissionCount'),
      icon: '📋',
    },
   {
  title: 'Monthly Fee Collection',
  value: `₹${getValue('monthlyFeeCollection')}`,
  icon: '💰',
},
  ]

  return (
    <div className="min-h-screen bg-[#071711] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <header className="border-b border-white/10 bg-white/3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-2xl text-emerald-300">
                ☪
              </div>

              <div>
                <h1 className="text-lg font-bold sm:text-xl">
                  Al-Noor Maktab
                </h1>

                <p className="text-xs text-white/45">
                  Administration Panel
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/20 disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout ↗'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Welcome */}
          <section className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Admin Overview
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Welcome Back, Admin!
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/50">
              Manage students, teachers, admissions, fee payments,
              examinations and other Maktab activities from one place.
            </p>
          </section>

          {/* Loading */}
          {loading && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/4 p-6 text-white/60">
              Loading dashboard data...
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {/* Statistics */}
          <section className="mb-12">
            <h3 className="mb-5 text-xl font-semibold">
              Overview
            </h3>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/55">
                      {stat.title}
                    </p>

                    <span className="text-2xl">
                      {stat.icon}
                    </span>
                  </div>

                  <p className="mt-5 text-3xl font-bold text-emerald-300">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Management Modules */}
          <section>
            <div className="mb-5">
              <h3 className="text-xl font-semibold">
                Management
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Select a module to manage its records.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className="group rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-emerald-300/6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl transition group-hover:border-emerald-300/20 group-hover:bg-emerald-300/10">
                    {item.icon}
                  </div>

                  <h4 className="mt-5 text-lg font-semibold">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {item.description}
                  </p>

                  <p className="mt-5 text-sm font-medium text-emerald-300">
                    Open module →
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-14 border-t border-white/10 pt-6 text-center text-sm text-white/35">
            Al-Noor Maktab Management System
          </footer>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard