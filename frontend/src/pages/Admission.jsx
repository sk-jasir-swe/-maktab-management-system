import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import '../App.css'

const initialFormData = {
  studentName: '',
  guardianName: '',
  motherName: '',
  aadhaarNo: '',
  dateOfBirth: '',
  gender: '',
  age: '',
  permanentAddress: '',
  residentialAddress: '',
  schoolName: '',
  schoolClass: '',
  schoolHour: '',
  tuitionHour: '',
  preferredTime: '',
  phone: '',
  whatsappNumber: '',
  guardianAadhaarNo: '',
  guardianProfession: '',
  preferredCourseClass: '',
}

function Admission() {
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applicationNumber, setApplicationNumber] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    let updatedValue = value

    if (name === 'phone' || name === 'whatsappNumber') {
      updatedValue = value.replace(/\D/g, '').slice(0, 10)
    } else if (name === 'aadhaarNo' || name === 'guardianAadhaarNo') {
      updatedValue = value.replace(/\D/g, '').slice(0, 12)
    } else if (name === 'studentName') {
      updatedValue = value.toUpperCase()
    }

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) return

    // Frontend phone number validation
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must contain exactly 10 digits.')
      return
    }

    // Frontend WhatsApp number validation
    if (!/^\d{10}$/.test(formData.whatsappNumber)) {
      setError('WhatsApp number must contain exactly 10 digits.')
      return
    }

    if (formData.aadhaarNo && !/^\d{12}$/.test(formData.aadhaarNo)) {
      setError('Student Aadhaar number must contain exactly 12 digits.')
      return
    }

    if (formData.guardianAadhaarNo && !/^\d{12}$/.test(formData.guardianAadhaarNo)) {
      setError('Guardian Aadhaar number must contain exactly 12 digits.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await apiRequest('/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fatherName: formData.guardianName,
          address: formData.permanentAddress,
          classTime: formData.preferredTime,
        }),
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
      setError(
        'Unable to copy. Please note your application number manually.',
      )
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
                application. Roll No., Code No. and Form No. are assigned by
                the Maktab admin after admission is accepted.
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
                {[
                  { name: 'studentName', label: "Student's Name *", placeholder: 'Full name in capital letters', required: true, autoComplete: 'name', uppercase: true },
                  { name: 'motherName', label: "Mother's Name", placeholder: "Enter mother's full name" },
                  { name: 'aadhaarNo', label: 'Aadhar No.', placeholder: '12-digit student Aadhaar', inputMode: 'numeric', maxLength: 12 },
                  { name: 'dateOfBirth', label: 'Date of Birth *', type: 'date', required: true },
                  { name: 'age', label: 'Age', type: 'number', min: 0, max: 120 },
                  { name: 'schoolName', label: 'Name of the School', placeholder: 'If currently attending school' },
                  { name: 'schoolClass', label: 'Class', placeholder: 'School class' },
                  { name: 'schoolHour', label: 'School Hour', placeholder: 'School timing' },
                  { name: 'tuitionHour', label: 'Tuition Hour', placeholder: 'Tuition timing' },
                  { name: 'phone', label: 'Mobile No. *', placeholder: '10-digit contact number', type: 'tel', inputMode: 'numeric', pattern: '[0-9]{10}', minLength: 10, maxLength: 10, required: true, autoComplete: 'tel-national' },
                  { name: 'whatsappNumber', label: 'WhatsApp Number *', placeholder: '10-digit WhatsApp number', type: 'tel', inputMode: 'numeric', pattern: '[0-9]{10}', minLength: 10, maxLength: 10, required: true },
                  { name: 'guardianName', label: "Guardian's Name *", placeholder: 'Father / Mother / Guardian', required: true },
                  { name: 'guardianAadhaarNo', label: "Guardian's Aadhar No.", placeholder: '12-digit guardian Aadhaar', inputMode: 'numeric', maxLength: 12 },
                  { name: 'guardianProfession', label: "Guardian's Profession", placeholder: 'Business, Job, Farmer, etc.' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className={labelClass} htmlFor={field.name}>{field.label}</label>
                    <input
                      className={`${inputClass} ${field.uppercase ? 'uppercase' : ''}`}
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      inputMode={field.inputMode}
                      pattern={field.pattern}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      min={field.min}
                      max={field.max}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      required={field.required}
                    />
                  </div>
                ))}

                <div>
                  <label className={labelClass} htmlFor="gender">Gender *</label>
                  <select className={inputClass} id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="" disabled>Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="preferredTime">Preferred Time *</label>
                  <select className={inputClass} id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleChange} required>
                    <option value="" disabled>Select preferred time</option>
                    <option value="6:30 AM - 7:45 AM">6:30 AM - 7:45 AM</option>
                    <option value="7:45 AM - 9:00 AM">7:45 AM - 9:00 AM</option>
                    <option value="9:00 AM - 10:15 AM">9:00 AM - 10:15 AM</option>
                    <option value="4:00 PM - 5:15 PM">4:00 PM - 5:15 PM</option>
                    <option value="5:15 PM - 6:30 PM">5:15 PM - 6:30 PM</option>
                    <option value="6:30 PM - 7:45 PM">6:30 PM - 7:45 PM</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="preferredCourseClass">Preferred Course/Class *</label>
                  <select className={inputClass} id="preferredCourseClass" name="preferredCourseClass" value={formData.preferredCourseClass} onChange={handleChange} required>
                    <option value="" disabled>Select course/class</option>
                    <option value="Primary">Class Primary</option>
                    <option value="00">00</option>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="Advance">Advance</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="Balegan">Balegan</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="permanentAddress">Permanent Full Address *</label>
                  <textarea className={`${inputClass} min-h-24 resize-y`} id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Permanent home address" rows={3} required />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="residentialAddress">Residential Full Address</label>
                  <textarea className={`${inputClass} min-h-24 resize-y`} id="residentialAddress" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Current residential address" rows={3} />
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
