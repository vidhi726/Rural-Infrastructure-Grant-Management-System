'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Home,
    Users,
    FileText,
    Settings,
    BarChart3,
    History,
    Shield,
    Plus,
    Pencil,
    Trash2,
    Search,
    Filter,
    Download,
    ChevronRight,
    UserCircle,
    Landmark,
    MapPin,
    IndianRupee,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertTriangle,
    X,
    Loader2
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import CategoryChart from '@/components/dashboard/CategoryChart'
import { getGrantSchemes, createGrantScheme, getUserProfile, getAdminStats, getAuditLogs, getCategoryStats, getAdminApprovedApplications, releaseFundInstallment } from '@/lib/db/actions'
// Removed Supabase import
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

// Hardcoded data removed, using dynamic fetching

const userStats = {
    total: 156,
    citizen: 120,
    panchayat_officer: 24,
    government_officer: 10,
    admin: 2
}

const systemStats = {
    totalGrants: 127,
    totalFunds: 45600000,
    activeSchemes: 6,
    villages: 48
}

const recentUsers = [
    { id: '1', name: 'Ramesh Kumar', email: 'ramesh@example.com', role: 'citizen', village: 'Wagholi', status: 'active' },
    { id: '2', name: 'Sanjay Patil', email: 'sanjay@gov.in', role: 'panchayat_officer', village: 'Sinnar', status: 'active' },
    { id: '3', name: 'Anil Sharma', email: 'anil@gov.in', role: 'government_officer', village: null, status: 'active' },
    { id: '4', name: 'Priya Deshmukh', email: 'priya@example.com', role: 'citizen', village: 'Wai', status: 'pending' }
]

const auditLogs = [
    { id: '1', action: 'APPLICATION_APPROVED', user: 'Anil Sharma', entity: 'RIGMS-2025-000007', timestamp: '2025-01-25 14:30:00' },
    { id: '2', action: 'FUND_RELEASED', user: 'Anil Sharma', entity: 'RIGMS-2024-000002', timestamp: '2025-01-25 10:15:00' },
    { id: '3', action: 'APPLICATION_SUBMITTED', user: 'Sanjay Patil', entity: 'RIGMS-2025-000008', timestamp: '2025-01-24 16:45:00' },
    { id: '4', action: 'MILESTONE_VERIFIED', user: 'Anil Sharma', entity: 'RIGMS-2024-000006', timestamp: '2025-01-24 11:20:00' },
    { id: '5', action: 'USER_REGISTERED', user: 'System', entity: 'priya@example.com', timestamp: '2025-01-23 09:30:00' }
]

const categoryData = [
    { category: 'roads', count: 28, amount: 12500000, completed: 12 },
    { category: 'water', count: 24, amount: 9800000, completed: 10 },
    { category: 'education', count: 22, amount: 7500000, completed: 8 },
    { category: 'healthcare', count: 18, amount: 6200000, completed: 6 },
    { category: 'power', count: 20, amount: 5800000, completed: 4 },
    { category: 'agriculture', count: 15, amount: 3800000, completed: 2 },
]

const roleColors: Record<string, { bg: string; text: string; icon: any }> = {
    citizen: { bg: 'bg-blue-100', text: 'text-blue-700', icon: UserCircle },
    panchayat_officer: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Landmark },
    government_officer: { bg: 'bg-sky-100', text: 'text-sky-700', icon: Shield },
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Settings }
}

