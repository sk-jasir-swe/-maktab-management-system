import { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import { apiRequest } from '../services/api'
import { adminAuth } from '../services/adminAuth'

import Home from '../pages/Home'
import Admission from '../pages/Admission'
import AdmissionSuccess from '../pages/AdmissionSuccess'
import AdmissionStatus from '../pages/AdmissionStatus'

import AdminLogin from '../pages/Login'
import AdminDashboard from '../pages/admin/Dashboard'

import Students from '../pages/admin/students/StudentList'
import StudentDetails from '../pages/admin/students/StudentDetails'

import Teachers from '../pages/admin/teachers/TeacherList'
import TeacherDetails from '../pages/admin/teachers/TeacherDetails'

import Admissions from '../pages/admin/admissions/AdmissionList'
import FeePayments from '../pages/admin/fees/FeeList'
import SalaryPayments from '../pages/admin/salaries/SalaryPayments'
import ExamsResults from '../pages/admin/exams/ExamsResults'
import Notices from '../pages/admin/notices/Notices'
import Reports from '../pages/admin/reports/Reports'
import Gallery from '../pages/Gallery'


// Admin-only route protection
function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(adminAuth.verified)
  const [checking, setChecking] = useState(!adminAuth.verified)

  const location = useLocation()

  useEffect(() => {
    let active = true

    function handleAuthChange() {
      if (!active) return

      setAuthorized(adminAuth.verified)
      setChecking(false)
    }

    window.addEventListener(
      'admin-auth-changed',
      handleAuthChange
    )

    async function verifyAdmin() {
      // Reuse the verified state when navigating between admin sections.
      if (adminAuth.verified) {
        if (active) {
          setAuthorized(true)
          setChecking(false)
        }

        return
      }

      try {
        // Avoid duplicate requests while verification is in progress.
        if (!adminAuth.verificationPromise) {
          adminAuth.verificationPromise = apiRequest('/dashboard')
        }

        await adminAuth.verificationPromise

        adminAuth.verified = true

        if (active) {
          setAuthorized(true)
        }
      } catch {
        adminAuth.verified = false
        adminAuth.verificationPromise = null

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