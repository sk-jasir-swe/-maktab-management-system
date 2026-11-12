import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../services/api'
import '../../../App.css'

const initialForm = {
  rollNo: '',
  codeNo: '',
  formNo: '',
  name: '',
  aadhaarNo: '',
  age: '',
  permanentAddress: '',
  residentialAddress: '',
  schoolName: '',
  schoolClass: '',
  schoolHour: '',
  tuitionHour: '',
  preferredTime: '',
  guardianName: '',
  guardianAadhaarNo: '',
  guardianProfession: '',
  preferredCourseClass: '',
  fatherName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  whatsappNumber: '',
  address: '',
  admissionDate: '',
  classTime: '',
  status: '',
}

function loadCropImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({ image, objectUrl })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read this image. Please choose another photo.'))
    }

    image.src = objectUrl
  })
}

function getInitialCrop(image) {
  const ratio = 7 / 9
  let width = image.naturalWidth
  let height = image.naturalHeight

  if (width / height > ratio) {
    width = height * ratio
  } else {
    height = width / ratio
  }

  return {
    x: (image.naturalWidth - width) / 2,
    y: (image.naturalHeight - height) * 0.22,
    width,
    height,
  }
}

function renderPassportCrop(image, crop) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 413
    canvas.height = 531

    const context = canvas.getContext('2d')
    if (!context) {
      reject(new Error('Unable to prepare the passport photo.'))
      return
    }

    context.imageSmoothingQuality = 'high'
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to crop this image. Please choose another photo.'))
        return
      }

      resolve(new File([blob], 'student-passport-photo.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

function Students() {
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [cropImageUrl, setCropImageUrl] = useState('')
  const [cropRect, setCropRect] = useState(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [showCropModal, setShowCropModal] = useState(false)
  const cropDragRef = useRef(null)
  const cropPreviewCanvasRef = useRef(null)
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

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  useEffect(() => () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
  }, [cropImageUrl])

  useEffect(() => {
    const canvas = cropPreviewCanvasRef.current
    if (!canvas || !cropImage || !cropRect) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingQuality = 'high'
    context.drawImage(
      cropImage,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
  }, [cropImage, cropRect])

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
    setFormData({ ...initialForm })

    setPhoto(null)
    setPhotoPreview('')
    setEditingId(null)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(student) {
    setFormData({
      rollNo: student.rollNo || '',
      codeNo: student.codeNo || '',
      formNo: student.formNo || '',
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
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: student.gender || '',
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
    setPhotoPreview('')
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
    setPhotoPreview('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving || photoProcessing) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const body = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, value)
      })
      body.set('classTime', formData.preferredTime)
      body.set('whatsappNumber', formData.whatsappNumber)
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
      setPhotoPreview('')

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

  async function handlePhotoChange(event) {
    const selectedPhoto = event.target.files?.[0]
    setPhoto(null)
    setPhotoPreview('')
    setError('')

    if (!selectedPhoto) return
    event.target.value = ''

    try {
      setPhotoProcessing(true)
      const loaded = await loadCropImage(selectedPhoto)
      setCropImage(loaded.image)
      setCropImageUrl(loaded.objectUrl)
      setCropRect(getInitialCrop(loaded.image))
      setCropZoom(1)
      setShowCropModal(true)
    } catch (err) {
      setError(err.message || 'Unable to crop this photo.')
      event.target.value = ''
    } finally {
      setPhotoProcessing(false)
    }
  }

  function cancelPhotoCrop() {
    setShowCropModal(false)
    setCropImage(null)
    setCropImageUrl('')
    setCropRect(null)
    setCropZoom(1)
  }

  async function finishPhotoCrop() {
    if (!cropImage || !cropRect) return

    try {
      setPhotoProcessing(true)
      const croppedPhoto = await renderPassportCrop(cropImage, cropRect)
      setPhoto(croppedPhoto)
      setPhotoPreview(URL.createObjectURL(croppedPhoto))
      cancelPhotoCrop()
    } catch (err) {
      setError(err.message || 'Unable to prepare the passport photo.')
    } finally {
      setPhotoProcessing(false)
    }
  }

  function handleCropPointerDown(event) {
    if (!cropRect || !cropDisplay) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    cropDragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: cropRect.x,
      y: cropRect.y,
    }
  }

  function handleCropPointerMove(event) {
    const drag = cropDragRef.current
    if (!drag || !cropImage || !cropRect || !cropDisplay) return

    const maxX = cropImage.naturalWidth - cropRect.width
    const maxY = cropImage.naturalHeight - cropRect.height
    const nextX = drag.x + (event.clientX - drag.clientX) / cropDisplay.scale
    const nextY = drag.y + (event.clientY - drag.clientY) / cropDisplay.scale

    setCropRect((previous) => ({
      ...previous,
      x: Math.min(maxX, Math.max(0, nextX)),
      y: Math.min(maxY, Math.max(0, nextY)),
    }))
  }

  function handleCropPointerUp(event) {
    cropDragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleCropZoom(event) {
    if (!cropImage || !cropRect) return

    const zoom = Number(event.target.value)
    const baseCrop = getInitialCrop(cropImage)
    const width = baseCrop.width / zoom
    const height = baseCrop.height / zoom
    const centerX = cropRect.x + cropRect.width / 2
    const centerY = cropRect.y + cropRect.height / 2

    setCropZoom(zoom)
    setCropRect({
      x: Math.min(cropImage.naturalWidth - width, Math.max(0, centerX - width / 2)),
      y: Math.min(cropImage.naturalHeight - height, Math.max(0, centerY - height / 2)),
      width,
      height,
    })
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

  const cropDisplay = cropImage
    ? (() => {
        const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth
        const availableWidth = viewportWidth < 768
          ? Math.max(220, viewportWidth - 88)
          : Math.min(500, viewportWidth - 320)
        const scale = Math.min(
          1,
          500 / cropImage.naturalWidth,
          400 / cropImage.naturalHeight,
          availableWidth / cropImage.naturalWidth,
        )
        return {
          scale,
          width: cropImage.naturalWidth * scale,
          height: cropImage.naturalHeight * scale,
        }
      })()
    : null

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
                  { name: 'whatsappNumber', label: 'WhatsApp Number *', placeholder: '10-digit WhatsApp number', type: 'tel', inputMode: 'numeric', pattern: '[0-9]{10}', maxLength: 10, required: true },
                  { name: 'guardianName', label: "Guardian's Name *", placeholder: 'Father / Mother / Guardian', required: true },
                  { name: 'guardianAadhaarNo', label: "Guardian's Aadhar No.", placeholder: '12-digit Aadhaar number', inputMode: 'numeric', pattern: '[0-9]{12}', minLength: 12, maxLength: 12 },
                  { name: 'guardianProfession', label: "Guardian's Professional", placeholder: 'Business, Job, Farmer, etc.' },
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
                  <label htmlFor="gender" className="text-sm text-white/75">Gender *</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
                    <option value="" disabled>Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredTime" className="text-sm text-white/75">
                    Preferred Time *
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
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
                  <label htmlFor="preferredCourseClass" className="text-sm text-white/75">
                    Preferred Course/Class
                  </label>
                  <select
                    id="preferredCourseClass"
                    name="preferredCourseClass"
                    value={formData.preferredCourseClass}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select course/class</option>
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

                <div>
                  <label htmlFor="status" className="text-sm text-white/75">Status *</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                    <option value="" disabled>Select status</option>
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
                    onChange={handlePhotoChange}
                    className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-[#0b1026]"
                  />

                  <p className="mt-2 text-xs text-white/40">
                    JPG, PNG or WEBP. Position your photo in the crop tool; upload uses passport portrait size (35 × 45 mm).
                  </p>

                  {photoProcessing && (
                    <p className="mt-2 text-sm text-cyan-300">Cropping passport photo...</p>
                  )}

                  {photoPreview && (
                    <div className="mt-4 flex items-center gap-4">
                      <img
                        src={photoPreview}
                        alt="Passport size student photo preview"
                        className="h-auto w-24 rounded-lg border border-white/15 object-cover"
                      />
                      <p className="text-sm text-cyan-300">
                        {photo ? `Ready to upload: ${photo.name}` : 'Passport photo preview'}
                      </p>
                    </div>
                  )}

                  {photo && !photoPreview && (
                    <p className="mt-2 text-sm text-cyan-300">
                      Selected: {photo.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || photoProcessing}
                  className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {photoProcessing
                    ? 'Cropping photo...'
                    : saving
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
            placeholder="Search by name, roll number, guardian or mobile..."
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
          Siddiqua Deeniyat Munazzam Maktab Management System
        </footer>
      </main>

      {showCropModal && cropImage && cropRect && cropDisplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-crop-title"
            className="my-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#111935] p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6">
              <h2 id="photo-crop-title" className="text-xl font-bold">Crop Passport Photo</h2>
              <p className="mt-2 text-sm text-white/50">
                Drag the crop frame over the photo. The preview shows the 35 × 45 mm image that will be uploaded.
              </p>
            </div>

            <div className="grid items-start gap-7 md:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">Uploaded photo</p>
                <div
                  className="relative mx-auto overflow-hidden rounded-xl bg-black/30"
                  style={{ width: cropDisplay.width, height: cropDisplay.height, maxWidth: '100%' }}
                >
                  <img
                    src={cropImageUrl}
                    alt="Uploaded student photo"
                    draggable="false"
                    className="pointer-events-none block select-none"
                    style={{ width: cropDisplay.width, height: cropDisplay.height }}
                  />
                  <div
                    aria-label="Move passport crop area"
                    tabIndex={0}
                    onPointerDown={handleCropPointerDown}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerCancel={handleCropPointerUp}
                    className="absolute cursor-move touch-none border-2 border-cyan-300 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                    style={{
                      left: cropRect.x * cropDisplay.scale,
                      top: cropRect.y * cropDisplay.scale,
                      width: cropRect.width * cropDisplay.scale,
                      height: cropRect.height * cropDisplay.scale,
                    }}
                  >
                    <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
                      Drag to position
                    </span>
                  </div>
                </div>

                <label className="mt-5 block text-sm text-white/70">
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={cropZoom}
                    onChange={handleCropZoom}
                    className="mt-2 block w-full accent-cyan-300"
                  />
                </label>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-medium text-white/70">Passport preview</p>
                <canvas
                  ref={cropPreviewCanvasRef}
                  width="413"
                  height="531"
                  className="h-auto w-28 rounded-lg border border-white/15"
                />
                <p className="mt-3 text-center text-xs text-white/40">413 × 531 pixels</p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={cancelPhotoCrop}
                disabled={photoProcessing}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={finishPhotoCrop}
                disabled={photoProcessing}
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {photoProcessing ? 'Preparing...' : 'Done'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Students
