'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileCheck,
    Clock,
    XCircle,
    IndianRupee,
    MapPin,
    User,
    Shield,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Send,
    FileText,
    DollarSign,
    Download,
    ExternalLink,
    History
} from 'lucide-react'
import { getGovernmentApplications, updateApplicationStatus, getApplicationDocuments, verifyDocument, getGovernmentComplaints, getMilestones, addMilestone } from '@/lib/db/actions'
// Removed Supabase import
import AppLayout from '@/components/layout/AppLayout'
import DynamicMilestones from '@/components/ui/DynamicMilestones'
import { getUserProfile } from '@/lib/db/actions'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import ProgressRing from '@/components/ui/ProgressRing'

export default function GovernmentDashboard() {
    const [activeTab, setActiveTab] = useState('pending')
    const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [pendingApplications, setPendingApplications] = useState<Record<string, any>[]>([])
    const [approvedApplications, setApprovedApplications] = useState<Record<string, any>[]>([])
    const [rejectedApplications, setRejectedApplications] = useState<Record<string, any>[]>([])
    const [activeProjects, setActiveProjects] = useState<Record<string, any>[]>([])
    const [loading, setLoading] = useState(true)
    const [viewingDocuments, setViewingDocuments] = useState<{ id: string, title: string } | null>(null)
    const [rejectingDocument, setRejectingDocument] = useState<{ id: string, name: string } | null>(null)
    const [docRejectionReason, setDocRejectionReason] = useState('')
    const [documents, setDocuments] = useState<Record<string, any>[]>([])
    const [allDocuments, setAllDocuments] = useState<any[]>([])
    const [complaints, setComplaints] = useState<Record<string, any>[]>([])
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [projectMilestones, setProjectMilestones] = useState<any[]>([])
    const [showMilestoneModal, setShowMilestoneModal] = useState(false)
    const [newMilestone, setNewMilestone] = useState({ title: '', description: '', status: 'pending' })
    const [fetchTrigger, setFetchTrigger] = useState(0)
    const [officerData, setOfficerData] = useState({
        name: 'Loading...',
        designation: 'Officer',
        district: '...',
        stateId: ''
    })

    const categoryColors: Record<string, string> = {
        roads: '#f59e0b',
        water: '#06b6d4',
        education: '#8b5cf6',
        power: '#eab308',
        agriculture: '#22c55e',
        healthcare: '#ec4899',
    }

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch('/api/auth/me')
            const { user } = await response.json()
            if (user) {
                const profile = await getUserProfile(user.id)

                if (profile) {
                    setOfficerData({
                        name: profile.full_name,
                        designation: profile.role.replace('_', ' '),
                        district: profile.villages?.districts?.name || 'Pune',
                        stateId: profile.state_id || ''
                    })
                }
            } else {
                setOfficerData({
                    name: 'Guest Officer',
                    designation: 'Unauthorized Access',
                    district: 'None',
                    stateId: ''
                })
            }
        }
        fetchUser()
    }, [])

    useEffect(() => {
        async function fetchAllDocs() {
            const res = await fetch('/api/files')
            if (res.ok) {
                const data = await res.json()
                setAllDocuments(data)
            }
        }
        if (officerData.stateId) fetchAllDocs()
    }, [officerData.stateId, fetchTrigger])

    useEffect(() => {
        async function fetchData() {
            try {
                const [pending, approved, rejected, stateComplaints] = await Promise.all([
                    getGovernmentApplications(officerData.stateId, ['submitted', 'under_review']),
                    getGovernmentApplications(officerData.stateId, ['approved', 'in_progress', 'completed']),
                    getGovernmentApplications(officerData.stateId, ['rejected', 'cancelled']),
                    getGovernmentComplaints(officerData.stateId)
                ])

                const mapApp = (a: any) => {
                    const docs = a.documents || []
                    const verifiedDocs = docs.filter((d: { is_verified: boolean }) => d.is_verified).length
                    const rejectedDocs = docs.filter((d: { is_verified: boolean, verified_at: string | null }) => !d.is_verified && !!d.verified_at).length
                    return {
                        id: a.id,
                        applicationNumber: a.application_number,
                        title: a.title,
                        description: a.description,
                        village: a.villages?.name || 'Unknown',
                        district: a.villages?.districts?.name || 'Unknown',
                        scheme: a.grant_schemes?.name || 'Unknown',
                        category: a.grant_schemes?.category || 'roads',
                        requestedAmount: a.requested_amount,
                        approvedAmount: a.approved_amount || 0,
                        totalReleasedAmount: a.totalReleasedAmount || 0,
                        installments: a.installments || [],
                        rejectionReason: a.rejection_reason,
                        status: a.status,
                        submittedBy: 'Village Secretary',
                        submittedDate: a.created_at,
                        approvedDate: a.approved_at,
                        documentsVerified: verifiedDocs,
                        documentsRejected: rejectedDocs,
                        totalDocuments: (a.grant_schemes as any)?.required_documents?.length || 1
                    }
                }

                setPendingApplications(pending.map(mapApp))
                setApprovedApplications(approved.map(mapApp))
                setRejectedApplications(rejected.map(mapApp))
                setComplaints(stateComplaints.map((c: any) => ({
                    id: c.id,
                    complaintNumber: c.complaint_number,
                    title: c.title,
                    description: c.description,
                    submittedBy: (c.users as any)?.full_name || 'Citizen',
                    email: (c.users as any)?.email,
                    village: c.villages?.name,
                    district: c.villages?.districts?.name,
                    status: c.status,
                    date: c.created_at
                })))
                setActiveProjects(approved.filter((a: any) => a.status === 'in_progress').map(mapApp))
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [fetchTrigger, officerData.stateId])

    const handleApprove = async (id: string, amount: number) => {
        try {
            const res = await fetch('/api/auth/me')
            const { user } = await res.json()

            if (!user) {
                alert('Authentication required. Please log in as a government officer.')
                return
            }

            await updateApplicationStatus(id, 'approved', {
                approved_amount: amount,
                approved_by: user.id
            })
            setFetchTrigger(prev => prev + 1)
        } catch (err: any) {
            console.error('Approval error details:', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code
            })
            alert(`Failed to approve application: ${err.message || 'Unknown error'}`)
        }
    }

    const handleConfirmRejection = async () => {
        if (!selectedApplication || !rejectionReason) return
        try {
            const res = await fetch('/api/auth/me')
            const { user } = await res.json()

            if (!user) {
                alert('Authentication required. Please log in as a government officer.')
                return
            }

            await updateApplicationStatus(selectedApplication, 'rejected', {
                rejection_reason: rejectionReason
            })
            setShowRejectModal(false)
            setRejectionReason('')
            setFetchTrigger(prev => prev + 1)
        } catch (err: any) {
            console.error('Rejection error details:', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code
            })
            alert(`Failed to reject application: ${err.message || 'Unknown error'}`)
        }
    }

    const handleViewDocuments = async (id: string, title: string) => {
        console.log('handleViewDocuments called for ID:', id, 'Title:', title)
        try {
            const docs = await getApplicationDocuments(id)
            console.log('Documents fetched for modal:', docs)
            setDocuments(docs)
            setViewingDocuments({ id, title })
        } catch (err) {
            console.error('Fetch documents error:', err)
            alert('Failed to fetch documents')
        }
    }


    const handleVerifyDocument = async (docId: string, isVerified: boolean, reason?: string) => {
        try {
            const res = await fetch('/api/auth/me')
            const { user } = await res.json()
            if (!user) return

            await verifyDocument(docId, isVerified, user.id, reason)

            // Update local state
            setDocuments(prev => prev.map(doc =>
                doc.id === docId ? { ...doc, is_verified: isVerified, verified_at: new Date().toISOString(), rejection_reason: reason } : doc
            ))

            // Trigger a refresh of the main list to update progress bars
            setFetchTrigger(prev => prev + 1)
        } catch (err) {
            console.error('Verify document error:', err)
            alert('Failed to update document status')
        }
    }

    const handleViewMilestones = async (project: any) => {
        try {
            const milestones = await getMilestones(project.id)
            setProjectMilestones(milestones)
            setSelectedProject(project)
        } catch (err) {
            console.error('Fetch milestones error:', err)
        }
    }

    const handleAddMilestone = async () => {
        if (!selectedProject || !newMilestone.title) return
        try {
            await addMilestone({
                application_id: selectedProject.id,
                ...newMilestone
            })
            setNewMilestone({ title: '', description: '', status: 'pending' })
            setShowMilestoneModal(false)
            handleViewMilestones(selectedProject)
        } catch (err) {
            console.error('Add milestone error:', err)
            alert('Failed to add milestone')
        }
    }


    const tabs = [
        { id: 'pending', label: 'Pending Review', icon: Clock, count: pendingApplications.length },
        { id: 'approved', label: 'Approved', icon: ThumbsUp },
        { id: 'rejected', label: 'Rejected', icon: ThumbsDown },
        { id: 'complaints', label: 'Complaints', icon: FileText, count: complaints.length },
        { id: 'fund', label: 'Fund Releases', icon: DollarSign }
    ]

    if (loading) {
        return <div className="min-h-screen bg-grid flex items-center justify-center">
            <div className="text-white">Loading Portal...</div>
        </div>
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
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--text-main)]">{officerData.name}</h1>
                                    <p className="text-[var(--text-muted)] capitalize">{officerData.designation}</p>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{officerData.district} District</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="text-2xl font-bold text-red-400">{pendingApplications.length}</div>
                                    <div className="text-xs text-gray-400">Pending Actions</div>
                                </div>
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
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>


                {activeTab === 'complaints' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-[var(--text-main)]">Citizen Complaints</h2>
                            <p className="text-sm text-[var(--text-muted)]">Showing complaints from your state</p>
                        </div>
                        <div className="grid gap-6">
                            {complaints.length === 0 ? (
                                <GlassCard className="p-12 text-center text-[var(--text-muted)]">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No complaints found in your state.
                                </GlassCard>
                            ) : (
                                complaints.map((complaint) => (
                                    <GlassCard key={complaint.id} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-mono bg-blue-500/10 text-blue-500 px-2 py-1 rounded border border-blue-500/20">
                                                        {complaint.complaintNumber}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full capitalize font-medium ${complaint.status === 'open' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {complaint.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--text-main)]">{complaint.title}</h3>
                                            </div>
                                            <div className="text-right text-sm text-[var(--text-muted)]">
                                                <div className="flex items-center gap-1 justify-end font-medium">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(complaint.date).toLocaleDateString('en-IN')}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[var(--text-muted)] mb-6 text-sm md:text-base leading-relaxed">{complaint.description}</p>
                                        <div className="pt-6 border-t border-[var(--card-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">{complaint.submittedBy}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{complaint.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <MapPin className="w-4 h-4 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">{complaint.village}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{complaint.district}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary">Contact Citizen</Button>
                                                <Button size="sm" variant="primary">Mark as Resolved</Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Pending Applications */}
                {activeTab === 'pending' && (
                    <div className="space-y-6">
                        {pendingApplications.length === 0 ? (
                            <GlassCard className="p-12 text-center text-[var(--text-muted)]">
                                No pending applications found.
                            </GlassCard>
                        ) : (
                            pendingApplications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="overflow-hidden">
                                        <div
                                            className="h-1"
                                            style={{ backgroundColor: categoryColors[app.category] }}
                                        />

                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span
                                                            className="px-3 py-1 text-sm font-medium rounded-full capitalize"
                                                            style={{
                                                                backgroundColor: `${categoryColors[app.category]}20`,
                                                                color: categoryColors[app.category]
                                                            }}
                                                        >
                                                            {app.category}
                                                        </span>
                                                        <span className="text-sm text-[var(--text-muted)]">{app.applicationNumber}</span>
                                                    </div>

                                                    <h3 className="text-xl font-semibold text-[var(--text-main)] mb-3">{app.title}</h3>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-xs text-[var(--text-muted)] mb-1">Village</div>
                                                            <div className="text-sm font-medium text-[var(--text-main)]">{app.village}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-[var(--text-muted)] mb-1">District</div>
                                                            <div className="text-sm font-medium text-[var(--text-main)]">{app.district}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-[var(--text-muted)] mb-1">Scheme</div>
                                                            <div className="text-sm font-medium text-[var(--text-main)]">{app.scheme}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-[var(--text-muted)] mb-1">Requested</div>
                                                            <div className="text-sm font-medium text-green-400">
                                                                ₹{(app.requestedAmount / 100000).toFixed(1)}L
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm text-[var(--text-muted)]">Document Verification</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-green-400">
                                                                        {app.documentsVerified} verified
                                                                    </span>
                                                                    {app.documentsRejected > 0 && (
                                                                        <span className="text-sm font-medium text-red-400">
                                                                            • {app.documentsRejected} rejected
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${(app.documentsVerified / app.totalDocuments) * 100}%` }}
                                                                    className="h-full bg-green-500"
                                                                />
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${(app.documentsRejected / app.totalDocuments) * 100}%` }}
                                                                    className="h-full bg-red-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                        <User className="w-4 h-4" />
                                                        <span>Submitted by {app.submittedBy} on {new Date(app.submittedDate).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 min-w-[200px]">
                                                    <Button
                                                        variant="secondary"
                                                        icon={<Eye className="w-4 h-4" />}
                                                        onClick={() => handleViewDocuments(app.id, app.title)}
                                                    >
                                                        View Documents
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        icon={<ThumbsUp className="w-4 h-4" />}
                                                        disabled={app.documentsVerified < app.totalDocuments}
                                                        onClick={() => handleApprove(app.id, app.requestedAmount)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        icon={<ThumbsDown className="w-4 h-4" />}
                                                        onClick={() => {
                                                            setSelectedApplication(app.id)
                                                            setShowRejectModal(true)
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Approved Applications */}
                {activeTab === 'approved' && (
                    <div className="space-y-6">
                        {approvedApplications.length === 0 ? (
                            <GlassCard className="p-12 text-center text-gray-400">
                                No approved applications yet.
                            </GlassCard>
                        ) : (
                            approvedApplications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="overflow-hidden">
                                        <div className="h-1 bg-green-500" />
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-500/10 text-green-400">
                                                            Approved
                                                        </span>
                                                        <span className="text-sm text-[var(--text-muted)]">{app.applicationNumber}</span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">{app.title}</h3>
                                                    <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{app.description}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Village & District</div>
                                                            <div className="text-sm font-medium">{app.village}, {app.district}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Requested</div>
                                                            <div className="text-sm font-medium">₹{(app.requestedAmount / 100000).toFixed(1)}L</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Approved Amount</div>
                                                            <div className="text-sm font-bold text-green-400">₹{(app.approvedAmount / 100000).toFixed(1)}L</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Approved Date</div>
                                                            <div className="text-sm font-medium">{new Date(app.approvedDate).toLocaleDateString('en-IN')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="bg-white/5 px-2 py-1 rounded">{app.scheme}</span>
                                                        <span>Submitted by: {app.submittedBy}</span>
                                                        <span>•</span>
                                                        <span>Status: <span className="capitalize text-green-400">{app.status.replace('_', ' ')}</span></span>
                                                    </div>
                                                </div>
                                                <Button variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => handleViewDocuments(app.id, app.title)}>
                                                    View Documents
                                                </Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Rejected Applications */}
                {activeTab === 'rejected' && (
                    <div className="space-y-6">
                        {rejectedApplications.length === 0 ? (
                            <GlassCard className="p-12 text-center text-gray-400">
                                No rejected applications.
                            </GlassCard>
                        ) : (
                            rejectedApplications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="overflow-hidden">
                                        <div className="h-1 bg-red-500" />
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-500/10 text-red-400">
                                                            Rejected
                                                        </span>
                                                        <span className="text-sm text-[var(--text-muted)]">{app.applicationNumber}</span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">{app.title}</h3>
                                                    <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{app.description}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Village & District</div>
                                                            <div className="text-sm font-medium">{app.village}, {app.district}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Scheme</div>
                                                            <div className="text-sm font-medium truncate">{app.scheme}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Requested</div>
                                                            <div className="text-sm font-medium">₹{(app.requestedAmount / 100000).toFixed(1)}L</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-1">Submitted Date</div>
                                                            <div className="text-sm font-medium">{new Date(app.submittedDate).toLocaleDateString('en-IN')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 mb-4">
                                                        <div className="text-xs text-red-400 font-bold mb-1">Rejection Reason</div>
                                                        <div className="text-sm text-[var(--text-muted)] italic">"{app.rejectionReason || 'No reason provided'}"</div>
                                                    </div>
                                                </div>
                                                <Button variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => handleViewDocuments(app.id, app.title)}>
                                                    View Documents
                                                </Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}


                {/* Fund Releases */}

                {/* Fund Releases */}
                {activeTab === 'fund' && (
                    <div className="space-y-6">
                        {approvedApplications.length === 0 ? (
                            <GlassCard className="p-12 text-center text-[var(--text-muted)]">
                                No approved grants to track fund releases for.
                            </GlassCard>
                        ) : (
                            approvedApplications.map((app) => {
                                const totalApproved = app.approvedAmount || 0;
                                const amountReceived = app.totalReleasedAmount || 0;
                                const remaining = Math.max(0, totalApproved - amountReceived);
                                const progress = totalApproved > 0 ? (amountReceived / totalApproved) * 100 : 0;

                                return (
                                    <GlassCard key={app.id} className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-500/10 text-blue-500">
                                                        {app.applicationNumber}
                                                    </span>
                                                    <span className="text-sm px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--text-muted)]">
                                                        {app.scheme}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-1">{app.title}</h3>
                                                <p className="text-sm text-[var(--text-muted)] mb-4">{app.village}, {app.district}</p>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">
                                                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1">Total Granted</div>
                                                        <div className="font-bold">₹{totalApproved.toLocaleString('en-IN')}</div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                                                        <div className="text-xs uppercase mb-1">Total Released</div>
                                                        <div className="font-bold">₹{amountReceived.toLocaleString('en-IN')}</div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                                        <div className="text-xs uppercase mb-1">Remaining</div>
                                                        <div className="font-bold">₹{remaining.toLocaleString('en-IN')}</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-[var(--text-muted)] uppercase font-semibold">Overall Release Progress</span>
                                                        <span className="font-bold text-green-400">{progress.toFixed(0)}%</span>
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

                                            <div className="w-full lg:w-72 bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-[var(--card-border)]">
                                                <h4 className="font-semibold text-sm uppercase text-[var(--text-muted)] mb-3 flex items-center gap-2">
                                                    <History className="w-4 h-4" /> Installment History
                                                </h4>
                                                {(!app.installments || app.installments.length === 0) ? (
                                                    <div className="text-xs text-[var(--text-muted)] text-center py-4 italic">No installments released yet</div>
                                                ) : (
                                                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                        {app.installments.map((inst: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                                                                <div>
                                                                    <div className="font-semibold">#{inst.installmentNumber}</div>
                                                                    <div className="text-[10px] text-[var(--text-muted)]">{new Date(inst.releaseDate).toLocaleDateString('en-IN')}</div>
                                                                </div>
                                                                <div className="font-bold text-green-400">
                                                                    ₹{inst.amount.toLocaleString('en-IN')}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Reject Modal */}
                <AnimatePresence>
                    {showRejectModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowRejectModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg"
                            >
                                <GlassCard className="p-6">
                                    <h3 className="text-xl font-bold mb-4 text-[var(--text-main)]">Reject Application</h3>
                                    <p className="text-[var(--text-muted)] mb-6">
                                        Please provide a reason for rejecting this application. This will be visible to the applicant.
                                    </p>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        rows={4}
                                        className="input-field resize-none mb-6"
                                    />
                                    <div className="flex items-center gap-4">
                                        <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="danger"
                                            icon={<Send className="w-4 h-4" />}
                                            onClick={handleConfirmRejection}
                                        >
                                            Confirm Rejection
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Documents Modal */}
                <AnimatePresence>
                    {viewingDocuments && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setViewingDocuments(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-2xl"
                            >
                                <GlassCard className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-[var(--text-main)]">Documents: {viewingDocuments.title}</h3>
                                        <button
                                            onClick={() => setViewingDocuments(null)}
                                            className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {documents.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-400">No documents uploaded for this application.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex flex-col p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)]">
                                                    <div className="flex items-center mb-4">
                                                        <div className={`p-3 rounded-lg mr-4 ${doc.is_verified ? 'bg-green-500/20 text-green-400' : (doc.verified_at ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}`}>
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium truncate text-[var(--text-main)]">{doc.file_name}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs text-[var(--text-muted)]">{doc.document_type}</p>
                                                                {doc.verified_at && !doc.is_verified && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>
                                                                )}
                                                                {doc.is_verified && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Accepted</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </a>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleVerifyDocument(doc.id, true)
                                                            }}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${doc.is_verified
                                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:bg-green-500/20 hover:text-green-400'
                                                                }`}
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setRejectingDocument({ id: doc.id, name: doc.file_name })
                                                                setDocRejectionReason(doc.rejection_reason || '')
                                                            }}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${(!doc.is_verified && doc.verified_at)
                                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400'
                                                                }`}
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                    {doc.rejection_reason && !doc.is_verified && (
                                                        <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-red-300 italic">
                                                            Reason: {doc.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 flex justify-end">
                                        <Button variant="secondary" onClick={() => setViewingDocuments(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Milestones Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setSelectedProject(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-2xl"
                            >
                                <GlassCard className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-[var(--text-main)]">Project Milestones</h3>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="success" onClick={() => setShowMilestoneModal(true)}>Add Milestone</Button>
                                            <button onClick={() => setSelectedProject(null)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pt-4">
                                        <DynamicMilestones milestones={projectMilestones} />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Milestone Modal */}
                <AnimatePresence>
                    {showMilestoneModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                            onClick={() => setShowMilestoneModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md"
                            >
                                <GlassCard className="p-6">
                                    <h3 className="text-xl font-bold mb-4 text-[var(--text-main)]">Add New Milestone</h3>
                                    <input
                                        type="text"
                                        placeholder="Milestone Title"
                                        className="input-field mb-4"
                                        value={newMilestone.title}
                                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Description"
                                        className="input-field mb-4 resize-none"
                                        rows={3}
                                        value={newMilestone.description}
                                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                    />
                                    <select
                                        className="input-field mb-6"
                                        value={newMilestone.status}
                                        onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" className="flex-1" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
                                        <Button variant="primary" className="flex-1" onClick={handleAddMilestone}>Save Milestone</Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Document Rejection Modal */}
                <AnimatePresence>
                    {rejectingDocument && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                            onClick={() => setRejectingDocument(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md"
                            >
                                <GlassCard className="p-6 border-red-500/30">
                                    <div className="flex items-center gap-3 mb-4 text-red-400">
                                        <XCircle className="w-6 h-6" />
                                        <h3 className="text-xl font-bold">Reject Document</h3>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] mb-6">
                                        Provide a reason for rejecting <span className="text-[var(--text-main)] font-medium">{rejectingDocument.name}</span>.
                                    </p>
                                    <textarea
                                        value={docRejectionReason}
                                        onChange={(e) => setDocRejectionReason(e.target.value)}
                                        placeholder="E.g., Document is unclear, expired, or incorrect type..."
                                        rows={3}
                                        className="input-field resize-none mb-6 text-sm"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => setRejectingDocument(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="flex-1"
                                            icon={<ThumbsDown className="w-4 h-4" />}
                                            disabled={!docRejectionReason.trim()}
                                            onClick={() => {
                                                handleVerifyDocument(rejectingDocument.id, false, docRejectionReason)
                                                setRejectingDocument(null)
                                                setDocRejectionReason('')
                                            }}
                                        >
                                            Reject Document
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    )
}
