import { createBrowserRouter, Navigate } from 'react-router-dom'

import SidebarLayout from '@/layout/SidebarLayout'
import AdminAIPage from '@/pages/Admin/AIPage'
import AdminAttributePage from '@/pages/Admin/AttributePage'
import CouponPage from '@/pages/Admin/CouponPage'
import AdminPlanPage from '@/pages/Admin/PlanPage'
import PromptAIPage from '@/pages/Admin/PromptAIPage'
import AdminUserPage from '@/pages/Admin/UserPage'
import AIWriterPage from '@/pages/App/AIWriterPage'
import ChatPage from '@/pages/App/ChatPage'
import HumanizerPage from '@/pages/App/HumanizerPage'
import ParafrasePage from '@/pages/App/ParafrasePage'
import PaymentPage from '@/pages/App/PaymentPage'
import TranscribePage from '@/pages/App/TranscribePage'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import GoogleAuth from '@/pages/Auth/GoogleAuth'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import Landing from '@/pages/Landing'
import AdminRoute from '@/routes/AdminRoute'
import GuestRoute from '@/routes/GuestRoute'
import ProtectedRoute from '@/routes/ProtectedRoute'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/home', element: <Landing /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/google-auth', element: <GoogleAuth /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          { index: true, element: <Navigate to="chat" replace /> },

          { path: 'new', element: <ChatPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'writer', element: <AIWriterPage /> },
          { path: 'humanize', element: <HumanizerPage /> },
          { path: 'paraphrase', element: <ParafrasePage /> },
          { path: 'transcribe', element: <TranscribePage /> },
          { path: 'payment', element: <PaymentPage /> },

          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/attribute', element: <AdminAttributePage /> },
              { path: 'admin/prompt', element: <PromptAIPage /> },
              { path: 'admin/ai', element: <AdminAIPage /> },
              { path: 'admin/plan', element: <AdminPlanPage /> },
              { path: 'admin/coupons', element: <CouponPage /> },
              { path: 'admin/user', element: <AdminUserPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])