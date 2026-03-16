import {
  Cpu,
  FileText,
  Hash,
  Library,
  MessageSquare,
  Mic,
  PanelRight,
  Plus,
  Settings,
  Sparkles,
  Speech,
  Ticket,
  Users,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSettingsModal } from '@/context/SettingsModalContext'
import { useSidebar } from '@/context/SidebarContext'

const menuItems = [
  { label: 'New', icon: Plus, to: '/new', isNew: true },
  { label: 'AI Chat', icon: MessageSquare, to: '/chat' },
  { label: 'AI Writer', icon: FileText, to: '/writer' },
  { label: 'Paraphrase AI', icon: Hash, to: '/paraphrase' },
  { label: 'Humanizer AI', icon: Speech, to: '/humanize' },
  { label: 'Transcribe AI', icon: Mic, to: '/transcribe' },
]

const adminMenuItems = [
  { label: 'Attribute AI', icon: Zap, to: '/admin/attribute' },
  { label: 'Prompt AI', icon: Library, to: '/admin/prompt' },
  { label: 'AI', icon: Cpu, to: '/admin/ai' },
  { label: 'Plan Setting', icon: Sparkles, to: '/admin/plan' },
  { label: 'Coupons', icon: Ticket, to: '/admin/coupons' },
  { label: 'User', icon: Users, to: '/admin/user' },
]

function SidebarItem({ icon: Icon, label, to, expanded }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 group
          ${isActive ? 'bg-[#eeedeb] dark:bg-gray-900' : 'hover:bg-[#eeedeb] dark:hover:bg-gray-900'}
          ${expanded ? 'mx-2' : 'mx-1.5 justify-center'}
        `
      }
    >
      <span
        className={`flex-shrink-0 text-gray-600 dark:text-gray-400 ${expanded ? '' : 'mx-auto'}`}
      >
        <Icon className="w-5 h-5" />
      </span>
      {expanded && (
        <span className="text-[14px] font-medium text-gray-800 dark:text-gray-200 truncate">
          {label}
        </span>
      )}
    </NavLink>
  )
}

function UserProfileSection({ expanded }) {
  const { openSettings } = useSettingsModal()
  const { user } = useAuth()

  const userName = user?.name
  const userEmail = user?.email
  const userInitial = userName?.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <div className="px-3">
        <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
      </div>
      <div className="px-2">
        <button
          onClick={openSettings}
          className={`w-full rounded-xl flex items-center gap-3 transition-colors hover:bg-[#eeedeb] dark:hover:bg-gray-900 ${expanded ? 'px-4 py-2 my-2' : ' my-4 px-0 justify-center'}`}
        >
          <div className="w-9 h-9 rounded-full bg-[#2686D4] dark:bg-[#F2901E] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[14px] font-semibold">{userInitial}</span>
          </div>

          {expanded && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{userEmail}</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { expanded, toggle } = useSidebar()
  const { isAdmin } = useAuth()

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
          onClick={toggle}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-[#090d16] z-[70] flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800
                    ${expanded ? 'w-[260px] translate-x-0' : 'w-[64px] md:translate-x-0 -translate-x-full'}
        `}
      >
        <div className={`flex items-center h-14 ${expanded ? 'px-4' : 'px-0 justify-center'}`}>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title={expanded ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 space-y-0.5">
          {menuItems.map((item) => (
            <SidebarItem key={item.label} {...item} expanded={expanded} />
          ))}

          {isAdmin && (
            <>
              <div className={`mt-6 mb-2 ${expanded ? 'px-4' : 'px-0 text-center'}`}>
                {expanded ? (
                  <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Admin
                  </p>
                ) : (
                  <div className="px-3 pt-2 pb-[3px]">
                    <div className="w-full border-t border-gray-100 dark:border-gray-800 my-2"></div>
                  </div>
                )}
              </div>

              {adminMenuItems.map((item) => (
                <SidebarItem key={item.label} {...item} expanded={expanded} />
              ))}
            </>
          )}
        </nav>

        <UserProfileSection expanded={expanded} />
      </aside>
    </>
  )
}
