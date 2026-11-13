import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import InstitutionLogo from '../components/InstitutionLogo'
import { apiRequest } from '../services/api'

const institutionName = 'Siddiqua Deeniyat Munazzam Maktab'

function StudentQrProfile() {
  const { token } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const response = await apiRequest(`/students/public-profile/${token}`)
        if (active) setStudent(response.student)
      } catch (err) {
        if (active) setError(err.message || 'Student profile could not be found.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => { active = false }
  }, [token])

  const fields = student
    ? [
        ['Roll No.', student.rollNo],
        ['Class', student.preferredCourseClass],
        ['Timing', student.preferredTime],
        ["Guardian's Name", student.guardianName],
        ['Present Address', student.residentialAddress],
      ]
    : []

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#071747] via-[#0b1026] to-[#0b2a3d] px-4 py-10 text-white">
      <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] shadow-2xl shadow-black/30 backdrop-blur-xl">
        <header className="flex flex-col items-center border-b border-white/10 px-6 py-7 text-center">
          <InstitutionLogo className="h-16 w-16 rounded-2xl" />
          <h1 className="mt-4 text-xl font-bold text-cyan-100">{institutionName}</h1>
        </header>

        {loading ? (
          <p className="p-10 text-center text-white/60">Loading student profile...</p>
        ) : error ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-red-200">{error}</p>
            <Link to="/" className="mt-5 inline-block text-sm text-cyan-300 hover:text-cyan-200">Back to Maktab home</Link>
          </div>
        ) : student ? (
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="h-36 w-28 rounded-2xl border border-white/15 bg-white/5 object-cover shadow-lg" />
              ) : (
                <div className="flex h-36 w-28 items-center justify-center rounded-2xl border border-white/15 bg-cyan-300/10 text-4xl font-bold text-cyan-200">
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <h2 className="mt-5 text-2xl font-bold">{student.name || '—'}</h2>
            </div>

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <dt className="text-xs text-white/45">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-semibold text-white/90">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/40">
          {institutionName}
        </footer>
      </section>
    </main>
  )
}

export default StudentQrProfile
