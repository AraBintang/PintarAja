import { X } from 'lucide-react'
import { useState } from 'react'

import { useSettingsModal } from '@/context/SettingsModalContext'

import ProfileTab from './ProfileTab'
import SettingsSidebar from './SettingsSidebar'
import SubscriptionTab from './SubscriptionTab'

export default function SettingsModal() {
  const { open, closeSettings } = useSettingsModal()

  const [activeTab, setActiveTab] = useState('Profil')

  if (!open) return null

  return (
    <div
      onClick={closeSettings}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex"
      >
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 p-8 overflow-y-auto max-h-[80vh]">
          {activeTab === 'Profil' && <ProfileTab />}
          {activeTab === 'Subscription' && <SubscriptionTab />}
        </div>

        <button
          onClick={closeSettings}
          className="absolute top-4 right-5 text-gray-500 hover:text-black dark:hover:text-white"
        >
          <X />
        </button>
      </div>
    </div>
  )
}
