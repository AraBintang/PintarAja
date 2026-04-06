import { createBrowserRouter } from 'react-router-dom'

import SidebarLayout from '@/layout/SidebarLayout'
import AdminAIPage from '@/pages/Admin/AIPage'
import CouponPage from '@/pages/Admin/CouponPage'
import AdminPaperPage from '@/pages/Admin/PaperPage'
import AdminPlanPage from '@/pages/Admin/PlanPage'
import PromptAIPage from '@/pages/Admin/PromptAIPage'
import AdminUserPage from '@/pages/Admin/UserPage'
import WebSettingPage from '@/pages/Admin/WebSettingPage'
import ChatPage from '@/pages/App/ChatPage'
import HumanizerPage from '@/pages/App/HumanizerPage'
import ParafrasePage from '@/pages/App/ParafrasePage'
import PlagiarismPage from '@/pages/App/PlagiarismPage'
import TranscribePage from '@/pages/App/TranscribePage'
import WriterPage from '@/pages/App/WriterPage'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import GoogleAuth from '@/pages/Auth/GoogleAuth'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import ResetPassword from '@/pages/Auth/ResetPassword'
import Landing from '@/pages/Landing'
import NotFoundPage from '@/pages/NotFoundPage'
import CheckoutPage from '@/pages/Payment/CheckoutPage'
import PaymentPage from '@/pages/Payment/PaymentPage'
import AdminRoute from '@/routes/AdminRoute'
import GuestRoute from '@/routes/GuestRoute'
import ProtectedRoute from '@/routes/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },

  {
    element: <GuestRoute />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      // /new-password?email=user@example.com&token=xxx
      { path: 'new-password', element: <ResetPassword /> },
      { path: 'google-auth', element: <GoogleAuth /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payment', element: <PaymentPage /> },
      {
        element: <SidebarLayout />,
        children: [
          { path: 'new', element: <ChatPage /> },
          { path: 'chat', element: <ChatPage /> },
          { path: 'writer', element: <WriterPage /> },
          { path: 'humanize', element: <HumanizerPage /> },
          { path: 'paraphrase', element: <ParafrasePage /> },
          { path: 'transcribe', element: <TranscribePage /> },
          { path: 'plagiarism', element: <PlagiarismPage /> },

          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/paper', element: <AdminPaperPage /> },
              { path: 'admin/prompt', element: <PromptAIPage /> },
              { path: 'admin/ai', element: <AdminAIPage /> },
              { path: 'admin/plan', element: <AdminPlanPage /> },
              { path: 'admin/coupons', element: <CouponPage /> },
              { path: 'admin/user', element: <AdminUserPage /> },
              { path: 'admin/web-settings', element: <WebSettingPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
