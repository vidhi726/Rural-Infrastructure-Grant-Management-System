'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Bell, Moon, Sun, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { getUserProfile, getNotifications, markNotificationAsRead } from '@/lib/db/actions'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileModal from './ProfileModal'

export default function TopBar() {
    const [user, setUser] = useState<any>(null)
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifications, setShowNotifications] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLButtonElement>(null)
    const notifDropdownRef = useRef<HTMLDivElement>(null)

    const pathname = usePathname()
    const router = useRouter()


    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        setCurrentTime(new Date())

        // Check for saved theme
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true)
            document.documentElement.classList.add('dark')
        }

        async function getUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const { user } = await res.json();
                    if (user) {
                        console.log('TopBar: Found session user, fetching profile...', user.id || user._id);
                        const userId = user.id || user._id;
                        const profile = await getUserProfile(userId);
                        console.log('TopBar: Profile fetched:', profile?.full_name);
                        setUser({ ...user, profile });

                        const notifs = await getNotifications(userId);
                        setNotifications(notifs);
                    }
                } else {
                    console.log('TopBar: /api/auth/me returned not OK', res.status);
                    const notifs = await getNotifications();
                    setNotifications(notifs);
                }
            } catch (err: any) {
                console.error('TopBar: Error in getUser:', err);
            }
        }
        getUser()

        // Realtime Subscription removed for migration. Polling could be added here.
        const timerNotifs = setInterval(async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const { user } = await res.json();
                    if (user) {
                        const notifs = await getNotifications(user.id);
                        setNotifications(notifs);
                    }
                }
            } catch (e) { }
        }, 30000);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
            if (
                notifDropdownRef.current &&
                !notifDropdownRef.current.contains(event.target as Node) &&
                notifRef.current &&
                !notifRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            clearInterval(timer)
            clearInterval(timerNotifs)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleNotificationClick = async (notif: any) => {
        if (!notif.is_read) {
            try {
                await markNotificationAsRead(notif.id)
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
            } catch (err) {
                console.error('Failed to mark read', err)
            }
        }
        if (notif.link) {
            setShowNotifications(false)
            router.push(notif.link)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    const toggleTheme = () => {
        const nextMode = !isDarkMode
        setIsDarkMode(nextMode)
        if (nextMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const getPageTitle = () => {
        const path = pathname.split('/').pop() || 'Dashboard'
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
    }

    return (
        <>
            <header className="h-20 bg-[var(--card-bg)] backdrop-blur-md border-b border-[var(--card-border)] px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
                {/* Left Section: Breadcrumbs / Title */}
                <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)] transition-colors duration-300">{getPageTitle()}</h2>
                    {mounted && currentTime && (
                        <p className="text-xs text-[var(--text-muted)] font-medium whitespace-nowrap transition-colors duration-300">
                            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* Center Section: Search */}
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-sky-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for grants, projects or villages..."
                            suppressHydrationWarning
                            className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border-none rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-sky-500/20 focus:bg-[var(--card-bg)] transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Right Section: Utilities & User */}
                <div className="flex items-center gap-6">
                    {/* Icons */}
                    <div className="flex items-center gap-2 pr-6 border-r border-[var(--card-border)]">
                        <div className="relative">
                            <button
                                ref={notifRef}
                                onClick={() => setShowNotifications(!showNotifications)}
                                suppressHydrationWarning
                                className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative ${showNotifications ? 'bg-black/5 dark:bg-white/5' : ''}`}
                            >
                                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--card-bg)]"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        ref={notifDropdownRef}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden z-40 max-h-[80vh] flex flex-col"
                                    >
                                        <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
                                            <h3 className="font-bold text-[var(--text-main)]">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-xs font-medium text-white px-2 py-0.5 rounded-full bg-red-500">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>

                                        <div className="overflow-y-auto custom-scrollbar flex-1">
                                            {notifications.length > 0 ? (
                                                <div>
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 border-b border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-sky-500/5' : ''}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-sky-500' : 'bg-transparent'}`} />
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-medium mb-1 ${!notif.is_read ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                                                        {notif.title}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
                                                                        {notif.message}
                                                                    </p>
                                                                    <p className="text-[10px] text-[var(--text-muted)] opacity-70">
                                                                        {new Date(notif.created_at).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-[var(--text-muted)]">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No notifications yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={toggleTheme}
                            suppressHydrationWarning
                            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] transition-colors"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* User Info Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-3 cursor-pointer group p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[var(--text-main)] group-hover:text-sky-600 transition-colors">
                                    {user?.profile?.full_name || user?.full_name || 'Guest'}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                                    {user?.profile?.role?.replace('_', ' ') || user?.role?.replace('_', ' ') || 'Visitor'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-[var(--card-border)] group-hover:border-sky-200 transition-all overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-sky-100/50 to-indigo-100/50 dark:from-sky-900/30 dark:to-indigo-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
                                    {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-slate-600 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden z-40"
                                >
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setShowProfileModal(true)
                                                setShowProfileMenu(false)
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-[var(--text-muted)]" />
                                            My Profile
                                        </button>
                                        <div className="h-px bg-[var(--card-border)] my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
            />
        </>
    )
}
