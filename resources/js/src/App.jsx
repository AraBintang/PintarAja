import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/context/ThemeContext'
import { router } from '@/routes/Router'
import 'flag-icons/css/flag-icons.min.css'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
