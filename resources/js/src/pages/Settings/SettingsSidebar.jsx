import { CreditCard, LogOut, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSettingsModal } from '@/context/SettingsModalContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const TABS = [
  { key: 'Profile', label: 'Profile', Icon: User },
  { key: 'Plan', label: 'Plan', Icon: CreditCard },
  { key: 'History', label: 'Order History', Icon: ShoppingCart },
]

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
    <div className="w-full md:w-[220px] flex md:flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 shrink-0">
      <div className="flex md:flex-col flex-1 px-3 py-2 md:p-3 gap-0.5 overflow-x-auto md:overflow-x-visible no-scrollbar">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex-shrink-0 md:w-full flex items-center gap-2.5
                px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                border-l-[2.5px] md:border-l-[2.5px] border-b-0
                ${
                  isActive
                    ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-900 dark:text-white border-[#2686D4] dark:border-[#F2901E]'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          )
        })}

        <div className="hidden md:block border-t border-gray-100 dark:border-gray-800 my-2" />
        <div className="md:hidden self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex-shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 border-l-[2.5px] border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-40"
        >
          <LogOut size={15} className="shrink-0" />
          <span className="whitespace-nowrap">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
