import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { Zap, Library, Ticket, Users, Cpu, Sparkles, User, Gift, LogOut, Settings } from 'lucide-react';

/* ─── Icon Components ─── */
const ToggleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ChatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const DocsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 12h8M8 17h4" />
    </svg>
);

const AssistantIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const QuestionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
);

const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

/* ─── Menu Items Configuration ─── */
const menuItems = [
    { label: 'Baru', icon: PlusIcon, to: '/app/new', isNew: true },
    { label: 'AI Chat', icon: ChatIcon, to: '/app/chat' },
    { label: 'AI Writer', icon: DocsIcon, to: '/app/docs' },
    { label: 'Parafrase AI', icon: QuestionIcon, to: '/app/tanya' },
    { label: 'Humanizer AI', icon: AssistantIcon, to: '/app/asisten' },
    { label: 'Transcribe AI', icon: MicIcon, to: '/app/transkripsi' },
];

const adminMenuItems = [
    { label: 'Attribute AI', icon: Zap, to: '/app/admin/attribute' },
    { label: 'Prompt AI', icon: Library, to: '/app/admin/prompt' },
    { label: 'AI', icon: Cpu, to: '/app/admin/ai' },
    { label: 'Plan Setting', icon: Sparkles, to: '/app/admin/plan' },
    { label: 'Coupons', icon: Ticket, to: '/app/admin/coupons' },
    { label: 'User', icon: Users, to: '/app/admin/user' },
];

/* ─── Sidebar Item ─── */
function SidebarItem({ icon: Icon, label, to, isNew, expanded }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 group
                 ${isActive ? 'bg-[#eeedeb] dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                 ${expanded ? 'mx-2' : 'mx-1.5 justify-center'}
                `
            }
        >
            <span className={`flex-shrink-0 text-gray-600 dark:text-gray-400 ${expanded ? '' : 'mx-auto'}`}>
                <Icon />
            </span>
            {expanded && (
                <span className="text-[14px] font-medium text-gray-800 dark:text-gray-200 truncate">
                    {label}
                </span>
            )}
        </NavLink>
    );
}

/* ─── Main Sidebar ─── */
export default function Sidebar() {
    const { expanded, toggle } = useSidebar();

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
                    onClick={toggle}
                />
            )}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 z-[70] flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800
                            ${expanded ? 'w-[260px] translate-x-0' : 'w-[64px] md:translate-x-0 -translate-x-full'}
                `}
            >
                {/* Toggle Button */}
                <div className={`flex items-center h-14 ${expanded ? 'px-4' : 'px-0 justify-center'}`}>
                    <button
                        onClick={toggle}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        title={expanded ? 'Tutup sidebar' : 'Buka sidebar'}
                    >
                        <ToggleIcon />
                    </button>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 space-y-0.5">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            expanded={expanded}
                        />
                    ))}

                    {/* Admin Section */}
                    <div className={`mt-6 mb-2 ${expanded ? 'px-4' : 'px-0 text-center'}`}>
                        {expanded ? (
                            <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Admin</p>
                        ) : (
                            <div className="w-full border-t border-gray-100 dark:border-gray-800 my-2"></div>
                        )}
                    </div>
                    {adminMenuItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            expanded={expanded}
                        />
                    ))}
                </nav>

                {/* Bottom User Profile */}
                <UserProfileSection expanded={expanded} />
            </aside>
        </>
    );
}

import { useNavigate } from 'react-router-dom';

/* ─── User Profile Section ─── */
function UserProfileSection({ expanded }) {
    const navigate = useNavigate();

    const userName = 'Adi Kurniawan';
    const userEmail = 'sekolahonline55@gmail.com';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="relative border-t border-gray-100 dark:border-gray-800">
            {/* Profile Bar */}
            <button
                onClick={() => navigate('/app/settings')}
                className={`w-full flex items-center gap-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${expanded ? 'px-4' : 'px-0 justify-center'}`}
            >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#7C5CFC] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[14px] font-semibold">{userInitial}</span>
                </div>

                {expanded && (
                    <>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">{userName}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{userEmail}</p>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    </>
                )}
            </button>
        </div>
    );
}
