'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Home,
    FileText,
    PlusCircle,
    Clock,
    User as UserIcon,
    MapPin,
    IndianRupee,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Upload,
    Save,
    Send,
    FileCheck,
    Landmark,
    Eye
} from 'lucide-react'
import Header from '@/components/layout/Header'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import ProgressRing from '@/components/ui/ProgressRing'
import DynamicMilestones from '@/components/ui/DynamicMilestones'
import {
    getPanchayatApplications,
    getGrantSchemes,
    submitApplication,
    uploadDocument,
    getApplicationDocuments,
    getMilestones,
    getUserProfile
} from '@/lib/db/actions'
import AppLayout from '@/components/layout/AppLayout'
import { toast } from 'react-hot-toast'
import { Info, BookOpen } from 'lucide-react'

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
    "Project Proposal": "A comprehensive document detailing the project's goals, methodology, and timeline.",
    "Land NOC / Documents": "Proof of land ownership or a No Objection Certificate from the relevant authority.",
    "Environmental Clearance": "Official certification that the project complies with environmental regulations.",
    "Technical Survey Report": "A professional analysis of the project site and technical feasibility.",
    "Technical Plan": "Detailed engineering drawings and project specifications.",
    "Water Quality Report": "Analysis of water sources to ensure safety and quality standards (for water projects).",
    "Population Certificate": "Proof of the beneficiary population size from the census or local records.",
    "School Registration": "Valid registration documents for educational infrastructure projects.",
    "Infrastructure Assessment": "A formal evaluation of existing infrastructure and necessary improvements.",
    "Equipment List": "A detailed inventory of machinery or tools required for the project.",
    "Building Plan": "Architectural blueprints for any construction work.",
    "Budget Estimate": "An itemized list of all expected costs and financial requirements.",
    "Geotagged Photos": "Photographs of the project site with embedded GPS coordinates for verification.",
    "Utility Board NOC": "Permission from utility providers (electricity, water, etc.) for project implementation."
};

