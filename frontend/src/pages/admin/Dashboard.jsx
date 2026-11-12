import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { resetAdminVerification } from '../../services/adminAuth'
import '../../App.css'
import InstitutionLogo from '../../components/InstitutionLogo'

function AdminDashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)


  // Fetch dashboard statistics
  useEffect(() => {
    let active = true

    async function fetchDashboard() {
      try {
        const response = await apiRequest('/dashboard')

        if (active) {
          setDashboardData(response.data ?? response)
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Unable to load dashboard.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])


  // Logout
  async function handleLogout() {
    if (loggingOut) return

    try {
      setLoggingOut(true)
      setError('')

      await apiRequest('/admin/logout', {
        method: 'POST',
      })

      // Clear cached admin verification.
      resetAdminVerification()

      navigate('/admin/login', {
        replace: true,
      })
    } catch (err) {
      setError(
        err.message || 'Logout failed. Please try again.'
      )
    } finally {
      setLoggingOut(false)
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    setPasswordError('')

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setChangingPassword(true)

    try {
      const response = await apiRequest('/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      resetAdminVerification()
      navigate('/admin/login', {
        replace: true,
        state: { message: response.message },
      })
    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.')
    } finally {
      setChangingPassword(false)
    }
  }


  // Dashboard navigation cards
  const menuItems = [
    {
      title: 'Students',
      description: 'Manage student records and profiles.',
      path: '/admin/students',
      icon: '👨‍🎓',
    },
    {
      title: 'Student Details',
      description: 'Search students by name and view their full details.',
      path: '/admin/student-details',
      icon: '🔎',
    },
    {
      title: 'Teachers',
      description: 'Manage teachers and their details.',
      path: '/admin/teachers',
      icon: '👨‍🏫',
    },
    {
      title: 'Teacher Details',
      description: 'Search teachers and view their complete profiles, phone and WhatsApp details.',
      path: '/admin/teacher-details',
      icon: '📋',
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


  // Read statistics from the API response.
  function getValue(...keys) {
    const sources = [
      dashboardData,
      dashboardData?.stats,
      dashboardData?.summary,
    ]

    for (const source of sources) {
      if (!source) continue

      for (const key of keys) {
        if (
          source[key] !== undefined &&
          source[key] !== null
        ) {
          return source[key]
        }
      }
    }

    return '—'
  }


  const stats = [
    {
      title: 'Total Students',
      value: getValue(
        'totalStudents',
        'studentsCount'
      ),
      icon: '🎓',
    },
    {
      title: 'Total Teachers',
      value: getValue(
        'totalTeachers',
        'teachersCount'
      ),
      icon: '👨‍🏫',
    },
    {
      title: 'Pending Admissions',
      value: getValue(
        'pendingAdmissions',
        'pendingAdmissionCount'
      ),
      icon: '📋',
    },
    {
      title: 'Monthly Fee Collection',
      value: `₹${getValue('monthlyFeeCollection')}`,
      icon: '💰',
    },
  ]


  return (
    <div className="min-h-screen bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>


      <div className="relative z-10">

        {/* Navbar */}
        <header className="border-b border-white/10 bg-white/3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">

            <div className="flex items-center gap-3">
              <InstitutionLogo className="h-12 w-12 rounded-2xl" />

              <div>
                <h1 className="text-lg font-bold sm:text-xl">
                  Siddiqua Deeniyat Munazzam Maktab
                </h1>

                <p className="text-xs text-white/45">
                  Administration Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPasswordError('')
                  setShowPasswordForm(true)
                }}
                className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/20 disabled:opacity-50"
              >
                {loggingOut ? 'Logging out...' : 'Logout ↗'}
              </button>
            </div>

          </div>
        </header>


        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

          {/* Welcome */}
          <section className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Admin Overview
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Welcome Back, Admin!
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/50">
              Manage students, teachers, admissions, fee payments,
              examinations and other Maktab activities from one place.
            </p>

            <div className="mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <span className="font-semibold text-cyan-200">
                {new Intl.DateTimeFormat('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Asia/Kolkata',
                }).format(currentTime)}
              </span>
              <span className="text-white/30" aria-hidden="true">·</span>
              <time>
                {new Intl.DateTimeFormat('en-IN', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Asia/Kolkata',
                }).format(currentTime)} IST
              </time>
            </div>
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
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/55">
                      {stat.title}
                    </p>

                    <span className="text-2xl">
                      {stat.icon}
                    </span>
                  </div>

                  <p className="mt-5 text-3xl font-bold text-cyan-300">
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
                  className="group rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/10">
                    {item.icon}
                  </div>

                  <h4 className="mt-5 text-lg font-semibold">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {item.description}
                  </p>

                  <p className="mt-5 text-sm font-medium text-cyan-300">
                    Open module →
                  </p>
                </Link>
              ))}
            </div>
          </section>


          {/* Footer */}
          <footer className="mt-14 border-t border-white/10 pt-6 text-center text-sm text-white/35">
            Siddiqua Deeniyat Munazzam Maktab Management System
          </footer>

        </main>
      </div>

      {showPasswordForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !changingPassword) {
              setShowPasswordForm(false)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#11162e] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="change-password-title" className="text-xl font-semibold">Change Password</h2>
                <p className="mt-2 text-sm text-white/50">
                  Verify your current password, then choose a new one.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close change password form"
                onClick={() => setShowPasswordForm(false)}
                disabled={changingPassword}
                className="rounded-lg px-2 py-1 text-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {passwordError && (
              <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              {[
                { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
                { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
                { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
              ].map((field) => (
                <label key={field.name} className="block text-sm font-medium text-white/75">
                  {field.label}
                  <input
                    name={field.name}
                    type="password"
                    required
                    minLength={field.name === 'currentPassword' ? undefined : 8}
                    autoComplete={field.autoComplete}
                    value={passwordForm[field.name]}
                    onChange={(event) => setPasswordForm((previous) => ({
                      ...previous,
                      [field.name]: event.target.value,
                    }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </label>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={changingPassword}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? 'Changing...' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
