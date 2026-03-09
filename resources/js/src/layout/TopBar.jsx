import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessagesSquare, History, Sun, Moon, Monitor, Menu, Crown } from 'lucide-react';
import { useRightSidebar } from './RightSidebarContext';
import { useSidebar } from './SidebarContext';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

/**
 * TopBar – Reusable top bar for the app layout.
 * Shows a message-square icon on /app/chat, history icon on other pages.
 * Always shows the dark mode toggle on the right.
 */
export default function TopBar() {
    const location = useLocation();
    const { toggle: toggleRight } = useRightSidebar();
    const { toggle: toggleLeft } = useSidebar();
    const { theme, toggleTheme } = useTheme();
    const isAdminPage = location.pathname.startsWith('/app/admin');
    const isChatPage = location.pathname === '/app/chat' || location.pathname === '/app/new';

    return (
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 md:px-4 bg-white/80 dark:bg-[#11131c]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            {/* Mobile Logo & Toggle */}
            <div className="flex items-center gap-0.5 md:hidden -ml-1">
                <button
                    onClick={toggleLeft}
                    className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" strokeWidth={2.5} />
                </button>
                <Link to="/" className="flex items-center mt-0.5">
                    <img src="/p doank.png" alt="Logo" className="w-[26px] h-[26px] object-contain" />
                </Link>
            </div>

            {/* Desktop Spacer (since we use justify-between now) */}
            <div className="hidden md:block"></div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* Mobile Controls (Premium, Theme, History) */}
                <div className="flex md:hidden items-center gap-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-0.5 rounded-full shadow-sm">
                    {/* Premium Button */}
                    <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#4A90D9]/10 text-[#4A90D9] rounded-full text-[10px] font-bold border border-[#4A90D9]/20 flex-shrink-0">
                        <Crown className="w-3 h-3 fill-current" />
                        Premium
                    </button>

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
                        title={`Tema: ${theme}`}
                    >
                        {theme === 'light' && <Sun className="w-[14px] h-[14px]" />}
                        {theme === 'dark' && <Moon className="w-[14px] h-[14px]" />}
                        {theme === 'system' && <Monitor className="w-[14px] h-[14px]" />}
                    </button>

                    {/* History toggle */}
                    {!isAdminPage && (
                        <button
                            onClick={toggleRight}
                            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
                            title={isChatPage ? 'Riwayat Percakapan' : 'Riwayat'}
                        >
                            {isChatPage ? (
                                <MessagesSquare className="w-[14px] h-[14px]" />
                            ) : (
                                <History className="w-[14px] h-[14px]" />
                            )}
                        </button>
                    )}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-sm">
                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all capitalize"
                        title={`Tema: ${theme}`}
                    >
                        {theme === 'light' && <Sun className="w-[18px] h-[18px]" />}
                        {theme === 'dark' && <Moon className="w-[18px] h-[18px]" />}
                        {theme === 'system' && <Monitor className="w-[18px] h-[18px]" />}
                    </button>

                    {/* History/Chat toggle (hidden on Admin pages) */}
                    {!isAdminPage && (
                        <button
                            onClick={toggleRight}
                            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
                            title={isChatPage ? 'Riwayat Percakapan' : 'Riwayat'}
                        >
                            {isChatPage ? (
                                <MessagesSquare className="w-[18px] h-[18px]" />
                            ) : (
                                <History className="w-[18px] h-[18px]" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
