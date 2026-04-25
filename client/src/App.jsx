import { Routes, Route, Navigate } from 'react-router-dom'
import Landing      from './pages/Landing'
import ExamRoom     from './pages/ExamRoom'
import OralFollowUp from './pages/OralFollowUp'
import Dashboard    from './pages/Dashboard'
export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/exam"      element={<ExamRoom />} />
      <Route path="/followup"  element={<OralFollowUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}
