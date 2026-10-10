import { Link } from 'react-router-dom'
import '../App.css'

function AdmissionSuccess() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1026] via-[#1a1145] to-[#0b2a3d] bg-fixed px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-12">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10">
          <svg
            className="h-12 w-12 text-cyan-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Application Submitted
        </p>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Thank You!
        </h1>

        <p className="mt-5 leading-7 text-white/60">
          Your admission application has been submitted successfully.
          Thank you for choosing our Maktab.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/6 p-5 text-left">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <h2 className="font-semibold text-amber-200">
              Application Pending
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Your application is awaiting review by the Maktab administrator.
            Admission is not confirmed until your application is approved.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/"
            className="rounded-xl bg-cyan-400 px-6 py-3.5 font-semibold text-[#0b1026] transition hover:bg-cyan-300"
          >
            Back to Home →
          </Link>

          <Link
            to="/admission"
            className="rounded-xl border border-white/15 bbg-white/4 px-6 py-3.5 font-medium text-white/80 transition hover:bg-white/10"
          >
            Submit Another Application
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/35">
          Al-Noor Maktab • Knowledge • Faith • Values
        </p>
      </div>
    </div>
  )
}

export default AdmissionSuccess