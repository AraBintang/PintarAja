import { createContext, useContext, useState } from 'react'

const SettingsModalContext = createContext()

export function SettingsModalProvider({ children }) {
  const [open, setOpen] = useState(false)

  const openSettings = () => setOpen(true)
  const closeSettings = () => setOpen(false)

  return (
    <SettingsModalContext.Provider value={{ open, openSettings, closeSettings }}>
      {children}
    </SettingsModalContext.Provider>
  )
}

export const useSettingsModal = () => useContext(SettingsModalContext)
