import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app'
import { PlanProvider } from '@/context/PlanContext';

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <PlanProvider>
      <App />
    </PlanProvider>
  </StrictMode>,
)
