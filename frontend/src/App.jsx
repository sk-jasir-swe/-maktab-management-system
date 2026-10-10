import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Admission from './pages/Admission'
import AdmissionSuccess from './pages/AdmissionSuccess'
import AdmissionStatus from './pages/AdmissionStatus'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Admissions from './pages/Admissions'
import FeePayments from './pages/FeePayments'
import SalaryPayments from './pages/SalaryPayments'
import ExamsResults from './pages/ExamsResults'
import Notices from './pages/Notices'
import Reports from './pages/Reports'
import Gallery from './pages/Gallery'

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/admission" element={<Admission />} />
      <Route path="/admission-success" element={<AdmissionSuccess />} />

      {/* Admission Status */}
      <Route
        path="/admission-status"
        element={<AdmissionStatus />}
      />

      {/* Admin Pages */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<Students />} />
      <Route path="/admin/teachers" element={<Teachers />} />
      <Route path="/admin/admissions" element={<Admissions />} />
      <Route path="/admin/fees" element={<FeePayments />} />
      <Route path="/admin/salaries" element={<SalaryPayments />} />
      <Route path="/admin/exams" element={<ExamsResults />} />
      <Route path="/admin/notices" element={<Notices />} />
      <Route path="/admin/reports" element={<Reports />} />

      {/* Gallery */}
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  )
}

export default App