'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Scene3D from '@/components/3d/Scene3D'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { 
    FileText, 
    Search, 
    Filter, 
    IndianRupee, 
    ArrowRight, 
    LayoutGrid,
    Droplets,
    Map,
    GraduationCap,
    Zap,
    Leaf,
    HeartPulse,
    Info
} from 'lucide-react'
import { getGrantSchemes } from '@/lib/db/actions'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const categories = [
    { id: 'all', label: 'All Categories', icon: LayoutGrid, color: '#94a3b8' },
    { id: 'roads', label: 'Roads & Transport', icon: Map, color: '#f59e0b' },
    { id: 'water', label: 'Water Supply', icon: Droplets, color: '#06b6d4' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: '#8b5cf6' },
    { id: 'power', label: 'Energy & Power', icon: Zap, color: '#eab308' },
    { id: 'agriculture', label: 'Agriculture', icon: Leaf, color: '#22c55e' },
    { id: 'healthcare', label: 'Healthcare', icon: HeartPulse, color: '#ec4899' },
]

export default function ProjectsPage() {
    const [schemes, setSchemes] = useState<any[]>([])
    const [filteredSchemes, setFilteredSchemes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    useEffect(() => {
        async function fetchSchemes() {
            try {
                const data = await getGrantSchemes(true)
                setSchemes(data)
                setFilteredSchemes(data)
            } catch (err) {
                console.error('Failed to fetch schemes:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchSchemes()
    }, [])

    useEffect(() => {
        const filtered = schemes.filter(scheme => {
            const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 scheme.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory
            return matchesSearch && matchesCategory
        })
        setFilteredSchemes(filtered)
    }, [searchTerm, activeCategory, schemes])

    return (
        <main className="min-h-screen bg-grid">
            <Scene3D />
            <Header />
            
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero / Search Section */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">Grant Schemes</span> <br className="md:hidden" />
                            <span className="text-[var(--text-main)]">&</span> 
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600"> Projects</span>
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto mb-12 text-lg">
                            Explore available rural infrastructure grant schemes and track ongoing development projects across the state.
                        </p>
                    </motion.div>

                    <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search schemes by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-xl shadow-blue-500/5"
                            />
                        </div>
                    </div>
                </div>

                {/* Categories Tab */}
                <div className="flex gap-3 mb-16 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        const isActive = activeCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-[1.25rem] font-semibold transition-all duration-500 whitespace-nowrap border shadow-sm ${
                                    isActive 
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30 translate-y-[-2px]' 
                                    : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-white hover:text-blue-600 border-[var(--card-border)] hover:shadow-lg hover:translate-y-[-2px]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                                {cat.label}
                            </button>
                        )
                    })}
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-72 rounded-3xl bg-[var(--card-border)] animate-pulse opacity-50" />
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredSchemes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredSchemes.map((scheme, index) => {
                                        const cat = categories.find(c => c.id === scheme.category) || categories[0]
                                        const CatIcon = cat.icon
                                        return (
                                            <motion.div
                                                key={scheme.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <GlassCard 
                                                    className="h-full flex flex-col group hover:translate-y-[-8px] transition-all duration-500 overflow-hidden border-[var(--card-border)] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
                                                    glowColor={cat.id === 'roads' ? 'amber' : cat.id === 'water' ? 'blue' : cat.id === 'agriculture' ? 'green' : 'none'}
                                                >
                                                    <div className="p-8 flex-1">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div 
                                                                className="p-4 rounded-2xl bg-blue-500/10 flex items-center justify-center transition-colors group-hover:bg-blue-500/20"
                                                                style={{ color: cat.color }}
                                                            >
                                                                <CatIcon className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Max Grant</span>
                                                                <span className="text-xl font-bold text-green-600">₹{(scheme.max_amount / 100000).toFixed(1)}L</span>
                                                            </div>
                                                        </div>

                                                        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3 group-hover:text-blue-600 transition-colors">
                                                            {scheme.name}
                                                        </h3>
                                                        <p className="text-[var(--text-muted)] text-sm line-clamp-3 mb-6 leading-relaxed">
                                                            {scheme.description || 'No detailed description available for this grant scheme.'}
                                                        </p>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                                <Info className="w-4 h-4 text-blue-500/60" />
                                                                <span>{scheme.required_documents?.length || 0} Required Documents</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {scheme.required_documents?.slice(0, 3).map((doc: any, i: number) => (
                                                                    <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/5 text-[10px] text-[var(--text-muted)] border border-blue-500/10">
                                                                        {typeof doc === 'string' ? doc : doc.name}
                                                                    </span>
                                                                ))}
                                                                {(scheme.required_documents?.length || 0) > 3 && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-500">+{(scheme.required_documents?.length || 0) - 3} more</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-8 pt-0 mt-auto">
                                                        <Link href={`/projects/scheme/${scheme.id}`} className="block w-full">
                                                            <Button 
                                                                variant="secondary" 
                                                                className="w-full justify-between items-center group/btn py-6 rounded-2xl bg-[var(--card-bg)] hover:bg-blue-600 hover:text-white border-[var(--card-border)] shadow-sm transition-all duration-300"
                                                            >
                                                                View Detailed Information
                                                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <GlassCard className="p-20 text-center border-[var(--card-border)]">
                                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-blue-500/50" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">No schemes found</h3>
                                <p className="text-[var(--text-muted)]">
                                    Try adjusting your search or category filters to find what you're looking for.
                                </p>
                            </GlassCard>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}