export default function PanchayatDashboard() {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedScheme, setSelectedScheme] = useState('')
    const [myApplications, setMyApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requestedAmount: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [grantSchemes, setGrantSchemes] = useState<any[]>([])

    // New State for Filtering and Details
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [selectedApp, setSelectedApp] = useState<any>(null)
    const [appDocuments, setAppDocuments] = useState<any[]>([])
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
    const [loadingDocs, setLoadingDocs] = useState(false)
    const [appMilestones, setAppMilestones] = useState<any[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const [uploadingFile, setUploadingFile] = useState(false)

    const router = useRouter()

    const currentScheme = grantSchemes.find(s => s.id === selectedScheme)
    const requiredDocs: string[] = currentScheme?.required_documents || []

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Get current user session
                const meRes = await fetch('/api/auth/me')
                const { user: sessionUser } = await meRes.json()

                if (sessionUser) {
                    const profile = await getUserProfile(sessionUser._id || sessionUser.id)
                    setUser({ ...sessionUser, ...profile })
                }

                // Fetch Apps and Schemes
                const [apps, schemes, filesRes] = await Promise.all([
                    getPanchayatApplications(),
                    getGrantSchemes(),
                    fetch('/api/files')
                ])

                setGrantSchemes(schemes)
                setMyApplications(apps.map((a: any) => ({
                    id: a.id,
                    applicationNumber: a.application_number,
                    title: a.title,
                    scheme: a.grant_schemes?.name || 'Unknown',
                    status: a.status,
                    amount: a.approved_amount || a.requested_amount,
                    approvedAmount: a.approved_amount || 0,
                    amountReceived: a.totalReleasedAmount || 0,
                    installments: a.installments || [],
                    submittedDate: a.createdAt,
                    progress: a.completion_percentage,
                    rejectionReason: a.rejection_reason
                })))

                if (filesRes.ok) {
                    const files = await filesRes.json()
                    setUploadedFiles(files)
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, appId: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only PDF, JPG, and PNG are allowed.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Max 5MB allowed.')
            return
        }

        setUploadingFile(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('applicationId', appId)
        uploadFormData.append('documentType', 'Project Evidence')

        try {
            const res = await fetch('/api/files/upload', {
                method: 'POST',
                body: uploadFormData
            })

            if (res.ok) {
                const data = await res.json()
                setUploadedFiles(prev => [data.document, ...prev])
                // Refresh specific app documents if viewing details
                if (selectedApp && selectedApp.id === appId) {
                    const docs = await getApplicationDocuments(appId)
                    setAppDocuments(docs)
                }
                alert('File uploaded successfully!')
            } else {
                const error = await res.json()
                alert(error.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploadingFile(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || (!user.id && !user._id)) {
            console.log('Submission failed: User object is null or missing ID', user)
            alert('You must be logged in to submit an application. Please refresh and try again.')
            return
        }

        const effectiveVillageId = user.village?.id || user.village_id;
        if (!effectiveVillageId) {
            alert('Error: Your profile is missing a Village assignment. Please refresh the page and try again. If the issue persists, contact an administrator.');
            return
        }

        if (!selectedScheme || !formData.title || !formData.requestedAmount) {
            alert('Please fill in all required fields.')
            return
        }

        const currentScheme = grantSchemes.find(s => s.id === selectedScheme)
        const requiredDocs = currentScheme?.required_documents || []

        // Check if all required documents are selected
        const missingDocs = requiredDocs.filter((doc: string) => !selectedFiles[doc])
        if (missingDocs.length > 0) {
            alert(`Please upload the following required documents: ${missingDocs.join(', ')}`)
            return
        }

        setSubmitting(true)
        const payload = {
            village_id: effectiveVillageId,
            scheme_id: selectedScheme,
            submitted_by: user.id || user._id,
            title: formData.title,
            description: formData.description,
            requested_amount: parseFloat(formData.requestedAmount),
            status: 'submitted'
        }

        console.log('Submitting application with payload:', payload)
        try {
            const newApp = await submitApplication(payload)
            console.log('Application submitted successfully, ID:', newApp.id)

            // Upload required files
            const filesToUpload = Object.entries(selectedFiles).filter(([_, file]) => !!file)
            if (filesToUpload.length > 0) {
                console.log(`Starting sequential upload of ${filesToUpload.length} files...`)
                for (const [docType, file] of filesToUpload) {
                    if (!file) continue
                    console.log(`Uploading ${docType}:`, file.name)

                    const docFormData = new FormData()
                    docFormData.append('file', file)
                    docFormData.append('applicationId', newApp.id)
                    docFormData.append('documentType', docType)

                    const uploadRes = await fetch('/api/files/upload', {
                        method: 'POST',
                        body: docFormData
                    })

                    if (!uploadRes.ok) {
                        const errorData = await uploadRes.json()
                        throw new Error(`Upload failed for ${docType}: ${errorData.error || uploadRes.statusText}`)
                    }

                    console.log(`Finished uploading ${docType}`)
                }
            }

            setSubmitSuccess(true)
            toast.success('Application submitted successfully!')
            setFormData({ title: '', description: '', requestedAmount: '' })
            setSelectedScheme('')
            setSelectedFiles({})

            // Refresh apps
            const apps = await getPanchayatApplications()
            setMyApplications(apps.map((a: any) => ({
                id: a.id,
                applicationNumber: a.application_number,
                title: a.title,
                scheme: a.grant_schemes?.name || 'Unknown',
                status: a.status,
                amount: a.approved_amount || a.requested_amount,
                approvedAmount: a.approved_amount || 0,
                amountReceived: a.totalReleasedAmount || 0,
                installments: a.installments || [],
                submittedDate: a.createdAt,
                progress: a.completion_percentage,
                rejectionReason: a.rejection_reason
            })))

            setTimeout(() => setSubmitSuccess(false), 8000)
        } catch (err: any) {
            console.error('Submission failed:', err)
            toast.error(`Failed: ${err.message || 'Unknown error'}`)
        } finally {
            setSubmitting(false)
        }
    }

    const officerData = {
        name: user?.full_name || 'Gram Panchayat Officer',
        village: user?.village?.name || user?.villages?.name || 'Loading...',
        district: user?.district?.name || user?.districts?.name || 'Location',
        designation: 'Gram Panchayat Secretary'
    }

    const handleViewDetails = async (app: any) => {
        setSelectedApp(app)
        setViewDetailsOpen(true)
        setLoadingDocs(true)
        try {
            const [docs, milestonesData] = await Promise.all([
                getApplicationDocuments(app.id),
                getMilestones(app.id)
            ])
            setAppDocuments(docs)
            setAppMilestones(milestonesData)
        } catch (error) {
            console.error('Failed to fetch details:', error)
        } finally {
            setLoadingDocs(false)
        }
    }


    const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
        draft: { bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText, label: 'Draft' },
        submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Under Review' },
        under_review: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Under Review' },
        approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Approved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
        in_progress: { bg: 'bg-sky-100', text: 'text-sky-700', icon: Clock, label: 'In Progress' },
        completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' }
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'applications', label: 'My Applications', icon: FileText },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'new', label: 'New Application', icon: PlusCircle }
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
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                    <Landmark className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--text-main)]">{officerData.name}</h1>
                                    <p className="text-[var(--text-muted)]">{officerData.designation}</p>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{officerData.village}, {officerData.district}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('new')}
                                icon={<PlusCircle className="w-5 h-5" />}
                            >
                                New Application
                            </Button>
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
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <GlassCard className="p-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setActiveTab('applications')}>
                                <div className="text-3xl font-bold text-[var(--text-main)] mb-2">{myApplications.length}</div>
                                <div className="text-[var(--text-muted)]">Total Applications</div>
                            </GlassCard>
                            <GlassCard className="p-6" onClick={() => { setFilterStatus('submitted'); setActiveTab('applications'); }}>
                                <div className="text-3xl font-bold text-blue-400 mb-2">
                                    {myApplications.filter(a => a.status === 'submitted').length}
                                </div>
                                <div className="text-[var(--text-muted)]">Pending Review</div>
                            </GlassCard>
                            <GlassCard className="p-6" onClick={() => { setFilterStatus('approved'); setActiveTab('applications'); }}>
                                <div className="text-3xl font-bold text-green-400 mb-2">
                                    {myApplications.filter(a => a.status === 'approved').length}
                                </div>
                                <div className="text-[var(--text-muted)]">Approved</div>
                            </GlassCard>
                            <GlassCard className="p-6">
                                <div className="text-3xl font-bold text-amber-400 mb-2">
                                    ₹{(myApplications.filter(a => a.status === 'approved').reduce((a, b) => a + (b.amountReceived || 0), 0) / 100000).toFixed(1)}L
                                </div>
                                <div className="text-[var(--text-muted)]">Funds Received</div>
                            </GlassCard>
                        </div>

                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-6">Recent Applications</h3>
                            <div className="space-y-4">
                                {myApplications.slice(0, 3).map((app) => {
                                    const statusInfo = statusConfig[app.status] || statusConfig.draft
                                    const StatusIcon = statusInfo.icon

                                    return (
                                        <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                            <div className={`p-3 rounded-xl ${statusInfo.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${statusInfo.text}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-[var(--text-main)]">{app.title}</h4>
                                                <p className="text-sm text-[var(--text-muted)]">{app.applicationNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${statusInfo.text}`}>{statusInfo.label}</div>
                                                <div className="text-sm text-[var(--text-muted)]">₹{((app.amount || 0) / 100000).toFixed(1)}L</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="space-y-6">
                        {myApplications
                            .filter(app => filterStatus === 'all' || app.status === filterStatus)
                            .map((app, index) => {
                                const statusInfo = statusConfig[app.status] || statusConfig.draft
                                const StatusIcon = statusInfo.icon
                                const fundProgress = app.approvedAmount > 0 ? (app.amountReceived / app.approvedAmount) * 100 : 0;

                                return (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <GlassCard className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                            <StatusIcon className="w-4 h-4" />
                                                            {statusInfo.label}
                                                        </span>
                                                        <span className="text-sm text-gray-500">{app.applicationNumber}</span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">{app.title}</h3>
                                                    <p className="text-[var(--text-muted)] text-sm mb-3">{app.scheme}</p>

                                                    <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-4 h-4" />
                                                            ₹{((app.amount || 0) / 100000).toFixed(1)}L
                                                        </span>
                                                        <span>Submitted: {new Date(app.submittedDate).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="shrink-0 flex items-center justify-center">
                                                        <ProgressRing
                                                            progress={fundProgress}
                                                            size={80}
                                                            strokeWidth={6}
                                                            color={fundProgress >= 100 ? "#22c55e" : "#4ade80"}
                                                        />
                                                    </div>
                                                    <Button variant="secondary" size="sm" onClick={() => handleViewDetails(app)}>
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )
                            })}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-8">
                        {/* Grant Schemes Library Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--text-main)]">Grant Information Library</h2>
                                    <p className="text-sm text-[var(--text-muted)]">Complete guide to available schemes and their required documentation.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {grantSchemes.map((scheme) => (
                                    <GlassCard key={scheme.id} className="p-6 border-l-4 border-l-blue-500">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-[var(--text-main)]">{scheme.name}</h3>
                                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold">
                                                        Max: ₹{(scheme.max_amount / 100000).toFixed(1)}L
                                                    </span>
                                                </div>
                                                <p className="text-[var(--text-muted)] mb-6 leading-relaxed bg-black/10 dark:bg-white/5 p-4 rounded-xl border border-[var(--card-border)]">
                                                    {scheme.description || "No description available for this scheme."}
                                                </p>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-[var(--text-muted)]">
                                                        <FileText className="w-4 h-4" /> Required Documents & Instructions
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {scheme.required_documents?.map((doc: string) => (
                                                            <div key={doc} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--card-border)] group hover:border-blue-500/30 transition-all">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-1 shrink-0">
                                                                        <Info className="w-3 h-3" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-sm text-[var(--text-main)] mb-1">{doc}</div>
                                                                        <p className="text-xs text-[var(--text-muted)] leading-normal">
                                                                            {DOCUMENT_DESCRIPTIONS[doc] || "Mandatory document for technical and financial validation of the proposed project."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!scheme.required_documents || scheme.required_documents.length === 0) && (
                                                            <div className="text-sm text-green-500 italic p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                                                                No additional documents are required for this scheme.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>

                        <hr className="border-[var(--card-border)] my-12" />

                        {/* Project Documents Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <FileCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--text-main)]">My Project Evidence</h2>
                                    <p className="text-sm text-[var(--text-muted)]">Archives of all documents uploaded for submitted applications.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {uploadedFiles.length > 0 ? (
                                    uploadedFiles.map((file) => (
                                        <div key={file.id} className="p-4 rounded-xl bg-white/5 border border-[var(--card-border)] hover:bg-white/10 transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-[var(--text-main)]">{file.file_name}</p>
                                                    <p className="text-xs text-[var(--text-muted)] capitalize">{file.document_type?.replace('_', ' ') || 'Document'}</p>
                                                </div>
                                                <a
                                                    href={`/api/files/${file.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-600">
                                        <p className="text-gray-400 font-medium">No project documents uploaded yet.</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">Uploaded proof will automatically appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'new' && (
                    <GlassCard className="p-8 max-w-4xl">
                        {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Application submitted successfully! You can view it in the "My Applications" tab.</span>
                            </motion.div>
                        )}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--text-main)]">New Grant Application</h2>
                            <p className="text-[var(--text-muted)]">Fill in the details below to submit a new grant application for your village.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[var(--text-main)]">Select Grant Scheme *</label>
                                    <select
                                        value={selectedScheme}
                                        onChange={(e) => {
                                            setSelectedScheme(e.target.value)
                                            setSelectedFiles({}) // Reset files when scheme changes
                                        }}
                                        className="input-field w-full"
                                        required
                                    >
                                        <option value="">Select a scheme...</option>
                                        {grantSchemes.map((scheme) => (
                                            <option key={scheme.id} value={scheme.id}>{scheme.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-[var(--text-main)]">Requested Amount (₹) *</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            <IndianRupee className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.requestedAmount}
                                            onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                                            className="input-field w-full pl-10"
                                            placeholder="e.g. 500000"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[var(--text-main)]">Project Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Enter a concise title for the project"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-[var(--text-main)]">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="input-field w-full resize-none"
                                    placeholder="Describe the project goals and impact..."
                                    required
                                />
                            </div>

                            {/* Dynamic Document Upload Section */}
                            {selectedScheme && (
                                <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text-main)]">Required Documents</h3>
                                        {requiredDocs.length > 0 ? (
                                            <p className="text-sm text-[var(--text-muted)]">Please upload the following documents required for this scheme.</p>
                                        ) : (
                                            <p className="text-sm text-green-500">No additional documents are required for this scheme.</p>
                                        )}
                                    </div>

                                    {requiredDocs.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {requiredDocs.map((docType) => (
                                                <div key={docType} className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-[var(--text-main)]">{docType}</span>
                                                        {selectedFiles[docType] && (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>

                                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[var(--card-border)] rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <Upload className={`w-6 h-6 mb-2 ${selectedFiles[docType] ? 'text-green-500' : 'text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]'}`} />
                                                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                                                                {selectedFiles[docType] ? selectedFiles[docType]?.name : 'Click to upload PDF/JPG'}
                                                            </p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null
                                                                setSelectedFiles(prev => ({ ...prev, [docType]: file }))
                                                            }}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={submitting}
                                    icon={<Send className="w-5 h-5" />}
                                    className="w-full md:w-auto"
                                >
                                    Submit Application
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                )}
            </div>

            {/* Application Details Modal */}
            {viewDetailsOpen && selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                    >
                        <GlassCard className="p-0 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold">{selectedApp.title}</h2>
                                <button onClick={() => setViewDetailsOpen(false)}>
                                    <XCircle className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-black/20">
                                        <div className="text-xs text-[var(--text-muted)] uppercase">Status</div>
                                        <div className="font-bold capitalize">{selectedApp.status.replace('_', ' ')}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/20">
                                        <div className="text-xs text-[var(--text-muted)] uppercase">Total Approved</div>
                                        <div className="font-bold">₹{selectedApp.approvedAmount > 0 ? selectedApp.approvedAmount.toLocaleString('en-IN') : selectedApp.amount?.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                                        <div className="text-xs uppercase">Received</div>
                                        <div className="font-bold">₹{(selectedApp.amountReceived || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                        <div className="text-xs uppercase">Remaining</div>
                                        <div className="font-bold">₹{Math.max(0, (selectedApp.approvedAmount || selectedApp.amount) - (selectedApp.amountReceived || 0)).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>

                                {selectedApp.approvedAmount > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-black/20">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-[var(--text-muted)] uppercase font-semibold">Fund Release Progress</span>
                                            <span className="font-bold text-green-400">{((selectedApp.amountReceived / selectedApp.approvedAmount) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(selectedApp.amountReceived / selectedApp.approvedAmount) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedApp.installments && selectedApp.installments.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-bold mb-3 text-lg">Fund Installments</h3>
                                        <div className="space-y-3">
                                            {selectedApp.installments.map((inst: any, idx: number) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/20 border border-[var(--card-border)] gap-2">
                                                    <div>
                                                        <div className="text-sm font-semibold text-[var(--text-main)]">Installment #{inst.installmentNumber}</div>
                                                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3" /> {new Date(inst.releaseDate).toLocaleDateString('en-IN')}
                                                        </div>
                                                        {inst.remarks && <div className="text-xs text-[var(--text-muted)] mt-2 italic">"{inst.remarks}"</div>}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-green-400 text-lg">₹{inst.amount.toLocaleString('en-IN')}</div>
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            {inst.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-bold mb-4">Documents</h3>
                                    <div className="space-y-3">
                                        {appDocuments.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                <span>{doc.file_name}</span>
                                                <a href={`/api/files/${doc.id}`} target="_blank" className="text-blue-400"><Eye className="w-4 h-4" /></a>
                                            </div>
                                        ))}
                                        <div className="mt-4">
                                            <label className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl cursor-pointer hover:bg-green-500/20 w-fit">
                                                <Upload className="w-4 h-4" />
                                                Upload Evidence
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, selectedApp.id)}
                                                    disabled={uploadingFile}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <DynamicMilestones milestones={appMilestones} />
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    )
}
