import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useSettingsModal } from '@/context/SettingsModalContext'

import FilesTab from './components/FilesTab'
import OrderHistoryTab from './components/OrderHistoryTab'
import PlanTab from './components/PlanTab'
import ProfileTab from './components/ProfileTab'
import ReferralTab from './components/ReferralTab'
import SettingsSidebar from './components/SettingsSidebar'

const TAB_HEIGHTS = {
  Profile: 570,
  Plan: 620,
  Files: 670,
  Referral: 800,
  History: 650,
}

const TAB_HEIGHTS_MOBILE = {
  Profile: 630,
  Plan: 690,
  Files: 800,
  Referral: 800,
  History: 660,
}

export default function SettingsModal() {
  const { open, openSettings, closeSettings } = useSettingsModal()

  const [activeTab, setActiveTab] = useState('Profile')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFadeTop, setShowFadeTop] = useState(false)
  const [showFadeBottom, setShowFadeBottom] = useState(true)
  const [height, setHeight] = useState(TAB_HEIGHTS['Profile'])

  const contentRef = useRef(null)

  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768
      const heights = isMobile ? TAB_HEIGHTS_MOBILE : TAB_HEIGHTS
      setHeight(heights[activeTab] ?? 500)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [activeTab])

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-70 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeSettings}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0, height }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                  >
                    {activeTab === 'Profile' && <ProfileTab setActiveTab={setActiveTab} />}
                    {activeTab === 'Plan' && <PlanTab />}
                    {activeTab === 'Files' && <FilesTab />}
                    {activeTab === 'Referral' && <ReferralTab />}
                    {activeTab === 'History' && <OrderHistoryTab />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Fade bawah */}
              <div
                className={`absolute bottom-[60px] md:bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-white dark:from-gray-900 to-transparent transition-opacity duration-200 ${showFadeBottom ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
