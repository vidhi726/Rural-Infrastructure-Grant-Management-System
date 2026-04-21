'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, ArrowLeft, FileCode, IndianRupee, MapPin, CheckCircle2, Clock, AlertCircle, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { getCitizenApplications, getUserProfile } from '@/lib/db/actions'
import ProgressRing from '@/components/ui/ProgressRing'

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    approved: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
    open: { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle },
    resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 }
}

const categoryColors: Record<string, string> = {
    roads: '#f59e0b',
    water: '#06b6d4',
    education: '#8b5cf6',
    power: '#eab308',
    agriculture: '#22c55e',
    healthcare: '#ec4899',
}

export default function MyGrantsPage() {
    const [grants, setGrants] = useState<any[]>([])
    const [xmlData, setXmlData] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchGrants() {
            try {
                const res = await fetch('/api/auth/me')
                const { user } = await res.json()

                if (!user) {
                    toast.error('You must be logged in to access this page.')
                    router.push('/login')
                    return
                }

                const profileData = await getUserProfile(user._id || user.id)
                if (!profileData) return

                const stateId = profileData.state_id
                const apps = await getCitizenApplications(stateId)
                
                const villageGrants = apps.filter((a: any) => 
                    profileData.village && a.villages?.name === profileData.village.name
                )

                setGrants(villageGrants)

                // Check if there is XML data in local storage
                const data = localStorage.getItem('ongoing_grants_xml')
                if (data) {
                    setXmlData(data)
                }

            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchGrants()
    }, [router])

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </AppLayout>
        )
    }

    const handleDownloadFile = () => {
        if (!xmlData) {
            toast.error('No XML data generated. Download from the dashboard first.')
            return
        }

        const blob = new Blob([xmlData], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ongoing_grants_${new Date().toISOString().slice(0, 10)}.xml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('XML file downloaded successfully')
    }

    return (
        <AppLayout>
            <div className="pb-12 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/citizen"
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-main)]">My Village Grants</h1>
                        <p className="text-[var(--text-muted)] text-sm">All grants applied for by your village</p>
                    </div>
                </div>

                <div className="grid gap-6 mb-8">
                    {/* Action Card */}
                    {xmlData && (
                        <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <FileCode className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Ongoing Grants XML Data Available</h3>
                                        <p className="text-sm text-[var(--text-muted)]">Download the XML data generated from your dashboard</p>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    icon={<Download className="w-4 h-4" />}
                                    onClick={handleDownloadFile}
                                >
                                    Download XML
                                </Button>
                            </div>
                        </GlassCard>
                    )}

                    {/* Grants List */}
                    <div className="space-y-4">
                        {grants.length === 0 ? (
                            <GlassCard className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No Grants Found</h3>
                                <p className="text-[var(--text-muted)] max-w-md">
                                    Your village has not applied for any grants yet. Check available schemes in the View Schemes section.
                                </p>
                            </GlassCard>
                        ) : (
                            grants.map((grant, index) => {
                                const statusInfo = statusColors[grant.status] || statusColors['open']
                                const StatusIcon = statusInfo.icon
                                const category = grant.grant_schemes?.category || 'roads'
                                const amount = grant.approved_amount || 0
                                const schemeName = grant.grant_schemes?.name || 'General Scheme'
                                const appNumber = grant.application_number || 'N/A'
                                const description = grant.description || 'No description available'
                                const dateStr = grant.createdAt ? new Date(grant.createdAt).toLocaleDateString('en-IN') : 'N/A'

                                return (
                                    <motion.div
                                        key={grant.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <GlassCard className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <div
                                                    className="w-2 h-full md:w-1 md:h-20 rounded-full hidden md:block"
                                                    style={{ backgroundColor: categoryColors[category] || '#3b82f6' }}
                                                />

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span
                                                            className="px-2 py-1 text-xs font-medium rounded-full capitalize"
                                                            style={{
                                                                backgroundColor: `${categoryColors[category] || '#3b82f6'}20`,
                                                                color: categoryColors[category] || '#3b82f6'
                                                            }}
                                                        >
                                                            {category}
                                                        </span>
                                                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {grant.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-[var(--text-main)] mb-1">{grant.title}</h3>
                                                    <div className="text-sm font-medium text-blue-500 mb-2">Scheme: {schemeName} | App No: {appNumber}</div>
                                                    <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{description}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {dateStr}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-4 h-4" />
                                                            ₹{(amount / 100000).toFixed(1)}L
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                                            {grant.villages?.name}, {grant.villages?.districts?.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <ProgressRing
                                                        progress={grant.completion_percentage || 0}
                                                        size={80}
                                                        strokeWidth={6}
                                                        color={statusInfo.text.includes('green') ? '#22c55e' : statusInfo.text.includes('blue') ? '#3b82f6' : '#f59e0b'}
                                                    />
                                                    <Link
                                                        href={`/projects/${grant.id}`}
                                                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

