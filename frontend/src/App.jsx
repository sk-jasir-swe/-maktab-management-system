import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import Admissions from './pages/Admissions'
import FeePayments from './pages/FeePayments'
import SalaryPayments from './pages/SalaryPayments'
import ExamsResults from './pages/ExamsResults'
import Notices from './pages/Notices'
import Reports from './pages/Reports'
import Gallery from './pages/Gallery'

// Protect all admin routes using existing authentication
function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let active = true

    async function verifyAdmin() {
      try {
        // Existing protected admin API verifies the session.
        // apiRequest also attempts refresh if the access token expires.
        await apiRequest('/dashboard')

        if (active) {
          setAuthorized(true)
        }
      } catch {
        if (active) {
          setAuthorized(false)
        }
      } finally {
        if (active) {
          setChecking(false)
        }
      }
    }

    setAuthorized(false)
    setChecking(true)
    verifyAdmin()

    return () => {
      active = false
    }
  }, [location.pathname])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking admin authentication...
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/admission" element={<Admission />} />
      <Route
        path="/admission-success"
        element={<AdmissionSuccess />}
      />
      <Route
        path="/admission-status"
        element={<AdmissionStatus />}
      />
      <Route path="/gallery" element={<Gallery />} />

      {/* Admin login is public */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* All admin pages require authentication */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <AdminRoute>
            <Students />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/student-details"
        element={
          <AdminRoute>
            <StudentDetails />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/teachers"
        element={
          <AdminRoute>
            <Teachers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/admissions"
        element={
          <AdminRoute>
            <Admissions />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/fees"
        element={
          <AdminRoute>
            <FeePayments />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/salaries"
        element={
          <AdminRoute>
            <SalaryPayments />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/exams"
        element={
          <AdminRoute>
            <ExamsResults />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/notices"
        element={
          <AdminRoute>
            <Notices />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App