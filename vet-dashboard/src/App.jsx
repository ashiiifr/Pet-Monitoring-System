import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import NewAdmission from './pages/NewAdmission'
import Alerts from './pages/Alerts'
import LiveWard from './pages/LiveWard'
import NotFound from './pages/NotFound'
import Appointments from './pages/Appointments'
import Billing from './pages/Billing'
import Sidebar from './components/Sidebar'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />
    return (
      <div className="flex h-screen bg-slate-900 font-inter text-slate-100">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard user={user} /></ProtectedRoute>
      } />
      <Route path="/ward" element={
        <ProtectedRoute><LiveWard /></ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute><Patients /></ProtectedRoute>
      } />
      <Route path="/patients/new" element={
        <ProtectedRoute><NewAdmission /></ProtectedRoute>
      } />
      <Route path="/patient/:id" element={
        <ProtectedRoute><PatientDetail /></ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute><Alerts /></ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute><Appointments /></ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute><Billing /></ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
