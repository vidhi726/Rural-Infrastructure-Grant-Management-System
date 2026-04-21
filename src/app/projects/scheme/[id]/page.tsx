'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Calendar,
    IndianRupee,
    CheckCircle2,
    Clock,
    FileText,
    Info,
    LayoutGrid,
    Droplets,
    Map,
    GraduationCap,
    Zap,
    Leaf,
    HeartPulse,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    MapPin,
    Target
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Scene3D from '@/components/3d/Scene3D'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { getGrantSchemeById } from '@/lib/db/actions'

const categories = [
    { id: 'roads', label: 'Roads & Transport', icon: Map, color: '#f59e0b' },
    { id: 'water', label: 'Water Supply', icon: Droplets, color: '#06b6d4' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: '#8b5cf6' },
    { id: 'power', label: 'Energy & Power', icon: Zap, color: '#eab308' },
    { id: 'agriculture', label: 'Agriculture', icon: Leaf, color: '#22c55e' },
    { id: 'healthcare', label: 'Healthcare', icon: HeartPulse, color: '#ec4899' },
]

export default function SchemeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params)
    const [scheme, setScheme] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDetails() {
            try {
                const data = await getGrantSchemeById(unwrappedParams.id)
                setScheme(data)
            } catch (err) {
                console.error('Failed to fetch scheme details:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [unwrappedParams.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="text-xl font-medium text-[var(--text-muted)] animate-pulse">Loading scheme details...</div>
            </div>
        )
    }

    if (!scheme) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                 <GlassCard className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--text-main)]">Scheme Not Found</h2>
                    <p className="text-[var(--text-muted)] mt-2 mb-6">The requested grant scheme could not be located.</p>
                    <Link href="/projects">
                        <Button variant="secondary">Back to Directory</Button>
                    </Link>
                 </GlassCard>
            </div>
        )
    }

    const cat = categories.find(c => c.id === scheme.category) || { label: 'General', icon: LayoutGrid, color: '#3b82f6' }
    const CatIcon = cat.icon

    return (
        <main className="min-h-screen bg-grid">
            <Scene3D />
            <Header />

            <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-blue-500 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </Link>

                {/* Hero Header */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8 md:p-12 h-full relative overflow-hidden flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span 
                                    className="px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest border"
                                    style={{ 
                                        backgroundColor: `${cat.color}15`, 
                                        borderColor: `${cat.color}30`,
                                        color: cat.color 
                                    }}
                                >
                                    {cat.label}
                                </span>
                                <span className="px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20">
                                    Active Scheme
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-main)] mb-6 leading-tight">
                                {scheme.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 text-[var(--text-muted)]">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                        <IndianRupee className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider">Max Grant Value</p>
                                        <p className="text-lg font-bold text-[var(--text-main)]">₹{(scheme.max_amount / 100000).toFixed(1)} Lakhs</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider">Available Since</p>
                                        <p className="text-lg font-bold text-[var(--text-main)]">
                                            {scheme.valid_from ? new Date(scheme.valid_from).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Jan 2024'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="lg:col-span-1">
                        <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center bg-blue-600/5 border-blue-500/20">
                            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                                <CatIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Ready to apply?</h3>
                            <p className="text-[var(--text-muted)] text-sm mb-8">
                                Start your application today to secure funding for your local infrastructure project.
                            </p>
                            <Link href="/panchayat" className="w-full">
                                <Button className="w-full py-4 rounded-2xl shadow-lg shadow-blue-500/20">
                                    Apply for this Grant
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </GlassCard>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Motive Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">The Motive</h2>
                            </div>
                            <GlassCard className="p-8 border-none ring-1 ring-[var(--card-border)] bg-white/50 dark:bg-black/20">
                                <p className="text-lg text-[var(--text-muted)] leading-relaxed italic mb-6">
                                    "{scheme.name} aims to revolutionize {scheme.category} infrastructure at the grass-roots level, ensuring every village has the resources it needs for sustainable growth."
                                </p>
                                <div className="text-[var(--text-main)] leading-relaxed space-y-4">
                                    <p>{scheme.description || "Detailed information about the scheme's core objectives and intended impact on rural development."}</p>
                                    <p>The primary goal is to provide transparent funding mechanisms for {scheme.category}-oriented projects, reducing the time from proposal to implementation through digital verification.</p>
                                </div>
                            </GlassCard>
                        </section>

                        {/* Eligibility Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Eligibility Criteria</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { title: "Village Population", detail: "Minimum 500 residents for primary funding." },
                                    { title: "Infrastructure Need", detail: "Proposed project must address critical gaps." },
                                    { title: "Local Support", detail: "Gram Panchayat resolution required." },
                                    { title: "Land Clearing", detail: "Certified land availability for construction." }
                                ].map((item, i) => (
                                    <GlassCard key={i} className="p-6 border-none ring-1 ring-[var(--card-border)] hover:ring-emerald-500/30 transition-all">
                                        <h4 className="font-bold text-[var(--text-main)] mb-1">{item.title}</h4>
                                        <p className="text-sm text-[var(--text-muted)]">{item.detail}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-12">
                        {/* Timeline / Availability */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Timeline</h2>
                            </div>
                            <GlassCard className="p-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-1 bg-amber-500/20 rounded-full h-12 flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 -mt-0.5 shadow-lg shadow-amber-500/50" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-600 uppercase">Valid From</p>
                                            <p className="font-bold">{scheme.valid_from ? new Date(scheme.valid_from).toLocaleDateString('en-IN') : '01/01/2024'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-1 bg-red-500/20 rounded-full h-12 flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500 -mt-0.5 shadow-lg shadow-red-500/50" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-red-600 uppercase">Valid Until</p>
                                            <p className="font-bold">{scheme.valid_until ? new Date(scheme.valid_until).toLocaleDateString('en-IN') : '31/12/2025'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                                        Applications must be submitted at least 60 days before the expiry date for final processing.
                                    </div>
                                </div>
                            </GlassCard>
                        </section>

                        {/* Documents Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-violet-500 text-white">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Documents</h2>
                            </div>
                            <div className="space-y-3">
                                {scheme.required_documents?.map((doc: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] group hover:bg-white transition-all shadow-sm">
                                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-[var(--text-main)]">{typeof doc === 'string' ? doc : doc.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
