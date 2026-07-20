import { createBrowserRouter } from 'react-router-dom'

import SidebarLayout from '@/layout/SidebarLayout'
import AdminAIPage from '@/pages/Admin/AIPage'
import BlogPage from '@/pages/Admin/BlogPage'
import CouponPage from '@/pages/Admin/CouponPage'
import DiscountCouponPage from '@/pages/Admin/DiscountCouponPage'
import MiscellaneousPage from '@/pages/Admin/MiscellaneousPage'
import AdminPaperPage from '@/pages/Admin/PaperPage'
import AdminPlanPage from '@/pages/Admin/PlanPage'
import PromptAIPage from '@/pages/Admin/PromptAIPage'
import AdminUserPage from '@/pages/Admin/UserPage'
import WebSettingPage from '@/pages/Admin/WebSettingPage'
import TokenCostPage from '@/pages/Admin/TokenCostPage'
import ChatPage from '@/pages/App/ChatPage'
import HumanizerPage from '@/pages/App/HumanizerPage'
import ParafrasePage from '@/pages/App/ParafrasePage'
import PlagiarismPage from '@/pages/App/PlagiarismPage'
import TranscribePage from '@/pages/App/TranscribePage'
import WriterPage from '@/pages/App/WriterPage'
import ImageGenerator from '@/pages/ImageGenerator'
import VideoGenerator from '@/pages/VideoGenerator'
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

import ApiTokenPage from '@/pages/Admin/ApiTokenPage'

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
          { path: 'chat/:id?', element: <ChatPage /> },
          { path: 'writer', element: <WriterPage /> },
          { path: 'humanize', element: <HumanizerPage /> },
          { path: 'paraphrase', element: <ParafrasePage /> },
          { path: 'transcribe', element: <TranscribePage /> },
          { path: 'plagiarism', element: <PlagiarismPage /> },
          { path: 'generate-image', element: <ImageGenerator /> },
          { path: 'generate-video', element: <VideoGenerator /> },

          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/blog', element: <BlogPage /> },
              { path: 'admin/paper', element: <AdminPaperPage /> },
              { path: 'admin/prompt', element: <PromptAIPage /> },
              { path: 'admin/ai', element: <AdminAIPage /> },
              { path: 'admin/plan', element: <AdminPlanPage /> },
              { path: 'admin/coupons', element: <CouponPage /> },
              { path: 'admin/discount-coupons', element: <DiscountCouponPage /> },
              { path: 'admin/user', element: <AdminUserPage /> },
              { path: 'admin/api-tokens', element: <ApiTokenPage /> },
              { path: 'admin/token-costs', element: <TokenCostPage /> },
              { path: 'admin/web-settings', element: <WebSettingPage /> },
              { path: 'admin/misc', element: <MiscellaneousPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
