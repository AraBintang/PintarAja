import { Outlet } from 'react-router-dom'

import { RightSidebarProvider } from '@/context/RightSidebarContext'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import SettingsModal from '@/pages/Settings/SettingsModal'

import RightSidebar from './RightSidebar'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function LayoutInner() {
  const { expanded } = useSidebar()

  return (
    <div className="flex min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300 overflow-x-hidden">
      <Sidebar />

      <main
        className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${expanded ? 'md:ml-[260px]' : 'md:ml-[64px]'}`}
      >
        <TopBar />

        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      <RightSidebar />

      <SettingsModal />
    </div>
  )
}

export default function SidebarLayout() {
  return (
    <SidebarProvider>
      <RightSidebarProvider>
        <LayoutInner />
      </RightSidebarProvider>
    </SidebarProvider>
  )
}
