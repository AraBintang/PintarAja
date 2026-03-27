import { createContext, useContext, useState } from 'react'

const SnackbarContext = createContext()

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: 'info',
    message: '',
  })

  const showSnackbar = (type = 'info', message) => {
    setSnackbar({ open: true, type, message })

    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }))
    }, 3000)
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 pointer-events-none">
        <div
          className={`
            px-6 py-3 text-white rounded-xl shadow-lg
            transition-all duration-300 ease-out
            ${colors[snackbar.type]}
            ${
              snackbar.open
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-15 scale-0'
            }
          `}
        >
          {snackbar.message}
        </div>
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  return useContext(SnackbarContext)
}
