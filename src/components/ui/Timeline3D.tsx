'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface Milestone {
    id: string
    title: string
    percentage: number
    isCompleted: boolean
    isVerified: boolean
    date?: string
}

interface TimelineProps {
    milestones: Milestone[]
    currentProgress: number
}

export default function Timeline3D({ milestones, currentProgress }: TimelineProps) {
    return (
        <div className="relative py-8">
            {/* Main timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${currentProgress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-b from-blue-500 via-green-500 to-green-400"
                />
            </div>

            {/* Milestone nodes */}
            <div className="space-y-8">
                {milestones.map((milestone, index) => {
                    const isActive = currentProgress >= milestone.percentage
                    const isCurrent = currentProgress >= milestone.percentage && currentProgress < (milestones[index + 1]?.percentage || 101)

                    return (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative flex items-start gap-6"
                        >
                            {/* Node */}
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                                className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-500 ${milestone.isVerified
                                        ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                        : milestone.isCompleted
                                            ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                            : isCurrent
                                                ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                                                : 'bg-white/5 border-white/20'
                                    }`}
                            >
                                {milestone.isVerified ? (
                                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                                ) : milestone.isCompleted ? (
                                    <CheckCircle2 className="w-7 h-7 text-blue-400" />
                                ) : isCurrent ? (
                                    <Clock className="w-7 h-7 text-amber-400" />
                                ) : (
                                    <Circle className="w-7 h-7 text-gray-500" />
                                )}

                                {/* Percentage badge */}
                                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {milestone.percentage}%
                                </div>
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 pt-2">
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className={`p-4 rounded-xl border transition-all duration-300 ${isActive
                                            ? 'bg-white/5 border-white/10 hover:border-white/20'
                                            : 'bg-white/[0.02] border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className={`font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                            {milestone.title}
                                        </h4>
                                        {milestone.isVerified && (
                                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    {milestone.date && (
                                        <p className="text-sm text-gray-400">
                                            {milestone.date}
                                        </p>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
