import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { PlanProvider } from '@/context/PlanContext'
import { SettingsModalProvider } from '@/context/SettingsModalContext'
import { SnackbarProvider } from '@/context/SnackbarContext'

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <SnackbarProvider>
      <AuthProvider>
        <SettingsModalProvider>
          <PlanProvider>
            <App />
          </PlanProvider>
        </SettingsModalProvider>
      </AuthProvider>
    </SnackbarProvider>
  </StrictMode>,
)
