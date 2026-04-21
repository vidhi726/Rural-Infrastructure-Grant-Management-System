'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Menu,
    X,
    Home,
    Users,
    FileText,
    Settings,
    LogIn,
    LogOut,
    ChevronDown,
    Building2,
    UserCircle,
    Shield,
    Landmark
} from 'lucide-react'
import { getUserProfile } from '@/lib/db/actions'
import Button from '@/components/ui/Button'

const navLinks = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/projects', label: 'Projects', icon: FileText },
    { href: '/about', label: 'About', icon: Users },
]

const roleLinks = [
    { href: '/citizen', label: 'Citizen Portal', icon: UserCircle, color: 'text-blue-600' },
    { href: '/panchayat', label: 'Panchayat Officer', icon: Landmark, color: 'text-emerald-600' },
    { href: '/government', label: 'Government Officer', icon: Shield, color: 'text-sky-600' },
    { href: '/admin', label: 'Admin Panel', icon: Settings, color: 'text-purple-600' },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()
    const router = useRouter()


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)

        async function getSession() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const { user } = await res.json();
                    if (user) {
                        const profile = await getUserProfile(user.id);
                        setUser({ ...user, profile });
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            }
        }
        getSession()

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleLogout = async () => {
        setIsUserMenuOpen(false)
        setIsMobileMenuOpen(false)
        try {
            setUser(null)
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
        } catch (err: any) {
            window.location.href = '/login'
        }
    }

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${isScrolled ? 'bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'}
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            RIGMS<span className="text-sky-500 ml-1">Portal</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                        ${isActive
                                            ? 'text-sky-600 bg-sky-50'
                                            : isScrolled ? 'text-slate-600 hover:text-sky-600 hover:bg-slate-50' : 'text-slate-700 hover:text-sky-600 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                            ${isScrolled ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-700 hover:bg-white/10'}
                                        `}
                                    >
                                        Portals
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isRoleMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 p-1.5 bg-white rounded-2xl shadow-2xl border border-slate-100"
                                            >
                                                {roleLinks.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        onClick={() => setIsRoleMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-all group"
                                                    >
                                                        <div className={`p-2 rounded-lg bg-slate-50 scale-90 group-hover:scale-100 transition-transform ${link.color}`}>
                                                            <link.icon className="w-4 h-4" />
                                                        </div>
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-sky-500/20">
                                            {user.profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left hidden xl:block">
                                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.profile?.full_name || 'User'}</p>
                                            <p className="text-[10px] text-slate-500 font-medium capitalize">{user.profile?.role?.replace('_', ' ')}</p>
                                        </div>
                                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-48 p-1.5 bg-white rounded-2xl shadow-2xl border border-slate-100"
                                            >
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" icon={<LogIn className="w-4 h-4" />}>
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`
                            lg:hidden p-2 rounded-xl transition-all
                            ${isScrolled ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-700 hover:bg-white/10'}
                        `}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-all"
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 pb-2 border-t border-slate-50">
                                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Portals</p>
                                {roleLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-all"
                                    >
                                        <link.icon className={`w-5 h-5 ${link.color}`} />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="pt-4">
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-sky-600 hover:bg-sky-50 transition-all"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
