import { useState } from 'react'
import { X, MapPin, Mail, Phone, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
    const [isEditingPassword, setIsEditingPassword] = useState(false)
    const [passwords, setPasswords] = useState({ new: '', confirm: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Password update requested')

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: "Passwords don't match" })
            return
        }
        if (passwords.new.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwords.new })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update password');
            }

            setMessage({ type: 'success', text: "Password updated successfully" })
            setPasswords({ new: '', confirm: '' })
            setIsEditingPassword(false)
        } catch (err: any) {
            // Handle specific Supabase error messages
            const errorMessage = err.message === "New password should be different from the old password."
                ? "Please choose a new password that is different from your current one."
                : (err.message || "Failed to update password");

            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">My Profile</h2>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-2xl shadow-inner">
                                {user?.profile?.full_name?.charAt(0) || <User className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-main)]">{user?.full_name || 'User'}</h3>
                                <p className="text-sm font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                                    <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Email</p>
                                        <p className="text-sm font-medium text-[var(--text-main)]">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                                    <Phone className="w-5 h-5 text-[var(--text-muted)]" />
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Phone</p>
                                        <p className="text-sm font-medium text-[var(--text-main)]">{user?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                                    <MapPin className="w-5 h-5 text-[var(--text-muted)] mt-1" />
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Location</p>
                                        <p className="text-sm font-medium text-[var(--text-main)]">
                                            {[
                                                user?.profile?.village?.name || user?.village?.name || user?.villages?.name,
                                                user?.profile?.district?.name || user?.district?.name || user?.districts?.name,
                                                user?.profile?.state?.name || user?.state?.name || user?.states?.name
                                            ].filter(Boolean).join(', ') || 'Location not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-4 border-t border-[var(--card-border)]">
                            {!isEditingPassword ? (
                                <div className="space-y-3">
                                    {message && message.type === 'success' && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            {message.text}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsEditingPassword(true)
                                            setMessage(null)
                                        }}
                                        className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Change Password
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="New Password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="w-full pl-4 pr-10 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:bg-[var(--card-bg)] focus:border-sky-500/50 outline-none transition-all text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:bg-[var(--card-bg)] focus:border-sky-500/50 outline-none transition-all text-sm"
                                        />
                                    </div>

                                    {message && (
                                        <div className={`text-xs p-2 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditingPassword(false); setMessage(null); }}
                                            className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-3 py-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
                                        >
                                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
