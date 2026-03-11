import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext()

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(true)
  const toggle = () => setExpanded((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}
