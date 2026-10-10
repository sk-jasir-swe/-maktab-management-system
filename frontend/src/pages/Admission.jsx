import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'
import '../App.css'

const initialFormData = {
  studentName: '',
  fatherName: '',
  motherName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  address: '',
  classTime: '',
}

function Admission() {
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applicationNumber, setApplicationNumber] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) return

    setLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const generatedNumber =
        response?.applicationNumber ||
        response?.admission?.applicationNumber

      if (!generatedNumber) {
        throw new Error(
          'Application number was not returned by the server. Please contact the Maktab.',
        )
      }

      setApplicationNumber(generatedNumber)
      setFormData(initialFormData)
    } catch (err) {
      setError(
        err.message ||
          'Unable to submit your application. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyApplicationNumber() {
    try {
      await navigator.clipboard.writeText(applicationNumber)
      alert('Application number copied!')
    } catch {
      setError('Unable to copy. Please note your application number manually.')
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10'

  const labelClass = 'text-sm font-medium text-white/75'

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed px-4 py-10 text-white sm:px-6">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            ← Back to Home
          </Link>

          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-xs text-cyan-200">
            Admission Application
          </span>
        </div>

        {/* Success screen */}
        {applicationNumber ? (
          <div className="rounded-3xl border border-emerald-300/20 bg-white/6 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-3xl text-emerald-300">
              ✓
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Application Submitted
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Application Received!
            </h1>

            <p className="mt-3 leading-7 text-white/60">
              Your admission application has been submitted successfully.
              Please save your application number to check your status later.
            </p>

            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-cyan-300/20 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Your Application Number
              </p>

              <p
                className="mt-3 break-all text-2xl font-extrabold tracking-wider text-cyan-300"
                aria-live="polite"
              >
                {applicationNumber}
              </p>

              <button
                type="button"
                onClick={copyApplicationNumber}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Copy Application Number
              </button>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/admission-status"
                className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300"
              >
                Check Application Status →
              </Link>

              <Link
                to="/"
                className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/40">
              Use this application number and your registered phone number
              to check whether your application is Pending, Accepted, or
              Rejected.
            </p>
          </div>
        ) : (
          /* Admission form */
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-300">
                ☪
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Join Our Maktab
              </p>

              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Admission Form
              </h1>

              <p className="mt-3 leading-7 text-white/50">
                Please provide the student's details to submit an admission
                application. The application will be reviewed by the admin.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Student name */}
                <div>
                  <label className={labelClass} htmlFor="studentName">
                    Student Name *
                  </label>

                  <input
                    className={inputClass}
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    autoComplete="name"
                    required
                  />
                </div>

                {/* Date of birth */}
                <div>
                  <label className={labelClass} htmlFor="dateOfBirth">
                    Date of Birth *
                  </label>

                  <input
                    className={inputClass}
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Father's name */}
                <div>
                  <label className={labelClass} htmlFor="fatherName">
                    Father's Name *
                  </label>

                  <input
                    className={inputClass}
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    required
                  />
                </div>

                {/* Mother's name */}
                <div>
                  <label className={labelClass} htmlFor="motherName">
                    Mother's Name *
                  </label>

                  <input
                    className={inputClass}
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={labelClass} htmlFor="gender">
                    Gender *
                  </label>

                  <select
                    className={inputClass}
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled className="bg-[#111935]">
                      Select gender
                    </option>

                    <option value="male" className="bg-[#111935]">
                      Male
                    </option>

                    <option value="female" className="bg-[#111935]">
                      Female
                    </option>

                    <option value="other" className="bg-[#111935]">
                      Other
                    </option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone Number *
                  </label>

                  <input
                    className={inputClass}
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* Class timing */}
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="classTime">
                    Preferred Class Timing *
                  </label>

                  <select
                    className={inputClass}
                    id="classTime"
                    name="classTime"
                    value={formData.classTime}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled className="bg-[#111935]">
                      Select class timing
                    </option>

                    <option value="morning" className="bg-[#111935]">
                      Morning
                    </option>

                    <option value="after_asr" className="bg-[#111935]">
                      After Asr
                    </option>

                    <option value="after_maghrib" className="bg-[#111935]">
                      After Maghrib
                    </option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="address">
                    Full Address *
                  </label>

                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-cyan-400 px-6 py-3.5 font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Submitting Application...' : 'Submit Application →'}
              </button>

              <p className="mt-4 text-center text-xs leading-6 text-white/40">
                Your application will remain pending until the admin reviews
                it. Submitting this form does not guarantee admission.
              </p>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Al-Noor Maktab
        </p>
      </div>
    </div>
  )
}

export default Admission