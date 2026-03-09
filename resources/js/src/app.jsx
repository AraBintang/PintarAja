import { RouterProvider } from 'react-router-dom'
import 'flag-icons/css/flag-icons.min.css'
import { router } from '@/routes/router'
import { ThemeProvider } from '@/context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
