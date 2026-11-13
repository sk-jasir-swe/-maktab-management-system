import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import '../App.css'
import InstitutionLogo from '../components/InstitutionLogo'

const GALLERY_IMAGES = [
  {
    title: 'Our Maktab',
    description: 'Our learning space.',
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

function Home() {
  const [notices, setNotices] = useState([])
  const [teachers, setTeachers] = useState([])

  const [noticeError, setNoticeError] = useState(false)
  const [teachersError, setTeachersError] = useState(false)

  const [noticesLoading, setNoticesLoading] = useState(true)
  const [teachersLoading, setTeachersLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function fetchNotices() {
      try {
        const response = await apiRequest('/notices')

        if (active) {
          setNotices(
            Array.isArray(response?.notices)
              ? response.notices
              : [],
          )
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error)

        if (active) {
          setNoticeError(true)
        }
      } finally {
        if (active) {
          setNoticesLoading(false)
        }
      }
    }

   async function fetchTeachers() {
  try {
    const response = await apiRequest('/teachers')

    if (active) {
      const activeTeachers = Array.isArray(response?.teachers)
        ? response.teachers.filter(
            (teacher) => teacher.status === 'active'
          )
        : []

      setTeachers(activeTeachers)
    }
  } catch (error) {
    console.error('Failed to fetch teachers:', error)

    if (active) {
      setTeachersError(true)
    }
  } finally {
    if (active) {
      setTeachersLoading(false)
    }
  }
}

    fetchNotices()
    fetchTeachers()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedImage(null)
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const institutionName = 'Siddiqua Deeniyat Munazzam Maktab'
  const institutionAddress =
    'Mukundapur (Paschim Basti), Masjid-e-Siddiq, Sagareswar, Ramnagar, Purba Medinipur, West Bengal 721446'
  const contactNumbers = ['9002569862', '8348565184']
  const googleMapsUrl = 'https://maps.app.goo.gl/wzYfHRiBjwvhr79x8'
  const desktopNavItemClass =
    'whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/75 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-200 xl:px-3.5'

  const embeddedMapUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2014.3297675411652!2d87.48284950668805!3d21.668572220308068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1cd3a13294491f%3A0x9b9e54e03045ad91!2sMasjid%20e%20Siddiqui!5e1!3m2!1sen!2sin!4v1794497821232!5m2!1sen!2sin'

  const appleMapsUrl =
    'https://maps.apple.com/?ll=21.668572220308068,87.48284950668805&q=Masjid%20e%20Siddiqui'

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed text-white">

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/40 blur-[120px]" />

        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-400/30 blur-[120px]" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-[120px]" />

        <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-[110px]" />
      </div>

      {/* Admission Announcement */}
      <div className="relative z-20 overflow-hidden border-b border-white/15 bg-white/[0.08] py-3 backdrop-blur-2xl">
        <div className="admission-marquee flex w-max items-center">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex shrink-0 items-center gap-4 px-5 sm:gap-6 sm:px-8"
            >
              <span className="flex items-center gap-2 rounded-full border border-cyan-300/30 bg-violet-400/10 px-3 py-1.5 text-xs font-extrabold tracking-wider text-cyan-300 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                </span>

                ADMISSION OPEN
              </span>

              <span className="whitespace-nowrap text-sm font-semibold text-white sm:text-base">
                New Academic Session 2026–27
              </span>

              <img
                src="/images/siddiqua-deeniyat-favicon.png"
                alt=""
                aria-hidden="true"
                className="h-5 w-5 shrink-0 object-contain"
              />

              <Link
                to="/admission"
                className="whitespace-nowrap text-sm font-bold text-cyan-300 transition hover:text-white sm:text-base"
              >
                Enroll Your Child Today →
              </Link>

              <span className="mx-2 text-violet-400/60 sm:mx-4">
                ◆
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-4 z-30 mx-auto mt-5 w-[calc(100%-2rem)] max-w-7xl rounded-3xl border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl">
        <nav className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <a href="#home" className="flex min-w-0 items-center gap-3 lg:w-56 xl:w-64">
            <InstitutionLogo className="h-12 w-12 rounded-2xl" />

            <div className="min-w-0">
              <h1 className="whitespace-normal text-xs font-bold leading-tight tracking-wide sm:text-sm xl:text-base">
                Siddiqua Deeniyat Munazzam Maktab
              </h1>

              <p className="text-xs text-cyan-200/60">
                Knowledge • Faith • Values
              </p>
            </div>
          </a>

          <div className="hidden flex-1 flex-wrap items-center justify-end gap-2 lg:flex">
            <a href="#home" className={desktopNavItemClass}>
              Home
            </a>

            <a href="#about" className={desktopNavItemClass}>
              About
            </a>

            <Link to="/rules" className={desktopNavItemClass}>
              Rules &amp; Regulations
            </Link>

            <a href="#education" className={desktopNavItemClass}>
              Education
            </a>

            <a href="#teachers" className={desktopNavItemClass}>
              Teachers
            </a>

            <a href="#gallery" className={desktopNavItemClass}>
              Memories
            </a>

            <a href="#notices" className={desktopNavItemClass}>
              Notices
            </a>

            <a href="#contact" className={desktopNavItemClass}>
              Contact
            </a>

            {/* NEW: Check Status */}
            <Link
              to="/admission-status"
              className="whitespace-nowrap rounded-full border border-rose-400/35 bg-rose-950/70 px-4 py-2 text-xs font-bold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:-translate-y-0.5 hover:bg-rose-900/80"
            >
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />
              Check Status
            </Link>
            <Link
              to="/student-results"
              className="whitespace-nowrap rounded-full border border-rose-400/35 bg-rose-950/70 px-4 py-2 text-xs font-bold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:-translate-y-0.5 hover:bg-rose-900/80"
            >
              <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />
              Check Results
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-2xl text-cyan-200 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-white/10 bg-[#10142e] p-6 shadow-2xl"
            aria-label="Mobile navigation"
          >
            <div className="mb-7 flex items-center justify-between gap-3 border-b border-white/10 pb-5">
              <p className="font-semibold text-cyan-200">Navigation</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-1 text-2xl text-white/70 hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-1 text-white/80">
              <a onClick={() => setMobileMenuOpen(false)} href="#home" className="rounded-xl px-4 py-3 hover:bg-white/10">Home</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#about" className="rounded-xl px-4 py-3 hover:bg-white/10">About</a>
              <Link onClick={() => setMobileMenuOpen(false)} to="/rules" className="rounded-xl px-4 py-3 hover:bg-white/10">Rules &amp; Regulations</Link>
              <a onClick={() => setMobileMenuOpen(false)} href="#education" className="rounded-xl px-4 py-3 hover:bg-white/10">Education</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#teachers" className="rounded-xl px-4 py-3 hover:bg-white/10">Teachers</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#gallery" className="rounded-xl px-4 py-3 hover:bg-white/10">Memories</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#notices" className="rounded-xl px-4 py-3 hover:bg-white/10">Notices</a>
              <a onClick={() => setMobileMenuOpen(false)} href="#contact" className="rounded-xl px-4 py-3 hover:bg-white/10">Contact</a>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admission-status" className="mt-3 rounded-xl border border-rose-400/35 bg-rose-950/70 px-4 py-3 text-center font-semibold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:bg-rose-900/80"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />Check Status</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/student-results" className="mt-2 rounded-xl border border-rose-400/35 bg-rose-950/70 px-4 py-3 text-center font-semibold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:bg-rose-900/80"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />Check Results</Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admission" className="mt-2 rounded-xl border border-white/15 px-4 py-3 text-center font-semibold text-white">Apply for Admission</Link>
            </nav>
          </aside>
        </div>
      )}

      <main id="home" className="relative z-10">

        {/* Hero Section */}
        <section className="relative isolate mx-auto my-8 max-w-7xl overflow-hidden rounded-[2rem] border border-emerald-100/10 bg-gradient-to-br from-emerald-950/35 via-[#11152d]/70 to-amber-950/25 px-6 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl md:my-12 md:px-10 md:py-14">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 34px, rgba(167,243,208,0.22) 35px 36px, transparent 37px 68px), repeating-linear-gradient(-45deg, transparent 0 34px, rgba(253,230,138,0.16) 35px 36px, transparent 37px 68px)' }} />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="grid min-h-[68vh] items-center gap-14 md:grid-cols-2">
          <div>
            <div lang="ar" dir="rtl" className="mb-7 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 text-lg text-cyan-200">
              السلام عليكم
            </div>

            <h2 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Building a future with

              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                knowledge &amp; values.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/60 md:text-lg">
              A welcoming place for students to learn Islamic education,
              develop good character, and grow with confidence.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/admission"
                className="rounded-xl bg-gradient-to-r from-violet-400 to-cyan-300 shadow-lg shadow-violet-500/30 px-7 py-3.5 font-semibold text-[#0b1026] transition hover:brightness-110"
              >
                Apply for Admission ↗
              </Link>

              <a
                href="#about"
                className="rounded-xl border border-white/15 bg-white/[0.08] px-7 py-3.5 font-semibold text-white/90 backdrop-blur-xl transition hover:bg-white/10"
              >
                Discover More
              </a>

              {/* NEW: Hero Status Button */}
              <Link
                to="/admission-status"
                className="rounded-xl border border-rose-400/35 bg-rose-950/70 px-7 py-3.5 font-semibold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:bg-rose-900/80"
              >
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />
                Check Admission Status →
              </Link>
              <Link
                to="/student-results"
                className="rounded-xl border border-rose-400/35 bg-rose-950/70 px-7 py-3.5 font-semibold text-rose-200 shadow-lg shadow-rose-950/30 transition hover:bg-rose-900/80"
              >
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-300" />
                Check Exam Results →
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <p className="text-xl font-bold text-cyan-300 sm:text-2xl">
                  Quality
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Education
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <p className="text-xl font-bold text-cyan-300 sm:text-2xl">
                  Caring
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Teachers
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <p className="text-xl font-bold text-cyan-300 sm:text-2xl">
                  Strong
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Values
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-3xl bg-violet-400/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/15 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Welcome to</p>

                  <h3 className="mt-1 text-2xl font-bold">
                    Our Maktab
                  </h3>
                </div>

                <img
                  src="/images/siddiqua-deeniyat-favicon.png"
                  alt="Siddiqua Deeniyat Maktab logo"
                  className="h-12 w-12 shrink-0 object-contain"
                />
              </div>

              <div className="my-8 overflow-hidden rounded-2xl border border-cyan-200/10 bg-[#071a59] shadow-lg shadow-black/20">
                <img
                  src="/images/institution-banner.png"
                  alt="Siddiqua Deeniyat Munazzam Maktab, established 2026. Contact: 9002569862 and 8348565184."
                  className="block h-auto w-full object-contain"
                  fetchPriority="high"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                  <p className="text-sm text-white/50">
                    Education
                  </p>

                  <p className="mt-2 font-semibold">
                    For Every Student
                  </p>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                  <p className="text-sm text-white/50">
                    Environment
                  </p>

                  <p className="mt-2 font-semibold">
                    Learn Together
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                <span className="text-xl text-cyan-300">✓</span>

                <p className="text-sm text-white/70">
                  Supporting students on their learning journey.
                </p>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Notices Section */}
        <section id="notices" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Latest Updates 📢
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Notices &amp; Announcements
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Stay updated with the latest announcements from our Maktab.
            </p>
          </div>

          {noticesLoading ? (
            <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-8 text-center text-white/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              Loading notices...
            </div>
          ) : noticeError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">
              Notices could not be loaded. Please try again later.
            </div>
          ) : notices.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-8 text-center backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              <div className="text-4xl">📢</div>

              <h3 className="mt-4 text-lg font-semibold">
                No Active Notices
              </h3>

              <p className="mt-2 text-sm text-white/45">
                There are no announcements at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {notices.map((notice) => (
                <article
                  key={notice._id}
                  className="rounded-2xl border border-cyan-300/20 bg-white/[0.08] p-6 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="break-words text-lg font-semibold text-cyan-200">
                      {notice.title}
                    </h3>

                    <span className="shrink-0 rounded-full bg-violet-400/10 px-3 py-1 text-xs text-cyan-300">
                      Active
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-white/65">
                    {notice.description}
                  </p>

                  {notice.date && (
                    <p className="mt-5 border-t border-white/20 pt-4 text-xs text-white/40">
                      Date:{' '}
                      {new Date(notice.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* About Us + Our Memories */}
        <section id="about" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* About Us */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                About Us
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Education with

                <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  purpose &amp; values.
                </span>
              </h2>

              <p className="mt-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2 text-sm font-semibold text-cyan-200">
                Established in 2026
              </p>

              <p className="mt-5 leading-8 text-white/60">
                Our aim is to provide students with a supportive learning
                environment where they can develop knowledge, discipline,
                confidence, and strong moral values.
              </p>

              <p className="mt-4 leading-8 text-white/60">
                We believe education is not only about learning but also
                about developing good character, respect, and responsibility.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  'Islamic education and values',
                  'A supportive learning environment',
                  'Character development and discipline',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/10 text-sm text-cyan-300">
                      ✓
                    </span>

                    <span className="text-sm text-white/70">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Memories */}
            <div id="gallery">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  Our Memories
                </p>

                <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                  Moments at Our Maktab
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  A glimpse of our learning community.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {GALLERY_IMAGES.slice(0, 4).map((item) => (
                  <button
                    type="button"
                    key={item.image}
                    onClick={() => setSelectedImage(item)}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                  >
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-violet-400/10 to-violet-300/5 sm:h-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026] via-black/10 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <h3 className="text-sm font-bold sm:text-base">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs text-white/60">
                          {item.description}
                        </p>
                      </div>

                      <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm opacity-0 backdrop-blur transition group-hover:opacity-100">
                        ↗
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-violet-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-violet-400/20"
                >
                  View All Photos <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              What We Offer
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Our Education
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/50">
              Helping students build knowledge, confidence, and strong values.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Quran Learning',
                description:
                  'Build a strong foundation through guided Quran learning.',
                icon: '📖',
              },
              {
                number: '02',
                title: 'Islamic Studies',
                description:
                  'Learn about Islamic teachings, practices, and traditions.',
                icon: '📚',
              },
              {
                number: '03',
                title: 'Character Building',
                description:
                  'Develop discipline, kindness, respect, and responsibility.',
                icon: '🌱',
              },
            ].map((item) => (
              <article
                key={item.number}
                className="rounded-3xl border border-white/20 bg-white/[0.08] p-7 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.15] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{item.icon}</span>

                  <span className="text-sm font-bold text-cyan-300">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-white/55">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Teachers Section */}
        <section id="teachers" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Meet Our Team
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Our Teachers
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
              Meet the teachers who guide our students on their learning journey.
            </p>
          </div>

          {teachersLoading ? (
            <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-8 text-center text-white/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              Loading teachers...
            </div>
          ) : teachersError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">
              Teachers could not be loaded. Please try again later.
            </div>
          ) : teachers.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-8 text-center backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              <div className="text-4xl">👨‍🏫</div>

              <h3 className="mt-4 text-lg font-semibold">
                Teacher Profiles Coming Soon
              </h3>

              <p className="mt-2 text-sm text-white/45">
                Teacher profiles will appear here when available.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teachers.map((teacher) => {
                const teacherPhoto =
                  typeof teacher.photo === 'string'
                    ? teacher.photo
                    : teacher.photo?.url ||
                      (typeof teacher.image === 'string'
                        ? teacher.image
                        : teacher.image?.url) ||
                      teacher.photoUrl ||
                      teacher.imageUrl ||
                      ''

                return (
                  <article
                    key={teacher._id}
                    className="group overflow-hidden rounded-3xl border border-white/20 bg-white/[0.08] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.15] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
                  >
                    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-linear-to-br from-violet-400/10 via-violet-300/5 to-transparent">
                      {teacherPhoto ? (
                        <img
                          src={teacherPhoto}
                          alt={teacher.name || 'Teacher'}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-300/20 bg-violet-400/10 text-5xl text-cyan-300">
                          👨‍🏫
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0b1026] to-transparent" />
                    </div>

                    <div className="p-5">
                      <h3 className="wrap-break-word text-lg font-bold text-white">
                        {teacher.name || 'Teacher'}
                      </h3>

                      <p className="mt-2 text-sm font-medium text-cyan-300">
                        {teacher.subject ||
                          teacher.specialization ||
                          teacher.qualification ||
                          'Teacher'}
                      </p>

                      {teacher.qualification && teacher.subject && (
                        <p className="mt-2 text-xs text-white/45">
                          {teacher.qualification}
                        </p>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Admission Section */}
        <section id="admission" className="mx-auto max-w-7xl px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-200/10 bg-cyan-300/6 p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Admissions
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold md:text-4xl">
                Join our learning community
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-white/60">
                Interested in admission? Contact us to learn about available
                classes, timings, and the admission process.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/admission"
                  className="inline-block rounded-xl bg-gradient-to-r from-violet-400 to-cyan-300 shadow-lg shadow-violet-500/30 px-7 py-3.5 font-semibold text-[#0b1026] transition hover:brightness-110"
                >
                  Apply Now ↗
                </Link>

                {/* NEW: Track Application */}
                <Link
                  to="/admission-status"
                  className="inline-block rounded-xl border border-cyan-300/30 bg-white/5 px-7 py-3.5 font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
                >
                  Track Your Application →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Contact Us
            </p>

            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Find &amp; Visit Our Maktab
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/60">
              Have questions about admissions or our educational programmes?
              Get in touch or find our location on the map.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Details */}
            <div className="rounded-3xl border border-white/20 bg-white/[0.08] p-7 backdrop-blur-xl sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              <h3 className="text-2xl font-bold">
                Get in Touch
              </h3>

              <p className="mt-3 leading-7 text-white/55">
                We are happy to help with admission enquiries and information
                about our Maktab.
              </p>

              <div className="mt-8 space-y-5">
                <ContactItem
                  icon="📍"
                  title="Our Location"
                  description={institutionAddress}
                >
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-cyan-300 hover:text-white"
                  >
                    Find us on Google Maps ↗
                  </a>
                </ContactItem>

                <ContactItem
                  icon="📞"
                  title="Phone Number"
                  description="Call either number:"
                >
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                    {contactNumbers.map((number) => (
                      <a
                        key={number}
                        href={`tel:${number}`}
                        className="text-cyan-300 hover:text-white"
                      >
                        {number}
                      </a>
                    ))}
                  </div>
                </ContactItem>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gradient-to-r from-violet-400 to-cyan-300 shadow-lg shadow-violet-500/30 px-5 py-3 text-sm font-bold text-[#0b1026] transition hover:brightness-110"
                >
                  Google Maps ↗
                </a>

                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Apple Maps ↗
                </a>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-white/[0.08] shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 border-b border-white/20 p-5">
                <div>
                  <h3 className="font-bold">Our Location</h3>

                  <p className="mt-1 text-xs text-white/50">
                    Explore the location on Google Maps
                  </p>
                </div>

                <span className="rounded-full border border-cyan-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  📍 Map
                </span>
              </div>

              <iframe
                title="Siddiqua Deeniyat Munazzam Maktab Google Map"
                src={embeddedMapUrl}
                width="100%"
                height="390"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="p-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-cyan-300 shadow-lg shadow-violet-500/30 px-5 py-3 text-sm font-bold text-[#0b1026] transition hover:brightness-110"
                >
                  Get Directions on Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Photo Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1026]/80 p-4 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-[#14103a]/70 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image preview"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white transition hover:bg-white/20"
            >
              ×
            </button>

            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[75vh] w-full object-contain"
            />

            <div className="p-5">
              <h3 className="text-xl font-bold">
                {selectedImage.title}
              </h3>

              <p className="mt-2 text-sm text-white/55">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 px-6 py-7">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Siddiqua Deeniyat Munazzam Maktab. All rights reserved.
          </p>

          <p>Knowledge • Faith • Values</p>
        </div>
      </footer>
    </div>
  )
}

function ContactItem({ icon, title, description, children }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/[0.08] p-4 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-violet-400/10 text-xl">
        {icon}
      </div>

      <div className="min-w-0">
        <h4 className="font-semibold text-cyan-200">
          {title}
        </h4>

        <p className="mt-1 wrap-break-word text-sm leading-6 text-white/55">
          {description}
        </p>

        {children}
      </div>
    </div>
  )
}

export default Home
