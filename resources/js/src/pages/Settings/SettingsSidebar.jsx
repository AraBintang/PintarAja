import { CreditCard, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSettingsModal } from '@/context/SettingsModalContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function SettingsSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { closeSettings } = useSettingsModal()
  const { showSnackbar } = useSnackbar()

  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return

    setLoading(true)

    try {
      await request('/logout', { method: 'POST' })

      logout()
      closeSettings()

      navigate('/login', { replace: true })
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full md:w-[240px] flex md:flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 shrink-0">
      {/* Mobile: horizontal tab bar | Desktop: vertical sidebar */}
      <div className="flex md:flex-col flex-1 px-3 pr-12 py-2 md:p-4 gap-1 md:gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
        <button
          onClick={() => setActiveTab('Profil')}
          className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'Profil'
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <User size={18} className="shrink-0" />
          <span>Profil</span>
        </button>

        <button
          onClick={() => setActiveTab('Subscription')}
          className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'Subscription'
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CreditCard size={18} className="shrink-0" />
          <span>Subscription</span>
        </button>

        {/* Divider: vertical on mobile, horizontal on desktop */}
        <div className="hidden md:block border-t border-gray-200 dark:border-gray-800 my-2"></div>
        <div className="md:hidden self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button
          onClick={() => handleLogout()}
          className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-semibold transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="whitespace-nowrap">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
