'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Home,
    FileText,
    Building2,
    Users,
    UserCircle,
    Landmark,
    Shield,
    Settings,
    LogOut,
    LayoutDashboard,
    Search,
    ChevronRight
} from 'lucide-react'
import { useEffect, useState } from 'react'

const mainLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/about', label: 'About System', icon: Users },
]

const roleLinks: Record<string, any[]> = {
    citizen: [
        { href: '/citizen', label: 'My Portal', icon: UserCircle, color: 'text-blue-500' },
        { href: '/projects', label: 'View Schemes', icon: Search, color: 'text-indigo-500' },
    ],
    panchayat_officer: [
        { href: '/panchayat', label: 'Panchayat Portal', icon: Landmark, color: 'text-green-500' },
        { href: '/projects', label: 'Available Grants', icon: FileText, color: 'text-cyan-500' },
    ],
    government_officer: [
        { href: '/government', label: 'Officer Console', icon: Shield, color: 'text-amber-500' },
        { href: '/projects', label: 'Grant Management', icon: FileText, color: 'text-yellow-500' },
    ],
    admin: [
        { href: '/admin', label: 'Admin Control', icon: Settings, color: 'text-purple-500' },
        { href: '/projects', label: 'Scheme Config', icon: FileText, color: 'text-violet-500' },
    ]
}

export default function Sidebar() {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const initUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const { user } = await res.json();
                    setUser(user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            }
        }
        initUser()
    }, [])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login'
    }

    return (
        <aside className="w-64 h-screen sticky top-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col border-r border-[var(--card-border)] transition-colors duration-300">
            {/* Brand Logo */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight leading-none">RIGMS</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Smart Governance</p>
                    </div>
                </Link>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 mb-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-inner">
                            {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {user?.full_name || user?.email?.split('@')[0] || 'Guest'}
                            </p>
                            <p className="text-[11px] text-slate-500 capitalize truncate">
                                {user?.role?.replace('_', ' ') || 'Visitor'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Main Navigation */}
                <div>
                    <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</h3>
                    <nav className="space-y-1">
                        {mainLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-sky-500/10 text-sky-400 font-medium'
                                        : 'hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-white'}`} />
                                    <span className="flex-1">{link.label}</span>
                                    {isActive && (
                                        <motion.div layoutId="active-pill" className="w-1 h-5 bg-sky-500 rounded-full" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Role Specific Navigation */}
                {user?.role && roleLinks[user.role] && (
                    <div>
                        <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Workspace</h3>
                        <nav className="space-y-1">
                            {roleLinks[user.role].map((link) => {
                                const Icon = link.icon
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-white/10 text-white font-medium shadow-lg'
                                            : 'hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-lg bg-black/20 border border-white/5 group-hover:border-white/20 transition-colors ${isActive ? 'bg-white/10 border-white/20' : ''}`}>
                                            <Icon className={`w-4 h-4 ${link.color}`} />
                                        </div>
                                        <span className="flex-1">{link.label}</span>
                                        <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </div>

            {/* Logout / Footer */}
            <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    suppressHydrationWarning
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    )
}
