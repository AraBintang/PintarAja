import { createBrowserRouter, Navigate } from 'react-router-dom'

import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import Landing from '@/pages/Landing'
import ProtectedRoute from '@/routes/protectedRoute'
import SidebarLayout from '@/layout/SidebarLayout'
import ChatPage from '@/pages/App/ChatPage'
import AIWriterPage from '@/pages/App/AIWriterPage'
import HumanizerPage from '@/pages/App/HumanizerPage'
import ParafrasePage from '@/pages/App/ParafrasePage'
import TranscribePage from '@/pages/App/TranscribePage'
import SettingsPage from '@/pages/App/SettingsPage'
import AdminUserPage from '@/pages/App/AdminUserPage'
import AdminAIPage from '@/pages/App/AdminAIPage'
import AdminAttributePage from '@/pages/App/AdminAttributePage'
import AdminPlanPage from '@/pages/App/AdminPlanPage'
import CouponPage from '@/pages/App/CouponPage'
import PromptAIPage from '@/pages/App/PromptAIPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  {
    path: '/app',
    element: <SidebarLayout />,
    children: [
      { index: true, element: <Navigate to="/app/chat" replace /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'docs', element: <AIWriterPage /> },
      { path: 'new', element: <ChatPage /> },
      { path: 'asisten', element: <HumanizerPage /> },
      { path: 'tanya', element: <ParafrasePage /> },
      { path: 'transkripsi', element: <TranscribePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin/attribute', element: <AdminAttributePage /> },
      { path: 'admin/ai', element: <AdminAIPage /> },
      { path: 'admin/plan', element: <AdminPlanPage /> },
      { path: 'admin/user', element: <AdminUserPage /> },
      { path: 'admin/coupons', element: <CouponPage /> },
      { path: 'admin/prompt', element: <PromptAIPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

