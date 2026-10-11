import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../services/api'

const initialExamForm = {
  name: '',
  date: '',
  description: '',
  status: 'upcoming',
}

const initialResultForm = {
  exam: '',
  student: '',
  subject: '',
  marks: '',
  totalMarks: '',
  grade: '',
  remarks: '',
}

const inputStyle =
  'w-full rounded-xl border border-[#34345b] bg-[#0b1026] px-4 py-3 text-sm text-white outline-none transition focus:border-[#67e8f9]'

const buttonStyle =
  'rounded-xl bg-[#67e8f9] px-5 py-3 text-sm font-semibold text-[#0b1026] transition hover:bg-[#a5f3fc] disabled:cursor-not-allowed disabled:opacity-50'

function ExamsResults() {
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [students, setStudents] = useState([])

  const [examForm, setExamForm] = useState(initialExamForm)
  const [resultForm, setResultForm] = useState(initialResultForm)

  const [editingExamId, setEditingExamId] = useState(null)
  const [editingResultId, setEditingResultId] = useState(null)

  const [activeTab, setActiveTab] = useState('exams')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [examResponse, resultResponse, studentResponse] =
        await Promise.all([
          apiRequest('/exams'),
          apiRequest('/exam-results'),
          apiRequest('/students'),
        ])

      setExams(
        Array.isArray(examResponse)
          ? examResponse
          : examResponse.exams || []
      )

      setResults(
        Array.isArray(resultResponse)
          ? resultResponse
          : resultResponse.results || resultResponse.examResults || []
      )

      setStudents(
        Array.isArray(studentResponse)
          ? studentResponse
          : studentResponse.students || []
      )
    } catch (err) {
      setError(err.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  function showSuccess(message) {
    setSuccess(message)
    setError('')

    window.setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  function getStudentId(result) {
    return typeof result.student === 'object'
      ? result.student?._id
      : result.student
  }

  function getExamId(result) {
    return typeof result.exam === 'object'
      ? result.exam?._id
      : result.exam
  }

  function getStudentName(result) {
    if (result.student && typeof result.student === 'object') {
      return result.student.name || 'Unknown student'
    }

    const student = students.find(
      (item) => item._id === result.student
    )

    return student?.name || 'Unknown student'
  }

  function getExamName(result) {
    if (result.exam && typeof result.exam === 'object') {
      return result.exam.name || 'Unknown exam'
    }

    const exam = exams.find((item) => item._id === result.exam)

    return exam?.name || 'Unknown exam'
  }

  function handleExamChange(event) {
    const { name, value } = event.target

    setExamForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleResultChange(event) {
    const { name, value } = event.target

    setResultForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleExamSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...examForm,
        date: new Date(examForm.date).toISOString(),
      }

      if (editingExamId) {
        await apiRequest(`/exams/${editingExamId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        showSuccess('Exam updated successfully.')
      } else {
        await apiRequest('/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        showSuccess('Exam created successfully.')
      }

      setExamForm(initialExamForm)
      setEditingExamId(null)

      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to save exam.')
    } finally {
      setSaving(false)
    }
  }

  async function handleResultSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        exam: resultForm.exam,
        student: resultForm.student,
        subject: resultForm.subject.trim(),
        marks: Number(resultForm.marks),
        totalMarks: Number(resultForm.totalMarks),
        grade: resultForm.grade.trim(),
        remarks: resultForm.remarks.trim(),
      }

      if (
        payload.marks < 0 ||
        payload.totalMarks <= 0 ||
        payload.marks > payload.totalMarks
      ) {
        setError(
          'Marks must be between 0 and total marks. Total marks must be greater than 0.'
        )
        setSaving(false)
        return
      }

      if (editingResultId) {
        await apiRequest(`/exam-results/${editingResultId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        showSuccess('Result updated successfully.')
      } else {
        await apiRequest('/exam-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        showSuccess('Result added successfully.')
      }

      setResultForm(initialResultForm)
      setEditingResultId(null)

      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to save result.')
    } finally {
      setSaving(false)
    }
  }

  function editExam(exam) {
    setEditingExamId(exam._id)

    setExamForm({
      name: exam.name || '',
      date: exam.date
        ? new Date(exam.date).toISOString().slice(0, 10)
        : '',
      description: exam.description || '',
      status: exam.status || 'upcoming',
    })

    setActiveTab('exams')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function editResult(result) {
    setEditingResultId(result._id)

    setResultForm({
      exam: getExamId(result) || '',
      student: getStudentId(result) || '',
      subject: result.subject || '',
      marks: String(result.marks ?? ''),
      totalMarks: String(result.totalMarks ?? ''),
      grade: result.grade || '',
      remarks: result.remarks || '',
    })

    setActiveTab('results')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelExamEdit() {
    setEditingExamId(null)
    setExamForm(initialExamForm)
  }

  function cancelResultEdit() {
    setEditingResultId(null)
    setResultForm(initialResultForm)
  }

  const filteredExams = exams.filter((exam) => {
    const searchText = search.toLowerCase()

    return (
      (exam.name || '').toLowerCase().includes(searchText) ||
      (exam.status || '').toLowerCase().includes(searchText)
    )
  })

  const filteredResults = results.filter((result) => {
    const searchText = search.toLowerCase()

    return (
      getStudentName(result).toLowerCase().includes(searchText) ||
      getExamName(result).toLowerCase().includes(searchText) ||
      (result.subject || '').toLowerCase().includes(searchText)
    )
  })

  const cardStyle =
    'rounded-2xl border border-[#34345b] bg-[#171a3c]/90 p-5 shadow-lg shadow-black/10'

  const labelStyle = 'mb-2 block text-sm font-medium text-[#C5D1CB]'

  const secondaryButton =
    'rounded-xl border border-[#34345b] px-4 py-2 text-sm font-medium text-[#C5D1CB] transition hover:border-[#a5f3fc] hover:text-[#a5f3fc]'

  function statusStyle(status) {
    if (status === 'completed') {
      return 'bg-[#67e8f9]/15 text-[#a5f3fc]'
    }

    if (status === 'cancelled') {
      return 'bg-red-500/15 text-red-300'
    }

    return 'bg-yellow-500/15 text-yellow-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed px-4 py-6 text-[#F8FAF9] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Exams & Results
            </h1>

            <p className="mt-2 text-sm text-[#89958F]">
              Manage examinations and student academic performance.
            </p>
          </div>

          <div className="rounded-2xl border border-[#34345b] bg-[#171a3c] px-5 py-4">
            <p className="text-sm text-[#89958F]">Total Exams</p>
            <p className="mt-1 text-3xl font-bold text-[#a5f3fc]">
              {exams.length}
            </p>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-[#67e8f9]/30 bg-[#67e8f9]/10 px-4 py-3 text-sm text-[#a5f3fc]">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={cardStyle}>
            <p className="text-sm text-[#89958F]">Total Exams</p>
            <p className="mt-3 text-3xl font-bold text-[#a5f3fc]">
              {exams.length}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#89958F]">Upcoming Exams</p>
            <p className="mt-3 text-3xl font-bold text-[#a5f3fc]">
              {exams.filter((exam) => exam.status === 'upcoming').length}
            </p>
          </div>

          <div className={cardStyle}>
            <p className="text-sm text-[#89958F]">Results Recorded</p>
            <p className="mt-3 text-3xl font-bold text-[#a5f3fc]">
              {results.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('exams')
              setSearch('')
            }}
            className={
              activeTab === 'exams'
                ? buttonStyle
                : secondaryButton
            }
          >
            Exam Management
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('results')
              setSearch('')
            }}
            className={
              activeTab === 'results'
                ? buttonStyle
                : secondaryButton
            }
          >
            Student Results
          </button>
        </div>

        {loading ? (
          <div className={`${cardStyle} py-16 text-center text-[#89958F]`}>
            Loading exams and results...
          </div>
        ) : (
          <>
            {/* Exam Management */}
            {activeTab === 'exams' && (
              <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
                <section className={cardStyle}>
                  <h2 className="mb-5 text-xl font-semibold">
                    {editingExamId ? 'Edit Exam' : 'Create New Exam'}
                  </h2>

                  <form onSubmit={handleExamSubmit} className="space-y-4">
                    <div>
                      <label className={labelStyle}>Exam Name *</label>
                      <input
                        className={inputStyle}
                        name="name"
                        value={examForm.name}
                        onChange={handleExamChange}
                        placeholder="e.g. Monthly Test"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>Exam Date *</label>
                      <input
                        className={inputStyle}
                        type="date"
                        name="date"
                        value={examForm.date}
                        onChange={handleExamChange}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>Status</label>
                      <select
                        className={inputStyle}
                        name="status"
                        value={examForm.status}
                        onChange={handleExamChange}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Description</label>
                      <textarea
                        className={inputStyle}
                        name="description"
                        value={examForm.description}
                        onChange={handleExamChange}
                        placeholder="Enter exam details"
                        rows="3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`${buttonStyle} w-full`}
                    >
                      {saving
                        ? 'Saving...'
                        : editingExamId
                          ? 'Update Exam'
                          : 'Create Exam'}
                    </button>

                    {editingExamId && (
                      <button
                        type="button"
                        onClick={cancelExamEdit}
                        className={`${secondaryButton} w-full`}
                      >
                        Cancel Editing
                      </button>
                    )}
                  </form>
                </section>

                <section className={cardStyle}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                      All Examinations
                    </h2>

                    <span className="text-sm text-[#89958F]">
                      {filteredExams.length} exams
                    </span>
                  </div>

                  <input
                    className={`${inputStyle} mb-5`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search exams..."
                  />

                  {filteredExams.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#89958F]">
                      No exams found.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredExams.map((exam) => (
                        <div
                          key={exam._id}
                          className="rounded-xl border border-[#34345b] bg-[#0b1026]/60 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">
                                {exam.name}
                              </h3>

                              <p className="mt-1 text-sm text-[#89958F]">
                                {new Date(exam.date).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyle(exam.status)}`}
                            >
                              {exam.status}
                            </span>
                          </div>

                          {exam.description && (
                            <p className="mt-3 text-sm text-[#89958F]">
                              {exam.description}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => editExam(exam)}
                            className={`${secondaryButton} mt-4`}
                          >
                            Edit Exam
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Student Results */}
            {activeTab === 'results' && (
              <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
                <section className={cardStyle}>
                  <h2 className="mb-5 text-xl font-semibold">
                    {editingResultId ? 'Edit Result' : 'Add Student Result'}
                  </h2>

                  <form onSubmit={handleResultSubmit} className="space-y-4">
                    <div>
                      <label className={labelStyle}>Examination *</label>
                      <select
                        className={inputStyle}
                        name="exam"
                        value={resultForm.exam}
                        onChange={handleResultChange}
                        required
                      >
                        <option value="">Select exam</option>
                        {exams.map((exam) => (
                          <option key={exam._id} value={exam._id}>
                            {exam.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Student *</label>
                      <select
                        className={inputStyle}
                        name="student"
                        value={resultForm.student}
                        onChange={handleResultChange}
                        required
                      >
                        <option value="">Select student</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Subject *</label>
                      <input
                        className={inputStyle}
                        name="subject"
                        value={resultForm.subject}
                        onChange={handleResultChange}
                        placeholder="e.g. Quran"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelStyle}>Marks *</label>
                        <input
                          className={inputStyle}
                          type="number"
                          name="marks"
                          min="0"
                          value={resultForm.marks}
                          onChange={handleResultChange}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Total Marks *</label>
                        <input
                          className={inputStyle}
                          type="number"
                          name="totalMarks"
                          min="1"
                          value={resultForm.totalMarks}
                          onChange={handleResultChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Grade</label>
                      <input
                        className={inputStyle}
                        name="grade"
                        value={resultForm.grade}
                        onChange={handleResultChange}
                        placeholder="e.g. A+"
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>Remarks</label>
                      <textarea
                        className={inputStyle}
                        name="remarks"
                        value={resultForm.remarks}
                        onChange={handleResultChange}
                        placeholder="Optional remarks"
                        rows="3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`${buttonStyle} w-full`}
                    >
                      {saving
                        ? 'Saving...'
                        : editingResultId
                          ? 'Update Result'
                          : 'Add Result'}
                    </button>

                    {editingResultId && (
                      <button
                        type="button"
                        onClick={cancelResultEdit}
                        className={`${secondaryButton} w-full`}
                      >
                        Cancel Editing
                      </button>
                    )}
                  </form>
                </section>

                <section className={cardStyle}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                      Student Results
                    </h2>

                    <span className="text-sm text-[#89958F]">
                      {filteredResults.length} results
                    </span>
                  </div>

                  <input
                    className={`${inputStyle} mb-5`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student, exam or subject..."
                  />

                  {filteredResults.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#89958F]">
                      No results found.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredResults.map((result) => (
                        <div
                          key={result._id}
                          className="rounded-xl border border-[#34345b] bg-[#0b1026]/60 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">
                                {getStudentName(result)}
                              </h3>

                              <p className="mt-1 text-sm text-[#89958F]">
                                {getExamName(result)} · {result.subject}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-[#a5f3fc]">
                                {result.marks} / {result.totalMarks}
                              </p>

                              {result.grade && (
                                <p className="mt-1 text-sm text-[#89958F]">
                                  Grade: {result.grade}
                                </p>
                              )}
                            </div>
                          </div>

                          {result.remarks && (
                            <p className="mt-3 text-sm text-[#89958F]">
                              {result.remarks}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => editResult(result)}
                            className={`${secondaryButton} mt-4`}
                          >
                            Edit Result
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ExamsResults