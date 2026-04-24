import { ChevronRight, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function UpgradeBanner({ user, onUpgradeClick }) {
  const isMobile = window.innerWidth < 768

  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (user?.plan_id === 1) {
      const t = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(t)
    }
  }, [user])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => setDismissed(true), 400)
  }

  if (!user || user.plan_id !== 1 || dismissed) return null

  return (
    <div
      style={{
        transform: visible
          ? `translateY(${isMobile ? '50px' : '0px'}) scale(1)`
          : 'translateY(-120%) scale(0.2)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        zIndex: 50,
      }}
      className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-3"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg
        bg-white dark:bg-gray-800"
      >
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Upgrade your plan</p>
          <p className="mt-1 text-xs text-gray-900 dark:text-white">
            Upgrade your plan at any time to get more features and benefits.
          </p>
        </div>

        {/* Upgrade button */}
        <button
          onClick={onUpgradeClick}
          className="shrink-0 flex items-center gap-1 px-4 py-3 rounded-lg text-xs font-bold
            bg-blue-500/20 text-[#2686D4] hover:bg-blue-500/40
            dark:bg-orange-500/20 dark:text-[#F2901E] dark:hover:bg-orange-500/40 transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          Upgrade
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg
            text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-400
            transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
