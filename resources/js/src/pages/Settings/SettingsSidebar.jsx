import { CreditCard, LogOut, ShoppingCart, User, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSettingsModal } from '@/context/SettingsModalContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const TABS = [
  { key: 'Profile', label: 'Profile', Icon: User },
  { key: 'Plan', label: 'Plan', Icon: CreditCard },
  { key: 'Referral', label: 'Referral', Icon: Users },
  { key: 'History', label: 'History', Icon: ShoppingCart },
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
    <>
      {/* ── MOBILE: fixed bottom bar ── */}
      <div className="flex md:hidden absolute bottom-0 left-0 right-0 z-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl overflow-hidden">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                py-2.5 text-[10px] font-medium transition-all duration-150
                ${
                  isActive
                    ? 'text-[#2686D4] dark:text-[#F2901E]'
                    : 'text-gray-400 dark:text-gray-500'
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-[2.5px] w-8 rounded-full bg-[#2686D4] dark:bg-[#F2901E]" />
              )}
            </button>
          )
        })}

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-red-400 hover:text-red-500 disabled:opacity-40 transition-all duration-150"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── DESKTOP: vertical sidebar ── */}
      <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40">
        <div className="flex flex-col flex-1 p-3 gap-0.5">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  w-full flex items-center gap-2.5
                  px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                  border-l-[2.5px]
                  ${
                    isActive
                      ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-900 dark:text-white border-[#2686D4] dark:border-[#F2901E]'
                      : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon size={15} className="shrink-0" />
                <span>{label}</span>
              </button>
            )
          })}

          <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 border-l-[2.5px] border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-40"
          >
            <LogOut size={15} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
