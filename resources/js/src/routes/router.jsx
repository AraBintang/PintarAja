import { createBrowserRouter } from 'react-router-dom'

import Login from '@/pages/login'
import Register from '@/pages/register'
import ProtectedRoute from '@/routes/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
])
