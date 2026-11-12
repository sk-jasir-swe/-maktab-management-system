import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../services/api'
import '../../../App.css'

const initialForm = {
  rollNo: '',
  codeNo: '',
  formNo: '131',
  name: '',
  aadhaarNo: '',
  age: '',
  permanentAddress: '',
  residentialAddress: '',
  schoolName: '',
  schoolClass: '',
  schoolHour: '',
  tuitionHour: '',
  preferredTime: 'Morning',
  guardianName: '',
  guardianAadhaarNo: '',
  guardianProfession: '',
  preferredCourseClass: '',
  fatherName: '',
  motherName: '',
  dateOfBirth: '',
  gender: 'male',
  phone: '',
  whatsappNumber: '',
  address: '',
  admissionDate: new Date().toISOString().split('T')[0],
  classTime: 'morning',
  status: 'active',
}

function Students() {
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [photo, setPhoto] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      setLoading(true)
      setError('')

      const response = await apiRequest('/students')
      setStudents(response.students || [])
    } catch (err) {
      setError(err.message || 'Unable to load students.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name } = event.target
    const value = name === 'name'
      ? event.target.value.toUpperCase()
      : event.target.value

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function openAddForm() {
    setFormData({
      ...initialForm,
      admissionDate: new Date().toISOString().split('T')[0],
    })

    setPhoto(null)
    setEditingId(null)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(student) {
    setFormData({
      rollNo: student.rollNo || '',
      codeNo: student.codeNo || '',
      formNo: student.formNo || '131',
      name: student.name || '',
      aadhaarNo: student.aadhaarNo || '',
      age: student.age ?? '',
      permanentAddress: student.permanentAddress || student.address || '',
      residentialAddress: student.residentialAddress || '',
      schoolName: student.schoolName || '',
      schoolClass: student.schoolClass || '',
      schoolHour: student.schoolHour || '',
      tuitionHour: student.tuitionHour || '',
      preferredTime: formatClassTime(student.preferredTime || student.classTime) || 'Morning',
      guardianName: student.guardianName || student.fatherName || '',
      guardianAadhaarNo: student.guardianAadhaarNo || '',
      guardianProfession: student.guardianProfession || '',
      preferredCourseClass: student.preferredCourseClass || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: student.gender || 'male',
      phone: student.phone || '',
      whatsappNumber: student.whatsappNumber || '',
      address: student.address || '',
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split('T')[0]
        : '',
      classTime: student.classTime || 'morning',
      status: student.status || 'active',
    })

    setPhoto(null)
    setEditingId(student._id)
    setError('')
    setSuccess('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setPhoto(null)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const body = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, value)
      })
      body.set('classTime', formData.preferredTime)
      body.set('whatsappNumber', formData.whatsappNumber || formData.phone)
      body.set('fatherName', formData.guardianName)
      body.set('age', formData.age)

      if (photo) {
        body.append('photo', photo)
      }

      const endpoint = editingId
        ? `/students/${editingId}`
        : '/students'

      await apiRequest(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        body,
      })

      setSuccess(
        editingId
          ? 'Student updated successfully.'
          : 'Student added successfully.',
      )

      setShowForm(false)
      setEditingId(null)
      setPhoto(null)

      await fetchStudents()
    } catch (err) {
      setError(err.message || 'Unable to save student.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`,
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await apiRequest(`/students/${student._id}`, {
        method: 'DELETE',
      })

      setStudents((previous) =>
        previous.filter((item) => item._id !== student._id),
      )

      setSuccess('Student deleted successfully.')
    } catch (err) {
      setError(err.message || 'Unable to delete student.')
    }
  }

  const filteredStudents = students.filter((student) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch = [
      student.name,
      student.rollNo,
      student.guardianName,
      student.fatherName,
      student.phone,
    ].some((value) =>
      String(value || '').toLowerCase().includes(searchText),
    )

    const matchesStatus =
      filterStatus === 'all' || student.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const activeCount = students.filter(
    (student) => student.status === 'active',
  ).length

  const inactiveCount = students.filter(
    (student) => student.status === 'inactive',
  ).length

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10'

  function formatClassTime(classTime) {
    if (classTime === 'after_asr') return 'After Asr'
    if (classTime === 'after_maghrib') return 'After Maghrib'
    if (classTime === 'morning') return 'Morning'
    return classTime || '—'
  }

  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString() : '—'
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
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
              Students Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Add, search, update and manage student records.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300"
          >
            + Add Student
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
            className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-200"
          >
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total Students',
              value: students.length,
              icon: '🎓',
            },
            {
              label: 'Active Students',
              value: activeCount,
              icon: '✅',
            },
            {
              label: 'Inactive Students',
              value: inactiveCount,
              icon: '⏸️',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">{item.label}</p>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <p className="mt-4 text-3xl font-bold text-cyan-300">
                {loading ? '...' : item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Add / Edit Form */}
        {showForm && (
          <section className="mb-8 rounded-2xl border border-cyan-300/20 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Student' : 'Add New Student'}
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Enter the student details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'rollNo', label: 'Roll No.', placeholder: 'Student roll number' },
                  { name: 'admissionDate', label: 'Date *', type: 'date', required: true },
                  { name: 'codeNo', label: 'Code No.', placeholder: 'Institution code' },
                  { name: 'formNo', label: 'Form No.', placeholder: '131', required: true },
                  { name: 'name', label: "Student's Name *", placeholder: 'FULL NAME IN CAPITAL LETTERS', required: true, uppercase: true },
                  { name: 'aadhaarNo', label: 'Aadhar No.', placeholder: '12-digit Aadhaar number', inputMode: 'numeric', pattern: '[0-9]{12}', minLength: 12, maxLength: 12 },
                  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                  { name: 'age', label: 'Age', type: 'number', min: 0, max: 120 },
                  { name: 'schoolName', label: 'Name of the School', placeholder: 'School name (if applicable)' },
                  { name: 'schoolClass', label: 'Class', placeholder: 'School class' },
                  { name: 'schoolHour', label: 'School Hour', placeholder: 'School timing' },
                  { name: 'tuitionHour', label: 'Tuition Hour', placeholder: 'Tuition timing' },
                  { name: 'phone', label: 'Mobile No. *', placeholder: '10-digit contact number', type: 'tel', inputMode: 'numeric', pattern: '[0-9]{10}', maxLength: 10, required: true },
                  { name: 'guardianName', label: "Guardian's Name *", placeholder: 'Father / Mother / Guardian', required: true },
                  { name: 'guardianAadhaarNo', label: "Guardian's Aadhar No.", placeholder: '12-digit Aadhaar number', inputMode: 'numeric', pattern: '[0-9]{12}', minLength: 12, maxLength: 12 },
                  { name: 'guardianProfession', label: "Guardian's Professional", placeholder: 'Business, Job, Farmer, etc.' },
                  { name: 'preferredCourseClass', label: 'Preferred Course/Class', placeholder: 'Course or class at Maktab' },
                ].map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="text-sm text-white/75">
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`${inputClass} ${field.uppercase ? 'uppercase' : ''}`}
                      placeholder={field.placeholder}
                      required={field.required}
                      inputMode={field.inputMode}
                      pattern={field.pattern}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      min={field.min}
                      max={field.max}
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="preferredTime" className="text-sm text-white/75">
                    Preferred Time *
                  </label>
                  <input
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. After Asr / 4:00 PM"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="status" className="text-sm text-white/75">Status *</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="permanentAddress" className="text-sm text-white/75">Permanent Full Address</label>
                  <textarea id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className={inputClass} placeholder="Permanent home address" rows={2} />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="residentialAddress" className="text-sm text-white/75">Residential Full Address</label>
                  <textarea id="residentialAddress" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} className={inputClass} placeholder="Current residential address" rows={2} />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="photo" className="text-sm text-white/75">
                    Student Photo (Optional)
                  </label>

                  <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setPhoto(event.target.files?.[0] || null)
                    }
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-[#0b1026]"
                  />

                  <p className="mt-2 text-xs text-white/40">
                    JPG, PNG or WEBP. Maximum size 5 MB.
                  </p>

                  {photo && (
                    <p className="mt-2 text-sm text-cyan-300">
                      Selected: {photo.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Student'
                      : 'Save Student'}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-6 py-3 text-white/70 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and Filter */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name, father name or phone..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#111935] px-4 py-3 text-white outline-none focus:border-cyan-300/40"
          >
            <option value="all">All Students</option>
            <option value="active">Active Students</option>
            <option value="inactive">Inactive Students</option>
          </select>

          <button
            type="button"
            onClick={fetchStudents}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/10"
          >
            ↻ Refresh
          </button>
        </section>

        {/* Students List */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">All Students</h2>

            <span className="text-sm text-white/45">
              {filteredStudents.length} student(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-white/50">
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">🎓</div>

              <h3 className="mt-4 text-lg font-semibold">
                No students found
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Try another search or add a new student.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead className="bg-white/3 text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Guardian Name</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">WhatsApp</th>
                    <th className="px-6 py-4 font-medium">Preferred Time</th>
                    <th className="px-6 py-4 font-medium">Admission Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/6">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="transition hover:bg-white/2.5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.photo?.url ? (
                            <img
                              src={student.photo.url}
                              alt={student.name}
                              className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-cyan-400/10 text-lg text-cyan-300">
                              {student.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-white">
                              {student.name}
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              Roll No.: {student.rollNo || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {student.guardianName || student.fatherName || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {student.phone || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {student.whatsappNumber || '—'}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {formatClassTime(student.preferredTime || student.classTime)}
                      </td>

                      <td className="px-6 py-4 text-white/65">
                        {formatDate(student.admissionDate)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            student.status === 'active'
                              ? 'bg-cyan-400/10 text-cyan-300'
                              : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {student.status || 'unknown'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(student)}
                            className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-300/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(student)}
                            className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
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

export default Students
