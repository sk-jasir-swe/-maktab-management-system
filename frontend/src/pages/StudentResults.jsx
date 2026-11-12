import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function StudentResults() {
  const [form, setForm] = useState({ rollNo: '', phone: '' })
  const [student, setStudent] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setStudent(null)
    setResults(null)
    try {
      const response = await apiRequest('/exam-results/public-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: form.rollNo.trim(), phone: form.phone }),
      })
      setStudent(response.student)
      setResults(response.examResults || [])
    } catch (err) {
      setError(err.message || 'Unable to find results.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10'

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] px-4 py-12 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-cyan-300 transition hover:text-cyan-200">← Back to Home</Link>
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Student Portal</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Check Exam Results</h1>
          <p className="mt-3 leading-7 text-white/55">Enter your roll number and registered phone number to view your results.</p>

          {error && <div role="alert" className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-white/75" htmlFor="rollNo">
              Roll Number
              <input id="rollNo" name="rollNo" value={form.rollNo} onChange={handleChange} className={inputClass} required autoComplete="off" />
            </label>
            <label className="text-sm font-medium text-white/75" htmlFor="phone">
              Registered Phone Number
              <input id="phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.phone} onChange={handleChange} className={inputClass} required autoComplete="tel-national" />
            </label>
            <button type="submit" disabled={loading} className="rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-200 disabled:opacity-60 sm:col-span-2">
              {loading ? 'Checking…' : 'View Results'}
            </button>
          </form>

          {student && (
            <section className="mt-8" aria-live="polite">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                <p className="mt-2 text-sm text-white/65">Roll No. {student.rollNo}{student.class ? ` · Class ${student.class}` : ''}</p>
              </div>
              <h3 className="mb-4 mt-7 text-lg font-semibold">Latest Result</h3>
              {results.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-white/60">No results have been published for this student yet.</p>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <article key={result._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-cyan-100">{result.exam?.name || 'Examination'}</h4>
                          <p className="mt-1 text-sm text-white/55">{result.subject}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{result.marks} / {result.totalMarks}</p>
                      </div>
                      {(result.grade || result.remarks) && <p className="mt-3 text-sm text-white/65">{result.grade && `Grade: ${result.grade}`}{result.grade && result.remarks ? ' · ' : ''}{result.remarks}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  )
}

export default StudentResults
