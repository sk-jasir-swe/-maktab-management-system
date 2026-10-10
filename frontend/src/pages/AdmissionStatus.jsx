import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'

function AdmissionStatus() {
  const [formData, setFormData] = useState({
    applicationNumber: '',
    phone: '',
  })

  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setApplication(null)

    try {
      const response = await apiRequest('/admissions/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationNumber: formData.applicationNumber.trim().toUpperCase(),
          phone: formData.phone.trim(),
        }),
      })

      setApplication(response)
    } catch (error) {
      setError(
        error.message ||
          'Unable to check application status. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const status = application?.status?.toLowerCase()

  const statusClasses = {
    pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    accepted: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-red-400/30 bg-red-400/10 text-red-300',
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10'

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] px-4 py-12 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl">
        <Link
          to="/"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Home
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-300">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Application Tracking
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Check Admission Status
          </h1>

          <p className="mt-3 leading-7 text-white/55">
            Enter your application number and registered phone number to
            check your latest admission status.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="applicationNumber"
                className="text-sm font-medium text-white/75"
              >
                Admission Number *
              </label>

              <input
                id="applicationNumber"
                name="applicationNumber"
                type="text"
                value={formData.applicationNumber}
                onChange={handleChange}
                placeholder="MKT-2026-A1B2C3D4"
                className={inputClass}
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-medium text-white/75"
              >
                Registered Phone Number *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter registered phone number"
                className={inputClass}
                autoComplete="tel"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-6 py-3.5 font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Checking Status...' : 'Check Status →'}
            </button>
          </form>

          {application && (
            <div
              className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5"
              aria-live="polite"
            >
              <p className="text-sm text-white/50">Admission Number</p>

              <p className="mt-1 break-all font-semibold text-cyan-300">
                {application.applicationNumber}
              </p>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-sm text-white/50">Student Name</p>

                <p className="mt-1 text-lg font-semibold">
                  {application.studentName}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm text-white/50">Current Status</p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-4 py-2 text-sm font-bold capitalize ${
                    statusClasses[status] ||
                    'border-white/20 bg-white/10 text-white'
                  }`}
                >
                  {status || 'Unknown'}
                </span>
              </div>

              {status === 'pending' && (
                <p className="mt-5 text-sm leading-6 text-amber-200/80">
                  Your application is under review. Please check again later.
                </p>
              )}

              {status === 'accepted' && (
                <p className="mt-5 text-sm leading-6 text-emerald-200/80">
                  Congratulations! Your admission application has been
                  accepted.
                </p>
              )}

              {status === 'rejected' && (
                <p className="mt-5 text-sm leading-6 text-red-200/80">
                  Your application has been rejected. Please contact the
                  Maktab administration for further information.
                </p>
              )}

              {application.updatedAt && (
                <p className="mt-5 text-xs text-white/40">
                  Last updated:{' '}
                  {new Date(application.updatedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Al-Noor Maktab
        </p>
      </div>
    </div>
  )
}

export default AdmissionStatus