import { useEffect, useRef, useState } from 'react'

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, objectUrl })
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read this image. Please choose another photo.'))
    }
    image.src = objectUrl
  })
}

function initialCrop(image) {
  const ratio = 7 / 9
  let width = image.naturalWidth
  let height = image.naturalHeight

  if (width / height > ratio) width = height * ratio
  else height = width / ratio

  return {
    x: (image.naturalWidth - width) / 2,
    y: (image.naturalHeight - height) * 0.22,
    width,
    height,
  }
}

function makePassportPhoto(image, crop) {
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
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to crop this image. Please choose another photo.'))
        return
      }
      resolve(new File([blob], 'teacher-passport-photo.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

function PassportPhotoUpload({ onChange, disabled = false, onProcessingChange }) {
  const [photoPreview, setPhotoPreview] = useState('')
  const [cropImage, setCropImage] = useState(null)
  const [cropImageUrl, setCropImageUrl] = useState('')
  const [cropRect, setCropRect] = useState(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)
  const cropDragRef = useRef(null)
  const previewCanvasRef = useRef(null)

  useEffect(() => {
    onProcessingChange?.(processing)
  }, [onProcessingChange, processing])

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  useEffect(() => () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
  }, [cropImageUrl])

  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas || !cropImage || !cropRect) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingQuality = 'high'
    context.drawImage(cropImage, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, canvas.width, canvas.height)
  }, [cropImage, cropRect])

  async function handleFileChange(event) {
    const selected = event.target.files?.[0]
    event.target.value = ''
    setError('')
    if (!selected) return
    onChange(null)
    setPhotoPreview('')
    if (selected.size > 5 * 1024 * 1024) {
      setError('Photo size must not exceed 5 MB.')
      return
    }

    try {
      setProcessing(true)
      const loaded = await loadImage(selected)
      setCropImage(loaded.image)
      setCropImageUrl(loaded.objectUrl)
      setCropRect(initialCrop(loaded.image))
      setCropZoom(1)
      setShowCropModal(true)
    } catch (err) {
      setError(err.message || 'Unable to crop this photo.')
    } finally {
      setProcessing(false)
    }
  }

  function closeCrop() {
    setShowCropModal(false)
    setCropImage(null)
    setCropImageUrl('')
    setCropRect(null)
    setCropZoom(1)
  }

  async function finishCrop() {
    if (!cropImage || !cropRect) return
    try {
      setProcessing(true)
      const cropped = await makePassportPhoto(cropImage, cropRect)
      onChange(cropped)
      setPhotoPreview(URL.createObjectURL(cropped))
      closeCrop()
    } catch (err) {
      setError(err.message || 'Unable to prepare the passport photo.')
    } finally {
      setProcessing(false)
    }
  }

  function handlePointerDown(event) {
    if (!cropRect || !cropDisplay) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    cropDragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: cropRect.x,
      y: cropRect.y,
    }
  }

  function handlePointerMove(event) {
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

  function handlePointerUp(event) {
    cropDragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleZoom(event) {
    if (!cropImage || !cropRect) return
    const zoom = Number(event.target.value)
    const base = initialCrop(cropImage)
    const width = base.width / zoom
    const height = base.height / zoom
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

  const cropDisplay = cropImage
    ? (() => {
        const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth
        const availableWidth = viewportWidth < 768
          ? Math.max(220, viewportWidth - 88)
          : Math.min(500, viewportWidth - 320)
        const scale = Math.min(1, 500 / cropImage.naturalWidth, 400 / cropImage.naturalHeight, availableWidth / cropImage.naturalWidth)
        return {
          scale,
          width: cropImage.naturalWidth * scale,
          height: cropImage.naturalHeight * scale,
        }
      })()
    : null

  return (
    <div>
      <label htmlFor="teacher-photo" className="text-sm text-white/75">Teacher Photo (Optional)</label>
      <input
        id="teacher-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || processing}
        className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-[#0b1026]"
      />
      <p className="mt-2 text-xs text-white/40">JPG, PNG or WEBP. Maximum size 5 MB. Photo is cropped to passport portrait size (35 × 45 mm).</p>
      {processing && <p className="mt-2 text-sm text-cyan-300">Preparing passport photo...</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
      {photoPreview && (
        <div className="mt-4 flex items-center gap-4">
          <img src={photoPreview} alt="Passport size teacher photo preview" className="h-28 w-24 rounded-lg border border-white/15 object-cover" />
          <p className="text-sm text-cyan-300">Passport photo ready to upload</p>
        </div>
      )}

      {showCropModal && cropImage && cropRect && cropDisplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="teacher-photo-crop-title" className="my-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#111935] p-5 shadow-2xl sm:p-7">
            <div className="mb-6">
              <h2 id="teacher-photo-crop-title" className="text-xl font-bold">Crop Passport Photo</h2>
              <p className="mt-2 text-sm text-white/50">Drag the crop frame over the photo. Preview shows the 35 × 45 mm image that will be uploaded.</p>
            </div>
            <div className="grid items-start gap-7 md:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">Uploaded photo</p>
                <div className="relative mx-auto overflow-hidden rounded-xl bg-black/30" style={{ width: cropDisplay.width, height: cropDisplay.height, maxWidth: '100%' }}>
                  <img src={cropImageUrl} alt="Uploaded teacher photo" draggable="false" className="pointer-events-none block select-none" style={{ width: cropDisplay.width, height: cropDisplay.height }} />
                  <div
                    aria-label="Move passport crop area"
                    tabIndex={0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="absolute cursor-move touch-none border-2 border-cyan-300 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                    style={{ left: cropRect.x * cropDisplay.scale, top: cropRect.y * cropDisplay.scale, width: cropRect.width * cropDisplay.scale, height: cropRect.height * cropDisplay.scale }}
                  >
                    <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">Drag to position</span>
                  </div>
                </div>
                <label className="mt-5 block text-sm text-white/70">
                  Zoom
                  <input type="range" min="1" max="2.5" step="0.05" value={cropZoom} onChange={handleZoom} className="mt-2 block w-full accent-cyan-300" />
                </label>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-medium text-white/70">Passport preview</p>
                <canvas ref={previewCanvasRef} width="413" height="531" className="h-auto w-28 rounded-lg border border-white/15" />
                <p className="mt-3 text-center text-xs text-white/40">413 × 531 pixels</p>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-5">
              <button type="button" onClick={closeCrop} disabled={processing} className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={finishCrop} disabled={processing} className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-[#0b1026] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{processing ? 'Preparing...' : 'Done'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default PassportPhotoUpload
