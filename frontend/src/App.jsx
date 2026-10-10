import { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import { apiRequest } from './api'

import Home from './pages/Home'
import Admission from './pages/Admission'
import AdmissionSuccess from './pages/AdmissionSuccess'
import AdmissionStatus from './pages/AdmissionStatus'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

import Students from './pages/Students'
import StudentDetails from './pages/StudentDetails'

import Teachers from './pages/Teachers'
import TeacherDetails from './pages/TeacherDetails'

import Admissions from './pages/Admissions'
import FeePayments from './pages/FeePayments'
import SalaryPayments from './pages/SalaryPayments'
import ExamsResults from './pages/ExamsResults'
import Notices from './pages/Notices'
import Reports from './pages/Reports'
import Gallery from './pages/Gallery'


// Shared admin authentication cache.
// It prevents repeated verification on every section navigation.
let adminVerified = false
let verificationPromise = null


// Reset the cached verification after logout.
export function resetAdminVerification() {
  adminVerified = false
  verificationPromise = null

  window.dispatchEvent(
    new Event('admin-auth-changed')
  )
}


// Admin-only route protection
function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(adminVerified)
  const [checking, setChecking] = useState(!adminVerified)

  const location = useLocation()

  useEffect(() => {
    let active = true

    function handleAuthChange() {
      if (!active) return

      setAuthorized(adminVerified)
      setChecking(false)
    }

    window.addEventListener(
      'admin-auth-changed',
      handleAuthChange
    )

    async function verifyAdmin() {
      // Reuse the verified state when navigating between admin sections.
      if (adminVerified) {
        if (active) {
          setAuthorized(true)
          setChecking(false)
        }

        return
      }

      try {
        // Avoid duplicate requests while verification is in progress.
        if (!verificationPromise) {
          verificationPromise = apiRequest('/dashboard')
        }

        await verificationPromise

        adminVerified = true

        if (active) {
          setAuthorized(true)
        }
      } catch {
        adminVerified = false
        verificationPromise = null

        if (active) {
          setAuthorized(false)
        }
      } finally {
        if (active) {
          setChecking(false)
        }
      }
    }

    verifyAdmin()

    return () => {
      active = false

      window.removeEventListener(
        'admin-auth-changed',
        handleAuthChange
      )
    }
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking admin authentication...
      </div>
    )
  }

  if (!authorized) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return children
}


function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/admission"
        element={<Admission />}
      />

      <Route
        path="/admission-success"
        element={<AdmissionSuccess />}
      />

      <Route
        path="/admission-status"
        element={<AdmissionStatus />}
      />

      <Route
        path="/gallery"
        element={<Gallery />}
      />


      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />


      {/* Students */}
      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <Students />
          </AdminRoute>
        }
      />


      {/* Student Details */}
      <Route
        path="/admin/student-details"
        element={
          <AdminRoute>
            <StudentDetails />
          </AdminRoute>
        }
      />


      {/* Teachers */}
      <Route
        path="/admin/teachers"
        element={
          <AdminRoute>
            <Teachers />
          </AdminRoute>
        }
      />


      {/* Teacher Details */}
      <Route
        path="/admin/teacher-details"
        element={
          <AdminRoute>
            <TeacherDetails />
          </AdminRoute>
        }
      />


      {/* Admissions */}
      <Route
        path="/admin/admissions"
        element={
          <AdminRoute>
            <Admissions />
          </AdminRoute>
        }
      />


      {/* Fee Payments */}
      <Route
        path="/admin/fees"
        element={
          <AdminRoute>
            <FeePayments />
          </AdminRoute>
        }
      />


      {/* Salary Payments */}
      <Route
        path="/admin/salaries"
        element={
          <AdminRoute>
            <SalaryPayments />
          </AdminRoute>
        }
      />


      {/* Exams and Results */}
      <Route
        path="/admin/exams"
        element={
          <AdminRoute>
            <ExamsResults />
          </AdminRoute>
        }
      />


      {/* Notices */}
      <Route
        path="/admin/notices"
        element={
          <AdminRoute>
            <Notices />
          </AdminRoute>
        }
      />


      {/* Reports */}
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />


      {/* Unknown Route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App