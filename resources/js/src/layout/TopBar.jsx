import { Crown, History, Menu, MessagesSquare, Monitor, Moon, Sun, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useRightSidebar } from '@/context/RightSidebarContext'
import { useSidebar } from '@/context/SidebarContext'
import { useTheme } from '@/context/ThemeContext'

export default function TopBar() {
  const location = useLocation()
  const { toggle: toggleRight } = useRightSidebar()
  const { toggle: toggleLeft } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  const isHumanizePage = location.pathname.startsWith('/humanize')
  const isAdminPage = location.pathname.startsWith('/admin')
  const isChatPage = location.pathname === '/chat' || location.pathname === '/new'

  return (
    <>
      <div className="fixed top-3 left-3 z-40 md:hidden">
        <button
          onClick={toggleLeft}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Menu />
        </button>
      </div>

      <div className="fixed top-3 right-3 z-40 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5 pl-2 !pr-2.5 rounded-full shadow">
        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold border  bg-blue-50 text-[#2686D4] dark:text-[#F2901E] border-blue-200 dark:border-orange-500/30 dark:bg-orange-500/10">
          {user?.plan_id !== 1 ? (
            <Crown className="w-3 h-3 fill-current" />
          ) : (
            <User className="w-3 h-3 fill-current" />
          )}
          {user?.plan_name}
        </button>
          
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
        >
          {theme === 'light' && <Sun className="w-[18px] h-[18px]" />}
          {theme === 'dark' && <Moon className="w-[18px] h-[18px]" />}
          {theme === 'system' && <Monitor className="w-[18px] h-[18px]" />}
        </button>

        {!isAdminPage && !isHumanizePage && (
          <button
            onClick={toggleRight}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
          >
            {isChatPage ? (
              <MessagesSquare className="w-[18px] h-[18px]" />
            ) : (
              <History className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </div>
    </>
  )
}
