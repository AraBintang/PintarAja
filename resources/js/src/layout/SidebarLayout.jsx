import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import PlanSelectionModal from '@/components/plan/PlanSelectionModal'
import UpgradeBanner from '@/components/UpgradeBanner'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useAuth } from '@/context/AuthContext'
import { RightSidebarProvider } from '@/context/RightSidebarContext'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import SettingsModal from '@/pages/Settings/SettingsModal'

import RightSidebar from './RightSidebar'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function LayoutInner() {
  const { expanded } = useSidebar()
  const { user } = useAuth()

  const [planModalOpen, setPlanModalOpen] = useState(false)

  const sidebarW = expanded ? 260 : 64

  return (
    <div className="flex min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300 overflow-x-hidden">
      <Sidebar onUpgradeClick={() => setPlanModalOpen(true)} />

      <main
        style={{ '--sidebar-w': `${sidebarW}px` }}
        className={`relative flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${expanded ? 'md:ml-[260px]' : 'md:ml-[64px]'}`}
      >
        <TopBar user={user} />

        <UpgradeBanner user={user} onUpgradeClick={() => setPlanModalOpen(true)} />

        <div className="flex-1 hide-scrollbar">
          <Outlet />
        </div>
      </main>

      <WhatsAppButton />

      <RightSidebar />

      <SettingsModal />

      <PlanSelectionModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} />
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
