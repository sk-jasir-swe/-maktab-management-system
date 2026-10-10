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


// Protect all admin routes
function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const location = useLocation()

  useEffect(() => {
    let active = true

    async function verifyAdmin() {
      try {
        // Backend verifies the admin session.
        // apiRequest handles the existing token refresh flow.
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
      {/* Public pages */}
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


      {/* Public admin login */}
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


      {/* Teacher Details - Admin Only */}
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


      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App