const actionColors: Record<string, string> = {
    APPLICATION_APPROVED: 'text-emerald-600',
    FUND_RELEASED: 'text-blue-600',
    APPLICATION_SUBMITTED: 'text-amber-600',
    MILESTONE_VERIFIED: 'text-cyan-600',
    USER_REGISTERED: 'text-purple-600',
    APPLICATION_REJECTED: 'text-red-600'
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddSchemeModalOpen, setIsAddSchemeModalOpen] = useState(false)
    const [schemes, setSchemes] = useState<any[]>([])
    const [loadingSchemes, setLoadingSchemes] = useState(false)
    const [submittingScheme, setSubmittingScheme] = useState(false)
    const [newScheme, setNewScheme] = useState({
        name: '',
        description: '',
        category: 'roads',
        max_amount: '',
        required_documents: [] as string[]
    })
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [catStats, setCatStats] = useState<any[]>([])

    // Disbursements State
    const [approvedApps, setApprovedApps] = useState<any[]>([])
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<any>(null)
    const [releaseAmount, setReleaseAmount] = useState('')
    const [releaseRemarks, setReleaseRemarks] = useState('')
    const [releasingFund, setReleasingFund] = useState(false)

    const AVAILABLE_DOCUMENTS = [
        "Project Proposal",
        "Land NOC / Documents",
        "Environmental Clearance",
        "Technical Survey Report",
        "Technical Plan",
        "Water Quality Report",
        "Population Certificate",
        "School Registration",
        "Infrastructure Assessment",
        "Equipment List",
        "Building Plan",
        "Budget Estimate",
        "Geotagged Photos",
        "Utility Board NOC"
    ]

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/auth/me')
                const { user } = await res.json()
                if (user) {
                    const profileData = await getUserProfile(user.id)
                    setProfile(profileData)
                }

                const [adminStats, auditLogsData, categoryStatsData, approvedAppsData] = await Promise.all([
                    getAdminStats(),
                    getAuditLogs(),
                    getCategoryStats(),
                    getAdminApprovedApplications()
                ])
                setStats(adminStats)
                setLogs(auditLogsData)
                setCatStats(categoryStatsData)
                setApprovedApps(approvedAppsData)
            } catch (err) {
                console.error('Error fetching admin data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        if (activeTab === 'schemes') {
            fetchSchemes()
        }
    }, [activeTab])

    const fetchSchemes = async () => {
        setLoadingSchemes(true)
        const data = await getGrantSchemes(false)
        setSchemes(data)
        setLoadingSchemes(false)
    }

    const fetchApprovedApps = async () => {
        const data = await getAdminApprovedApplications()
        setApprovedApps(data)
    }

    const handleReleaseFund = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedApp || !releaseAmount) return

        const amount = parseFloat(releaseAmount)
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount')
            return
        }

        const remaining = selectedApp.approvedAmount - selectedApp.totalReleasedAmount
        if (amount > remaining) {
            alert(`Amount cannot exceed remaining balance (₹${remaining.toLocaleString('en-IN')})`)
            return
        }

        setReleasingFund(true)
        try {
            await releaseFundInstallment(selectedApp.id, amount, releaseRemarks, profile?.id)
            alert('Fund installment released successfully!')
            setIsReleaseModalOpen(false)
            setReleaseAmount('')
            setReleaseRemarks('')
            fetchApprovedApps()
        } catch (err: any) {
            console.error('Failed to release fund:', err)
            alert(err.message || 'Failed to release fund amounts')
        } finally {
            setReleasingFund(false)
        }
    }

    const toggleDocument = (doc: string) => {
        setNewScheme(prev => {
            const current = [...prev.required_documents]
            const index = current.indexOf(doc)
            if (index > -1) {
                current.splice(index, 1)
            } else {
                current.push(doc)
            }
            return { ...prev, required_documents: current }
        })
    }

    const toggleAllDocuments = () => {
        setNewScheme(prev => {
            if (prev.required_documents.length === AVAILABLE_DOCUMENTS.length) {
                return { ...prev, required_documents: [] }
            } else {
                return { ...prev, required_documents: [...AVAILABLE_DOCUMENTS] }
            }
        })
    }

    const handleAddScheme = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('handleAddScheme: Starting submission', newScheme)
        setSubmittingScheme(true)

        if (!newScheme.name || !newScheme.category || !newScheme.max_amount) {
            console.error('Validation failed: Missing required fields')
            alert('Please fill in all required fields.')
            setSubmittingScheme(false)
            return
        }

        const amount = parseFloat(newScheme.max_amount)
        if (isNaN(amount) || amount <= 0) {
            console.error('Validation failed: Invalid amount', newScheme.max_amount)
            alert('Please enter a valid Maximum Grant Amount.')
            setSubmittingScheme(false)
            return
        }

        try {
            console.log('Calling createGrantScheme with:', { ...newScheme, max_amount: amount })
            const result = await createGrantScheme({
                ...newScheme,
                max_amount: amount,
                required_documents: newScheme.required_documents
            })
            console.log('Scheme created successfully:', result)

            setIsAddSchemeModalOpen(false)
            setNewScheme({
                name: '',
                description: '',
                category: 'roads',
                max_amount: '',
                required_documents: []
            })
            fetchSchemes()
            alert('Scheme created successfully!')
        } catch (error) {
            console.error('Failed to create scheme:', error)
            alert(`Failed to create scheme: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setSubmittingScheme(false)
        }
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'schemes', label: 'Grant Schemes', icon: FileText },
        { id: 'disbursements', label: 'Fund Disbursements', icon: IndianRupee },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'audit', label: 'Audit Logs', icon: History }
    ]

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
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <Settings className="w-8 h-8 text-white" />
                                </div>
                                <div className={loading && !profile ? 'animate-pulse' : ''}>
                                    <h1 className="text-2xl font-bold text-[var(--text-main)]">
                                        {profile?.full_name || 'Administrator'}
                                    </h1>
                                    <p className="text-[var(--text-muted)]">
                                        {profile?.role?.replace('_', ' ') || 'System Admin'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                                    Export Data
                                </Button>
                                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                                    Add User
                                </Button>
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
                                suppressHydrationWarning
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-black/10 dark:bg-white/10 text-[var(--text-main)] border border-[var(--card-border)] shadow-xl'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <GlassCard className="p-6" glowColor="blue">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{stats?.userStats?.total || 0}</div>
                                        <div className="text-sm text-[var(--text-muted)]">Total Users</div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6" glowColor="green">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{stats?.systemStats?.totalGrants || 0}</div>
                                        <div className="text-sm text-[var(--text-muted)]">Total Grants</div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6" glowColor="amber">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <IndianRupee className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">₹{((stats?.systemStats?.totalFunds || 0) / 10000000).toFixed(1)}Cr</div>
                                        <div className="text-sm text-[var(--text-muted)]">Total Funds</div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{stats?.systemStats?.villages || 0}</div>
                                        <div className="text-sm text-[var(--text-muted)]">Villages</div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* User Distribution & Category Stats */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold mb-6">User Distribution</h3>
                                <div className="space-y-4">
                                    {(Object.entries(roleColors) as [string, any][]).map(([role, config]) => {
                                        const RoleIcon = config.icon
                                        const count = stats?.userStats?.[role] || 0
                                        const total = stats?.userStats?.total || 1
                                        const percentage = (count / total) * 100

                                        return (
                                            <div key={role} className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${config.bg}`}>
                                                    <RoleIcon className={`w-5 h-5 ${config.text}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="capitalize">{role.replace('_', ' ')}</span>
                                                        <span className="text-[var(--text-muted)]">{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            className={`h-full rounded-full ${config.bg.replace('/20', '')}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold mb-6">Category Distribution</h3>
                                <CategoryChart data={catStats.length > 0 ? catStats : []} />
                            </GlassCard>
                        </div>
                    </div>
                )}

                {/* User Management */}
                {activeTab === 'users' && (
                    <GlassCard className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold">User Management</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search users..."
                                        className="input-field pl-10 w-64"
                                    />
                                </div>
                                <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>
                                    Filter
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--card-border)]">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Village</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => {
                                        const roleConfig = roleColors[user.role]
                                        const RoleIcon = roleConfig.icon

                                        return (
                                            <tr key={user.id} className="border-b border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}>
                                                        <RoleIcon className="w-3 h-3" />
                                                        {user.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-[var(--text-muted)]">
                                                    {user.village || '-'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                            <Pencil className="w-4 h-4 text-[var(--text-muted)]" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}

                {/* Grant Schemes */}
                {activeTab === 'schemes' && (
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Grant Schemes Configuration</h3>
                            <Button
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => setIsAddSchemeModalOpen(true)}
                            >
                                Add Scheme
                            </Button>
                        </div>

                        {loadingSchemes ? (
                            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p>Loading schemes...</p>
                            </div>
                        ) : schemes.length === 0 ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No schemes configured</p>
                                <p className="text-sm">Click "Add Scheme" to create your first grant scheme</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--card-border)]">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Scheme Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Category</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Max Amount</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Status</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-muted)]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schemes.map((scheme) => (
                                            <tr key={scheme.id} className="border-b border-[var(--card-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{scheme.name}</div>
                                                    <div className="text-xs text-[var(--text-muted)] line-clamp-1">{scheme.description}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="capitalize text-sm">{scheme.category}</span>
                                                </td>
                                                <td className="py-4 px-4 font-medium">
                                                    ₹{(scheme.max_amount / 100000).toFixed(1)}L
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${scheme.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                        {scheme.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                            <Pencil className="w-4 h-4 text-[var(--text-muted)]" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-red-500/20 transition-colors">
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </GlassCard>
                )}

                {/* Add Scheme Modal */}
                <AnimatePresence>
                    {isAddSchemeModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddSchemeModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar rounded-2xl"
                            >
                                <GlassCard className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold">Add New Scheme</h3>
                                        <button onClick={() => setIsAddSchemeModalOpen(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
                                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddScheme} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Scheme Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newScheme.name}
                                                onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                                                placeholder="e.g., Rural Road Development"
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Category</label>
                                            <select
                                                required
                                                value={newScheme.category}
                                                onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="roads">Roads</option>
                                                <option value="water">Water</option>
                                                <option value="education">Education</option>
                                                <option value="healthcare">Healthcare</option>
                                                <option value="power">Power</option>
                                                <option value="agriculture">Agriculture</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Max Grant Amount (₹)</label>
                                            <input
                                                required
                                                type="number"
                                                value={newScheme.max_amount}
                                                onChange={(e) => setNewScheme({ ...newScheme, max_amount: e.target.value })}
                                                placeholder="e.g., 1000000"
                                                className="input-field"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Description</label>
                                            <textarea
                                                required
                                                value={newScheme.description}
                                                onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                                                placeholder="Detailed description and eligibility criteria..."
                                                rows={4}
                                                className="input-field resize-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-[var(--text-muted)]">Required Documents</label>
                                                <button
                                                    type="button"
                                                    onClick={toggleAllDocuments}
                                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    {newScheme.required_documents.length === AVAILABLE_DOCUMENTS.length
                                                        ? 'Deselect All'
                                                        : 'Select All Documents'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)] custom-scrollbar">
                                                {AVAILABLE_DOCUMENTS.map((doc) => {
                                                    const isSelected = newScheme.required_documents.includes(doc)
                                                    return (
                                                        <label
                                                            key={doc}
                                                            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 border ${isSelected
                                                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                                : 'bg-black/5 dark:bg-white/5 border-transparent text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    toggleDocument(doc)
                                                                }}
                                                                className={`mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                                    ? 'bg-purple-500 border-purple-400'
                                                                    : 'bg-black/10 dark:bg-white/10 border-[var(--card-border)]'
                                                                    }`}
                                                            >
                                                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-xs leading-tight">{doc}</span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            <p className="text-[10px] text-[var(--text-muted)] italic">
                                                {newScheme.required_documents.length} documents selected
                                            </p>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => setIsAddSchemeModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="flex-1"
                                                loading={submittingScheme}
                                            >
                                                Create Scheme
                                            </Button>
                                        </div>
                                    </form>
                                </GlassCard>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Fund Disbursements */}
                {activeTab === 'disbursements' && (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-6">Approved Grants & Fund Releases</h3>
                            
                            {approvedApps.length === 0 ? (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    <IndianRupee className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No approved grants found for disbursement.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {approvedApps.map((app) => {
                                        const remaining = app.approvedAmount - app.totalReleasedAmount;
                                        const progress = app.approvedAmount > 0 ? (app.totalReleasedAmount / app.approvedAmount) * 100 : 0;
                                        
                                        return (
                                            <div key={app.id} className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500/10 text-blue-500">
                                                                {app.applicationNumber}
                                                            </span>
                                                            <span className="text-sm px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--text-muted)]">
                                                                {app.scheme}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-semibold text-[var(--text-main)] mb-1">{app.title}</h4>
                                                        <p className="text-sm text-[var(--text-muted)] flex items-center gap-2 mb-4">
                                                            <MapPin className="w-4 h-4" /> {app.village}, {app.district}
                                                        </p>

                                                        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5">
                                                            <div>
                                                                <div className="text-xs text-[var(--text-muted)] mb-1">Total Approved</div>
                                                                <div className="font-bold text-[var(--text-main)]">₹{app.approvedAmount.toLocaleString('en-IN')}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-[var(--text-muted)] mb-1">Released Amount</div>
                                                                <div className="font-bold text-green-500">₹{app.totalReleasedAmount.toLocaleString('en-IN')}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-[var(--text-muted)] mb-1">Remaining</div>
                                                                <div className="font-bold text-amber-500">₹{remaining.toLocaleString('en-IN')}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-4">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-[var(--text-muted)]">Fund Release Progress</span>
                                                                <span className="font-medium">{progress.toFixed(0)}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${progress}%` }}
                                                                    className="h-full bg-gradient-to-r from-green-400 to-green-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                                        <Button 
                                                            variant="primary" 
                                                            icon={<IndianRupee className="w-4 h-4" />}
                                                            onClick={() => {
                                                                setSelectedApp(app)
                                                                setIsReleaseModalOpen(true)
                                                                setReleaseAmount('')
                                                                setReleaseRemarks('')
                                                            }}
                                                            disabled={remaining <= 0}
                                                        >
                                                            {remaining <= 0 ? 'Fully Disbursed' : 'Release Funds'}
                                                        </Button>
                                                        
                                                        {app.installments && app.installments.length > 0 && (
                                                            <div className="mt-2">
                                                                <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Installments History</div>
                                                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                                                    {app.installments.map((inst: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-[var(--card-border)] last:border-0">
                                                                            <span className="text-[var(--text-muted)]">#{inst.installmentNumber} • {new Date(inst.releaseDate).toLocaleDateString()}</span>
                                                                            <span className="font-medium text-green-400">₹{inst.amount.toLocaleString()}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}

                {/* Release Fund Modal */}
                <AnimatePresence>
                    {isReleaseModalOpen && selectedApp && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsReleaseModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar rounded-2xl"
                            >
                                <GlassCard className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold">Release Funding Installment</h3>
                                        <button onClick={() => setIsReleaseModalOpen(false)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors">
                                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                                        </button>
                                    </div>
                                    
                                    <div className="mb-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">
                                        <div className="text-sm font-medium mb-1">{selectedApp.title}</div>
                                        <div className="flex justify-between text-sm mb-1 mt-3">
                                            <span className="text-[var(--text-muted)]">Approved Amount:</span>
                                            <span className="font-semibold">₹{selectedApp.approvedAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-[var(--text-muted)]">Already Released:</span>
                                            <span className="font-semibold text-green-500">₹{selectedApp.totalReleasedAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[var(--card-border)]">
                                            <span className="font-medium text-[var(--text-muted)]">Remaining Balance:</span>
                                            <span className="font-bold text-amber-500">₹{(selectedApp.approvedAmount - selectedApp.totalReleasedAmount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleReleaseFund} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Installment Amount (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                                <input
                                                    required
                                                    type="number"
                                                    value={releaseAmount}
                                                    onChange={(e) => setReleaseAmount(e.target.value)}
                                                    placeholder="Enter amount to release"
                                                    className="input-field pl-10 w-full"
                                                    max={selectedApp.approvedAmount - selectedApp.totalReleasedAmount}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Remarks (Optional)</label>
                                            <textarea
                                                value={releaseRemarks}
                                                onChange={(e) => setReleaseRemarks(e.target.value)}
                                                placeholder="e.g., First installment for mobilization..."
                                                rows={3}
                                                className="input-field resize-none w-full"
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => setIsReleaseModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="flex-1"
                                                loading={releasingFund}
                                            >
                                                Release Funds
                                            </Button>
                                        </div>
                                    </form>
                                </GlassCard>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Analytics */}
                {activeTab === 'analytics' && (
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold mb-6">System Analytics</h3>
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Advanced analytics dashboard</p>
                            <p className="text-sm">View trends, performance metrics, and generate reports</p>
                        </div>
                    </GlassCard>
                )}

                {/* Audit Logs */}
                {activeTab === 'audit' && (
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Audit Logs</h3>
                            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                                Export Logs
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-[var(--text-muted)]">No logs found.</div>
                            ) : (
                                logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5`}>
                                            <History className={`w-5 h-5 ${actionColors[log.action] || 'text-[var(--text-muted)]'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-medium ${actionColors[log.action] || 'text-gray-400'}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                <span className="text-[var(--text-main)]">{log.user}</span> on{' '}
                                                <span className="text-blue-400">{log.entity_type} {log.entity_id}</span>
                                            </p>
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">
                                            {new Date(log.timestamp).toLocaleString('en-IN')}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                )}
            </div>
        </AppLayout>
    )
}
