'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Star, Zap, ShieldCheck } from 'lucide-react'

interface Milestone {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed'
    created_at: string | Date
}

interface DynamicMilestonesProps {
    milestones: Milestone[]
    className?: string
}

const statusTheme = {
    completed: {
        color: 'emerald',
        icon: ShieldCheck,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
    },
    in_progress: {
        color: 'sky',
        icon: Zap,
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        text: 'text-sky-400',
        glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]'
    },
    pending: {
        color: 'slate',
        icon: Circle,
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-gray-500',
        glow: ''
    }
}

export default function DynamicMilestones({ milestones, className = '' }: DynamicMilestonesProps) {
    const sortedMilestones = useMemo(() => {
        return [...milestones].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
    }, [milestones])

    const completedCount = milestones.filter(m => m.status === 'completed').length
    const progressPercentage = milestones.length > 0 
        ? (completedCount / milestones.length) * 100 
        : 0

    return (
        <div className={`relative ${className}`}>
            {/* Header / Summary */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        Project Journey
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Tracking real-time progress and milestones
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                        {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                        Efficiency
                    </div>
                </div>
            </div>

            <div className="relative pl-12 pr-4 space-y-12">
                {/* Connecting Line */}
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-white/5 overflow-hidden">
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${progressPercentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="w-full bg-gradient-to-b from-sky-400 via-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    />
                </div>

                <AnimatePresence mode="popLayout">
                    {sortedMilestones.map((milestone, index) => {
                        const theme = statusTheme[milestone.status]
                        const Icon = theme.icon
                        const isLast = index === sortedMilestones.length - 1

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex flex-col group"
                            >
                                {/* Node */}
                                <div className="absolute -left-[38px] top-0 z-20">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center
                                            ${theme.bg} ${theme.border} border-2 backdrop-blur-md
                                            ${theme.glow} transition-all duration-500
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 ${theme.text}`} />
                                        
                                        {milestone.status === 'in_progress' && (
                                            <motion.div 
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-sky-500/20 rounded-xl"
                                            />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Content Card */}
                                <motion.div
                                    whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.04)' }}
                                    className={`
                                        p-5 rounded-3xl border border-white/5 bg-white/[0.02]
                                        backdrop-blur-sm transition-all duration-300
                                        ${milestone.status === 'in_progress' ? 'border-sky-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : ''}
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className={`text-lg font-bold ${milestone.status === 'pending' ? 'text-gray-500' : 'text-white'}`}>
                                            {milestone.title}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-black ${theme.bg} ${theme.text} border ${theme.border}`}>
                                            {milestone.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    {milestone.description && (
                                        <p className="text-sm text-gray-400 line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                                            {milestone.description}
                                        </p>
                                    )}
                                    
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            {new Date(milestone.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1,2].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-500 to-gray-700" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {sortedMilestones.length === 0 && (
                    <div className="py-12 text-center text-gray-500 italic">
                        No milestones logged for this project transition.
                    </div>
                )}
            </div>

            {/* Background Decorative */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10 rounded-full" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] -z-10 rounded-full" />
        </div>
    )
}
