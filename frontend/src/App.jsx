import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NewComplaint from './pages/NewComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import Layout from './components/Layout'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loader-screen"><div className="spinner"></div></div>
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loader-screen"><div className="spinner"></div></div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="student">
          <Layout><StudentDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/complaints/new" element={
        <ProtectedRoute requiredRole="student">
          <Layout><NewComplaint /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/complaints/:id" element={
        <ProtectedRoute>
          <Layout><ComplaintDetail /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
