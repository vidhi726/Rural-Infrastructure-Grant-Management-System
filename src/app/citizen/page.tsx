'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Home,
    FileText,
    MessageSquare,
    Camera,
    Bell,
    User,
    MapPin,
    IndianRupee,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Send,
    Upload,
    ChevronRight,
    Building2,
    Shield
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useEffect } from 'react'
import { getCitizenApplications, getCitizenComplaints, getUserProfile, submitComplaint, getOngoingGrantsForState, getMilestones } from '@/lib/db/actions'
import { toast } from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'
import GlassCard from '@/components/ui/GlassCard'
import StatCounter from '@/components/ui/StatCounter'
import ProgressRing from '@/components/ui/ProgressRing'
import DynamicMilestones from '@/components/ui/DynamicMilestones'
import { convertGrantsToXML } from '@/lib/utils/xml-utils'
import { useRouter } from 'next/navigation'
import { FileDown } from 'lucide-react'

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

export default function CitizenDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [newComplaint, setNewComplaint] = useState({ title: '', description: '' })
    const [myVillageGrants, setMyVillageGrants] = useState<any[]>([])
    const [myComplaints, setMyComplaints] = useState<any[]>([])
    const [myMilestones, setMyMilestones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [profile, setProfile] = useState<any>(null)
    const router = useRouter()

    const milestones = [
        { id: '1', title: 'Foundation & Survey', percentage: 25, isCompleted: true, isVerified: true, date: 'Sep 2024' },
        { id: '2', title: 'Pipeline Installation', percentage: 50, isCompleted: true, isVerified: true, date: 'Nov 2024' },
        { id: '3', title: 'Connection to Households', percentage: 75, isCompleted: false, isVerified: false, date: 'In Progress' },
        { id: '4', title: 'Testing & Commissioning', percentage: 100, isCompleted: false, isVerified: false, date: 'Expected Mar 2025' },
    ]

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/auth/me')
                const { user } = await response.json()
                if (!user) {
                    router.push('/login')
                    return
                }

                const profileData = await getUserProfile(user._id || user.id)
                if (!profileData) return
                const stateId = typeof profileData.state_id === 'object' ? profileData.state_id._id : (profileData.state_id || '');
                const userId = user._id || user.id;
                const villageId = profileData.village?.id || profileData.village_id;
                
                console.log('[DEBUG] Citizen Profile:', { villageId, stateId, userId });

                const [apps, complaints] = await Promise.all([
                    getCitizenApplications(stateId, String(villageId)),
                    getCitizenComplaints(stateId, userId)
                ])

                setProfile(profileData)
                // Filter by village directly just in case the server logic is broad
                const villageApps = apps.filter((a: any) => 
                    profileData.village && (a.village_id === String(villageId) || a.villages?.name === profileData.village.name)
                )
                
                setMyVillageGrants(villageApps.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    appNumber: a.application_number || 'N/A',
                    description: a.description || 'No description available',
                    category: (a.grant_schemes as any)?.category || 'roads',
                    schemeName: (a.grant_schemes as any)?.name || 'General Scheme',
                    status: a.status,
                    progress: a.completion_percentage || 0,
                    amount: a.approved_amount || 0,
                    totalReleasedAmount: a.totalReleasedAmount || 0,
                    village: a.villages?.name,
                    district: a.villages?.districts?.name,
                    date: a.createdAt || new Date()
                })))
                setMyComplaints(complaints.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    status: c.status,
                    date: c.created_at,
                    response: c.government_response,
                    respondedAt: c.responded_at
                })))

                if (apps.length > 0) {
                    const milestonesData = await getMilestones(apps[0].id)
                    setMyMilestones(milestonesData)
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'complaints', label: 'Complaints', icon: MessageSquare },
        { id: 'upload', label: 'Photo Upload', icon: Camera }
    ]

    const handleSubmitComplaint = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComplaint.title || !newComplaint.description) {
            toast.error('Please fill in all fields')
            return
        }

        const submitting = toast.loading('Submitting complaint...')
        try {
            const complaintNumber = `CMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

            await submitComplaint({
                complaint_number: complaintNumber,
                title: newComplaint.title,
                description: newComplaint.description,
                village_id: profile?.village?.id || profile?.village_id,
                submitted_by: profile?.id,
                status: 'open',
                priority: 3
            })

            toast.success('Complaint submitted successfully', { id: submitting })
            setNewComplaint({ title: '', description: '' })

            // Refresh complaints list
            const updatedComplaints = await getCitizenComplaints(
                typeof profile?.state_id === 'object' ? profile.state_id._id : profile?.state_id, 
                profile?.id
            )
            setMyComplaints(updatedComplaints.map((c: any) => ({
                id: c.id,
                title: c.title,
                description: c.description,
                status: c.status,
                date: c.created_at,
                response: c.government_response,
                respondedAt: c.responded_at
            })))
        } catch (err) {
            console.error('Submission error:', err)
            toast.error('Failed to submit complaint', { id: submitting })
        }
    }

    const handleDownloadXML = async () => {
        if (!profile?.state_id) {
            toast.error('State information not found')
            return
        }

        const loadingId = toast.loading('Filtering ongoing grants...')
        try {
            // Fetch grants manually from server action
            const data = await getOngoingGrantsForState(profile.state_id)

            if (!data || data.length === 0) {
                toast.error('No ongoing grants found for your state', { id: loadingId })
                return
            }

            const xmlData = convertGrantsToXML(data)
            localStorage.setItem('ongoing_grants_xml', xmlData)
            toast.success('Grants fetched successfully!', { id: loadingId })
            router.push('/citizen/ongoing-grants')
        } catch (err) {
            console.error('Error downloading XML:', err)
            // Ensure toast is dismissed or replaced even on error
            toast.dismiss(loadingId)
        }
    }

    return (
        <AppLayout>
            <div className="pb-12">
                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <GlassCard className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div className={loading && !profile ? 'animate-pulse' : ''}>
                                    <h1 className="text-2xl font-bold text-[var(--text-main)]">
                                        Welcome, {profile?.full_name || 'Guest'}
                                    </h1>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {profile?.villages?.name || 'Loading...'}, {profile?.villages?.districts?.name || 'Location'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}

                    {/* Action Button: Download All Ongoing Grants */}
                    <button
                        onClick={handleDownloadXML}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                    >
                        <FileDown className="w-4 h-4" />
                        Download All Ongoing Grants
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <GlassCard className="p-6" glowColor="blue">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-[var(--text-main)]">
                                            {myVillageGrants.filter(g => ['approved', 'in_progress'].includes(g.status)).length}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">Active Projects</div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6" glowColor="green">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <IndianRupee className="w-7 h-7 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-[var(--text-main)]">
                                            ₹{(myVillageGrants.reduce((a, b) => a + (b.totalReleasedAmount || 0), 0) / 100000).toFixed(1)}L
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">Total Funds</div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6" glowColor="amber">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-7 h-7 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-[var(--text-main)]">
                                            {myVillageGrants.filter(g => g.status === 'completed' || g.progress === 100).length}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">Completed</div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Active Project Progress List */}
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-6">Active Project Progress</h3>
                            <div className="space-y-4">
                                {myVillageGrants.filter(g => ['approved', 'in_progress'].includes(g.status)).length > 0 ? (
                                    myVillageGrants
                                        .filter(g => ['approved', 'in_progress'].includes(g.status))
                                        .map((grant) => {
                                            const progress = grant.amount > 0 ? (grant.totalReleasedAmount / grant.amount) * 100 : 0;
                                            return (
                                                <div key={grant.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">
                                                    <div
                                                        className="w-3 h-3 rounded-full shrink-0"
                                                        style={{ backgroundColor: categoryColors[grant.category] || '#3b82f6' }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium truncate text-[var(--text-main)]">{grant.title}</h4>
                                                        <p className="text-sm text-[var(--text-muted)] capitalize">Category: {grant.category}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-sm font-bold text-[var(--text-main)]">{progress.toFixed(0)}%</div>
                                                            <div className="text-[10px] text-[var(--text-muted)] uppercase">Progress</div>
                                                        </div>
                                                        <ProgressRing 
                                                            progress={progress} 
                                                            size={50} 
                                                            strokeWidth={4} 
                                                            color={categoryColors[grant.category] || '#3b82f6'} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="py-8 text-center text-[var(--text-muted)] bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-[var(--card-border)]">
                                        No active projects in your village.
                                    </div>
                                )}
                            </div>
                            
                            {myMilestones.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-[var(--card-border)]">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        Latest Project Milestones
                                    </h4>
                                    <DynamicMilestones milestones={myMilestones} />
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}



                {activeTab === 'complaints' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* New Complaint Form */}
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-6">Submit New Complaint</h3>
                            <form className="space-y-4" onSubmit={handleSubmitComplaint}>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newComplaint.title}
                                        onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                                        placeholder="Brief title for your complaint"
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Description</label>
                                    <textarea
                                        value={newComplaint.description}
                                        onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                                        placeholder="Detailed description of the issue..."
                                        rows={4}
                                        className="input-field resize-none"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    icon={<Send className="w-4 h-4" />}
                                >
                                    Submit Complaint
                                </Button>
                            </form>
                        </GlassCard>

                        {/* Complaint History */}
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-6">My Complaints</h3>
                            <div className="space-y-4">
                                {myComplaints.map((complaint) => {
                                    const statusInfo = statusColors[complaint.status]
                                    const StatusIcon = statusInfo.icon

                                    return (
                                        <div key={complaint.id} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{complaint.title}</h4>
                                                <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)] mb-3">
                                                Submitted on {new Date(complaint.date).toLocaleDateString('en-IN')}
                                            </p>
                                            
                                            {complaint.response && (
                                                <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                                            <Shield className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Government Response</span>
                                                    </div>
                                                    <p className="text-sm text-[var(--text-main)] opacity-90 leading-relaxed italic">
                                                        "{complaint.response}"
                                                    </p>
                                                    <div className="text-[10px] text-[var(--text-muted)] mt-2 text-right uppercase">
                                                        Replied on {new Date(complaint.respondedAt).toLocaleDateString('en-IN')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'upload' && (
                    <GlassCard className="p-8 max-w-2xl">
                        <h3 className="text-xl font-bold mb-6">Upload Progress Photos</h3>
                        <p className="text-[var(--text-muted)] mb-8">
                            Help monitor project progress by uploading geo-tagged photos from your area.
                        </p>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-[var(--card-border)] rounded-2xl p-12 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="text-lg font-medium mb-2">Drag & Drop your photos here</h4>
                            <p className="text-[var(--text-muted)] text-sm mb-4">or click to browse</p>
                            <Button variant="secondary" size="sm">
                                Select Files
                            </Button>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-400">
                                <strong>Note:</strong> Photos should include location data (GPS) for verification purposes.
                            </p>
                        </div>
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    )
}
