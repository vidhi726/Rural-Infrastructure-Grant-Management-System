'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    UserCircle,
    Shield,
    Landmark,
    CheckCircle2,
    Settings,
    Building2,
    Phone,
    Hash
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false })



export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-grid" />}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const registered = searchParams.get('registered')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otpToken, setOtpToken] = useState('')
    const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password')
    const [otpSent, setOtpSent] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(registered ? "Account created successfully! Please log in." : null)



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const role = data.user.role || 'citizen';
            let dashboardRoute = '/citizen';
            if (role === 'panchayat_officer') dashboardRoute = '/panchayat';
            else if (role === 'government_officer') dashboardRoute = '/government';
            else if (role === 'admin') dashboardRoute = '/admin';

            router.push(dashboardRoute);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("OTP login is currently not available.");
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            setError("OTP login is currently not available.");
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-grid flex items-center justify-center p-4">
            <Scene3D />

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                                RIGMS<span className="text-sky-500 ml-1">Portal</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Rural Infrastructure Grant Management</p>
                        </div>
                    </Link>
                </motion.div>

                {/* Login Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 items-center">
                    <button
                        onClick={() => {
                            setLoginMode('password')
                            setError(null)
                            setOtpSent(false)
                        }}
                        suppressHydrationWarning
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMode === 'password'
                            ? 'bg-white text-sky-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Email & Password
                    </button>
                    <button
                        onClick={() => {
                            setLoginMode('otp')
                            setError(null)
                        }}
                        suppressHydrationWarning
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMode === 'otp'
                            ? 'bg-white text-sky-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Email OTP
                    </button>
                </div>

                <GlassCard className="p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Welcome Back</h2>
                        <p className="text-slate-500 font-medium text-center mb-8">Sign in to access your dashboard</p>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                {success}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={loginMode === 'password' ? handleSubmit : (otpSent ? handleVerifyOTP : handleSendOTP)} className="space-y-6">
                            {/* Email Field - Always Show */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="input-field pl-12"
                                        required
                                        disabled={otpSent}
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            {loginMode === 'password' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="input-field pl-12 pr-12"
                                                required
                                                suppressHydrationWarning
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-200" />
                                            <span className="text-slate-500 font-medium">Remember me</span>
                                        </label>
                                        <a href="#" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {otpSent && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Verification Code
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={otpToken}
                                                    onChange={(e) => setOtpToken(e.target.value)}
                                                    placeholder="Enter 6-digit code"
                                                    className="input-field pl-12"
                                                    maxLength={6}
                                                    required
                                                    suppressHydrationWarning
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setOtpSent(false)}
                                                className="mt-2 text-xs text-sky-600 font-bold hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isLoading}
                                className="w-full"
                            >
                                {loginMode === 'password'
                                    ? 'Sign In'
                                    : (otpSent ? 'Verify OTP' : 'Send OTP')}
                                <ArrowRight className="w-5 h-5" />
                            </Button>

                            <div className="text-center pt-2">
                                <span className="text-slate-500 font-medium">Don't have an account? </span>
                                <Link href="/signup" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        </form>


                    </motion.div>
                </GlassCard>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-6"
                >
                    <Link
                        href="/"
                        className="text-slate-500 hover:text-sky-600 transition-colors text-sm font-bold"
                    >
                        ← Back to Home
                    </Link>
                </motion.div>
            </div>
        </main>
    )
}
