import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  // eslint-disable-next-line no-undef
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return <Navigate to="/login" />
  return children
}
