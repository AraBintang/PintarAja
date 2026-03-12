import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useSettingsModal } from '@/context/SettingsModalContext'

import ProfileTab from './ProfileTab'
import SettingsSidebar from './SettingsSidebar'
import SubscriptionTab from './SubscriptionTab'

export default function SettingsModal() {
  const { open, openSettings, closeSettings } = useSettingsModal()

  const [activeTab, setActiveTab] = useState('Profil')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      openSettings()
      
      const tab = searchParams.get('tab')
      if (tab === 'subscription') {
        setActiveTab('Subscription')
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
      className="fixed inset-0 z-70 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm px-3 md:px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-5xl h-[92dvh] md:h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row max-w-[calc(100%-1.5rem)] md:max-w-5xl mx-auto"
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
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'Profil' && <ProfileTab />}
          {activeTab === 'Subscription' && <SubscriptionTab />}
        </div>
      </div>
    </div>
  )
}
