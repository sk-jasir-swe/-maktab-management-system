import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

const GALLERY_IMAGES = [
  {
    title: 'Our Maktab',
    description: 'A place to learn and grow.',
    image: '/images/maktab-1.jpg',
  },
  {
    title: 'Learning Together',
    description: 'Building knowledge and good values.',
    image: '/images/maktab-2.jpg',
  },
  {
    title: 'Our Classroom',
    description: 'A welcoming learning environment.',
    image: '/images/maktab-3.jpg',
  },
  {
    title: 'Education & Values',
    description: 'Growing through education.',
    image: '/images/maktab-4.jpg',
  },
]

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed px-6 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Back Button */}
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Our Memories
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Maktab Gallery
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-white/55">
            Explore photographs of our Maktab, classrooms,
            learning environment and activities.
          </p>
        </div>

        {/* All Photos */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GALLERY_IMAGES.map((item) => (
            <button
              type="button"
              key={item.image}
              onClick={() => setSelectedImage(item)}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/4 text-left transition hover:-translate-y-1 hover:border-cyan-300/40"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#0b1026] via-transparent to-transparent" />

                <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
                  View Photo ↗
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-lg font-bold text-cyan-200">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full-size Photo Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1026]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-white/20"
              aria-label="Close image preview"
            >
              ×
            </button>

            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[75vh] w-full object-contain"
            />

            <div className="p-5">
              <h2 className="text-xl font-bold">
                {selectedImage.title}
              </h2>

              <p className="mt-2 text-sm text-white/55">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery