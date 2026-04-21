'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
    Mail,
    Lock,
    User,
    Phone,
    ArrowRight,
    UserCircle,
    Landmark,
    Eye,
    EyeOff,
    MapPin,
    CheckCircle2,
    Shield,
    ChevronDown,
    Building2
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { getStates, getDistricts, getVillages } from '@/lib/db/actions'
import { useEffect } from 'react'

const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), { ssr: false })

export default function SignupPage() {
    const router = useRouter()

    const [role, setRole] = useState<'citizen' | 'panchayat' | 'government'>('citizen')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        stateId: '',
        districtId: '',
        villageId: ''
    })
    const [states, setStates] = useState<any[]>([])
    const [districts, setDistricts] = useState<any[]>([])
    const [villages, setVillages] = useState<any[]>([])
    const [isStatesLoading, setIsStatesLoading] = useState(true)
    const [isDistrictsLoading, setIsDistrictsLoading] = useState(false)
    const [isVillagesLoading, setIsVillagesLoading] = useState(false)
    const [stateError, setStateError] = useState<string | null>(null)
    const [districtError, setDistrictError] = useState<string | null>(null)
    const [villageError, setVillageError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStates() {
            try {
                setIsStatesLoading(true)
                const data = await getStates()
                console.log('Signup Page: Fetched states:', data)
                if (data.length === 0) {
                    console.warn('Signup Page: No states returned from database.')
                }
                setStates(data)
            } catch (err: any) {
                console.error('Signup Page: Error fetching states:', err)
                setStateError(err.message || "Could not load states.")
            } finally {
                setIsStatesLoading(false)
            }
        }
        fetchStates()
    }, [])

    useEffect(() => {
        if (formData.stateId) {
            async function fetchDistricts() {
                try {
                    setIsDistrictsLoading(true)
                    setDistrictError(null)
                    const data = await getDistricts(formData.stateId)
                    setDistricts(data)
                    setFormData(prev => ({ ...prev, districtId: '', villageId: '' }))
                } catch (err) {
                    console.error('Signup Page: Error fetching districts:', err)
                    setDistrictError("Could not load districts.")
                } finally {
                    setIsDistrictsLoading(false)
                }
            }
            fetchDistricts()
        } else {
            setDistricts([])
            setVillages([])
        }
    }, [formData.stateId])

    useEffect(() => {
        if (formData.districtId) {
            async function fetchVillages() {
                try {
                    setIsVillagesLoading(true)
                    setVillageError(null)
                    const data = await getVillages(formData.districtId)
                    setVillages(data)
                    setFormData(prev => ({ ...prev, villageId: '' }))
                } catch (err) {
                    console.error('Signup Page: Error fetching villages:', err)
                    setVillageError("Could not load villages.")
                } finally {
                    setIsVillagesLoading(false)
                }
            }
            fetchVillages()
        } else {
            setVillages([])
        }
    }, [formData.districtId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (formData.password.length < 6) {
                throw new Error("Password must be at least 6 characters long.")
            }

            let dbRole = role === 'citizen' ? 'citizen' :
                role === 'panchayat' ? 'panchayat_officer' :
                    'government_officer';

            if (formData.email.toLowerCase() === 'admin@gmail.com') {
                dbRole = 'admin';
            }

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: dbRole,
                    phone: formData.phone,
                    stateId: formData.stateId || null,
                    districtId: formData.districtId || null,
                    villageId: formData.villageId || null,
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess("Registration successful! Redirecting to login...")
            setIsLoading(false)

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login?registered=true')
            }, 2000)

        } catch (err: any) {
            console.error('Signup error:', err)
            setError(err.message || "An error occurred during registration.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-grid flex items-center justify-center p-4 py-20">
            <Scene3D />

            <div className="w-full max-w-xl relative z-10">
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

                <GlassCard className="p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
                        <p className="text-gray-400 text-center mb-8">Join the digital governance platform</p>

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

                        {/* Role Selection */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <button
                                suppressHydrationWarning
                                type="button"
                                onClick={() => setRole('citizen')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${role === 'citizen'
                                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                <UserCircle className={`w-6 h-6 ${role === 'citizen' ? 'text-blue-400' : ''}`} />
                                <span className="text-xs font-medium">Citizen</span>
                            </button>
                            <button
                                suppressHydrationWarning
                                type="button"
                                onClick={() => setRole('panchayat')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${role === 'panchayat'
                                    ? 'bg-green-500/10 border-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                <Landmark className={`w-6 h-6 ${role === 'panchayat' ? 'text-green-400' : ''}`} />
                                <span className="text-xs font-medium">Panchayat</span>
                            </button>
                            <button
                                suppressHydrationWarning
                                type="button"
                                onClick={() => setRole('government')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${role === 'government'
                                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                    }`}
                            >
                                <Shield className={`w-6 h-6 ${role === 'government' ? 'text-amber-400' : ''}`} />
                                <span className="text-xs font-medium">Govt Officer</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="input-field pl-12"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="input-field pl-12"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    State {isStatesLoading && <span className="text-xs text-blue-400 font-normal ml-2">(Loading...)</span>}
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        required
                                        className={`input-field pl-12 appearance-none ${stateError ? 'border-red-500/50' : ''}`}
                                        value={formData.stateId}
                                        onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                                        disabled={isStatesLoading}
                                        suppressHydrationWarning
                                    >
                                        <option value="" disabled>
                                            {isStatesLoading ? 'Loading states...' : states.length === 0 ? 'No states found' : 'Select State'}
                                        </option>
                                        {states.map(state => (
                                            <option key={state.id} value={state.id}>{state.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {states.length === 0 && !isStatesLoading && (
                                    <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-xs text-amber-400">
                                            {stateError || 'No states available in the database. Please ensure you have run the seed.sql script in Supabase.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        className="input-field pl-12"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        District {isDistrictsLoading && <span className="text-xs text-blue-400 font-normal ml-2">(Loading...)</span>}
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            disabled={!formData.stateId || isDistrictsLoading}
                                            required
                                            className={`input-field pl-12 appearance-none ${districtError ? 'border-red-500/50' : ''}`}
                                            value={formData.districtId}
                                            onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                                            suppressHydrationWarning
                                        >
                                            <option value="" disabled>
                                                {!formData.stateId ? 'Select State first' : isDistrictsLoading ? 'Loading districts...' : districts.length === 0 ? 'No districts found' : 'Select District'}
                                            </option>
                                            {districts.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {formData.stateId && districts.length === 0 && !isDistrictsLoading && (
                                        <p className="text-[10px] text-amber-400 mt-1">No districts found for this state.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Village {isVillagesLoading && <span className="text-xs text-blue-400 font-normal ml-2">(Loading...)</span>}
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            disabled={!formData.districtId || isVillagesLoading}
                                            required={role !== 'government'}
                                            className={`input-field pl-12 appearance-none ${villageError ? 'border-red-500/50' : ''}`}
                                            value={formData.villageId}
                                            onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                                            suppressHydrationWarning
                                        >
                                            <option value="" disabled>
                                                {!formData.districtId ? 'Select District first' : isVillagesLoading ? 'Loading villages...' : villages.length === 0 ? 'No villages found' : 'Select Village'}
                                            </option>
                                            {villages.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    {formData.districtId && villages.length === 0 && !isVillagesLoading && (
                                        <p className="text-[10px] text-amber-400 mt-1">No villages found for this district.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="input-field pl-12 pr-12"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        suppressHydrationWarning
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-2">
                                <input type="checkbox" required className="mt-1 rounded bg-white/5 border-white/10" />
                                <span className="text-sm text-gray-400">
                                    I agree to the <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
                                </span>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isLoading}
                                className="w-full"
                            >
                                Register Now
                                <ArrowRight className="w-5 h-5" />
                            </Button>

                            <div className="text-center pt-2">
                                <span className="text-gray-400">Already have an account? </span>
                                <Link href="/login" className="text-white hover:text-blue-400 font-bold transition-colors">
                                    Sign In
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
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        ← Back to Home
                    </Link>
                </motion.div>
            </div>
        </main>
    )
}
