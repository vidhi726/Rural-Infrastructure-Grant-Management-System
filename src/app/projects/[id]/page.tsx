'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    MapPin,
    Calendar,
    IndianRupee,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Download,
    Share2
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Scene3D from '@/components/3d/Scene3D'
import GlassCard from '@/components/ui/GlassCard'
import Timeline3D from '@/components/ui/Timeline3D'
import ProgressRing from '@/components/ui/ProgressRing'
import Button from '@/components/ui/Button'
import { useEffect, useState } from 'react'
import { getProjectDetails } from '@/lib/db/actions'

const categoryColors: Record<string, string> = {
    roads: '#f59e0b',
    water: '#06b6d4',
    education: '#8b5cf6',
    power: '#eab308',
    agriculture: '#22c55e',
    healthcare: '#ec4899',
}

const statusColors: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2, label: 'Completed' },
    in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock, label: 'In Progress' },
    approved: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle, label: 'Approved' }
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const project = await getProjectDetails(unwrappedParams.id)
                if (project) {
                    setData({
                        id: project.id,
                        applicationNumber: project.application_number,
                        title: project.title,
                        description: project.description,
                        village: project.village,
                        district: project.district,
                        scheme: project.scheme,
                        category: project.category,
                        approvedAmount: project.approved_amount || 0,
                        utilizedAmount: project.approved_amount || 0, // Mocking utilization for now
                        status: project.status,
                        progress: project.completion_percentage,
                        startDate: project.created_at,
                        completionDate: '2025-12-30',
                        officer: 'Anil Sharma'
                    })
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [unwrappedParams.id])

    // Fallback while loading or if not found
    if (loading) return <div className="min-h-screen bg-grid flex items-center justify-center">Loading project details...</div>
    if (!data) return <div className="min-h-screen bg-grid flex items-center justify-center">Project not found.</div>

    const milestones = [
        { id: '1', title: 'Foundation & Survey', percentage: 25, isCompleted: data.progress >= 25, isVerified: true, date: '2024-09-20' },
        { id: '2', title: 'Base Layer Construction', percentage: 50, isCompleted: data.progress >= 50, isVerified: true, date: '2024-12-10' },
        { id: '3', title: 'Surface Layer & Drainage', percentage: 75, isCompleted: data.progress >= 75, isVerified: data.progress >= 75, date: '2025-03-15' },
        { id: '4', title: 'Final Inspection', percentage: 100, isCompleted: data.progress >= 100, isVerified: data.progress >= 100, date: '2025-05-10' },
    ]

    const installments = [
        { number: 1, amount: data.approvedAmount * 0.25, status: 'utilized', date: '2024-07-25', utilizationDate: '2024-09-15' },
        { number: 2, amount: data.approvedAmount * 0.25, status: 'utilized', date: '2024-10-10', utilizationDate: '2024-12-20' },
    ]

    const documents = [
        { name: 'Project Proposal', type: 'PDF', size: '2.4 MB' },
        { name: 'Technical Survey Report', type: 'PDF', size: '5.1 MB' },
    ]

    const statusInfo = statusColors[data.status] || statusColors.in_progress
    const StatusIcon = statusInfo.icon
    const categoryColor = categoryColors[data.category] || '#3b82f6'

    return (
        <main className="min-h-screen bg-grid">
            <Scene3D />
            <Header />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Hero Section */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8 h-full relative overflow-hidden">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <span
                                    className="px-3 py-1 text-sm font-medium rounded-full capitalize"
                                    style={{
                                        backgroundColor: `${categoryColor}20`,
                                        color: categoryColor
                                    }}
                                >
                                    {data.category}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusInfo.label}
                                </span>
                                <span className="text-sm text-gray-500">{data.applicationNumber}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 line-height-tight">
                                {data.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {data.village}, {data.district}
                                </span>
                                <span className="flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Scheme: {data.scheme}
                                </span>
                            </div>

                            <p className="text-gray-300 leading-relaxed">
                                {data.description}
                            </p>
                        </GlassCard>
                    </div>

                    <div className="lg:col-span-1">
                        <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center">
                            <div className="mb-6 relative">
                                <ProgressRing
                                    progress={data.progress}
                                    size={180}
                                    strokeWidth={12}
                                    color={categoryColor}
                                    showLabel={true}
                                    label="Complete"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-3 rounded-xl bg-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Start Date</div>
                                    <div className="font-medium">{new Date(data.startDate).toLocaleDateString('en-IN')}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Expected End</div>
                                    <div className="font-medium">{new Date(data.completionDate).toLocaleDateString('en-IN')}</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Timeline & Docs */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Timeline */}
                        <GlassCard className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-400" />
                                Project Timeline
                            </h2>
                            <Timeline3D milestones={milestones} currentProgress={data.progress} />
                        </GlassCard>

                        {/* Documents */}
                        <GlassCard className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-400" />
                                Project Documents
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 mr-4">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{doc.name}</h4>
                                            <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Financials & Info */}
                    <div className="space-y-8">
                        {/* Financial Overview */}
                        <GlassCard className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-green-400" />
                                Financial Overview
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Total Approved</span>
                                        <span className="font-medium text-white">₹{(data.approvedAmount / 100000).toFixed(2)} Lakhs</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-full" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Funds Utilized</span>
                                        <span className="font-medium text-white">₹{(data.utilizedAmount / 100000).toFixed(2)} Lakhs</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.utilizedAmount / data.approvedAmount) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="font-medium mb-4">Installment History</h3>
                                    <div className="space-y-4">
                                        {installments.map((inst) => (
                                            <div key={inst.number} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                                                        {inst.number}
                                                    </div>
                                                    <span className="text-gray-300">Released</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">₹{(inst.amount / 100000).toFixed(2)}L</div>
                                                    <div className="text-xs text-gray-500">{new Date(inst.date).toLocaleDateString('en-IN')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Officer Details */}
                        <GlassCard className="p-6">
                            <h3 className="font-bold mb-4">Verifying Officer</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg">
                                    {data.officer.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium">{data.officer}</div>
                                    <div className="text-sm text-gray-400">District Development Officer</div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Button variant="secondary" size="sm" className="w-full">
                                    Contact
                                </Button>
                                <Button variant="primary" size="sm" className="w-full">
                                    Report Issue
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </main>
    )
}
