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
    <div className="w-[240px] border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 p-6 space-y-1">
      <button
        onClick={() => setActiveTab('Profil')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
          activeTab === 'Profil'
            ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <User size={18} />
        Profil
      </button>

      <button
        onClick={() => setActiveTab('Subscription')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
          activeTab === 'Subscription'
            ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <CreditCard size={18} />
        Subscription
      </button>

      <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

      <button
        onClick={() => handleLogout()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  )
}
