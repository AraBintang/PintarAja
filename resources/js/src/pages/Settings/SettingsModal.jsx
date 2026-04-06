import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useSettingsModal } from '@/context/SettingsModalContext'

import FilesTab from './FilesTab'
import OrderHistoryTab from './OrderHistoryTab'
import PlanTab from './PlanTab'
import ProfileTab from './ProfileTab'
import ReferralTab from './ReferralTab'
import SettingsSidebar from './SettingsSidebar'

export default function SettingsModal() {
  const { open, openSettings, closeSettings } = useSettingsModal()

  const [activeTab, setActiveTab] = useState('Profile')
  const [searchParams, setSearchParams] = useSearchParams()

  const contentRef = useRef(null)
  const [showFadeTop, setShowFadeTop] = useState(false)
  const [showFadeBottom, setShowFadeBottom] = useState(true)

  const handleScroll = () => {
    const el = contentRef.current
    if (!el) return
    setShowFadeTop(el.scrollTop > 8)
    setShowFadeBottom(el.scrollHeight - el.scrollTop > el.clientHeight + 8)
  }

  useEffect(() => {
    setShowFadeTop(false)
    const el = contentRef.current
    if (el) {
      el.scrollTo({ top: 0 })
      setShowFadeBottom(el.scrollHeight > el.clientHeight + 8)
    }
  }, [activeTab])

  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      openSettings()

      const tab = searchParams.get('tab')

      if (tab === 'plan') {
        setActiveTab('Plan')
      } else if (tab === 'history') {
        setActiveTab('History')
      }

      // Clean the URL so that subsequent reloads don't automatically pop it open again unexpectedly
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('settings')
      newParams.delete('tab')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, openSettings, setSearchParams])

  if (!open) return null

  return (
    <div
      onClick={closeSettings}
      className="fixed inset-0 z-70 flex items-end justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-5xl md:m-auto min-h-[400px] md:min-h-[500px] max-h-[92dvh] md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Close button */}
        <button
          onClick={closeSettings}
          className="absolute top-3 right-3 md:top-4 md:right-5 z-10 p-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Sidebar: horizontal tab bar on mobile, vertical sidebar on desktop */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 min-h-0">
          {/* Fade atas */}
          <div
            className={`absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none bg-gradient-to-b from-white dark:from-gray-900 to-transparent transition-opacity duration-200 ${showFadeTop ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Scroll container */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto min-h-0 pb-[60px] md:pb-0"
          >
            {activeTab === 'Profile' && <ProfileTab setActiveTab={setActiveTab} />}
            {activeTab === 'Plan' && <PlanTab />}
            {activeTab === 'Files' && <FilesTab />}
            {activeTab === 'Referral' && <ReferralTab />}
            {activeTab === 'History' && <OrderHistoryTab />}
          </div>

          {/* Fade bawah */}
          <div
            className={`absolute bottom-[60px] md:bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-white dark:from-gray-900 to-transparent transition-opacity duration-200 ${showFadeBottom ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </div>
    </div>
  )
}
