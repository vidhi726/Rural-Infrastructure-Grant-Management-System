'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    MapPin,
    Calendar,
    IndianRupee,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react'
import ProgressRing from '../ui/ProgressRing'

interface Project {
    id: string
    applicationNumber: string
    title: string
    village: string
    district: string
    category: string
    approvedAmount: number
    completionPercentage: number
    status: string
    expectedCompletionDate: string
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    completed: { color: '#22c55e', icon: CheckCircle2, label: 'Completed' },
    in_progress: { color: '#3b82f6', icon: Clock, label: 'In Progress' },
    approved: { color: '#f59e0b', icon: AlertCircle, label: 'Approved' },
}

const categoryColors: Record<string, string> = {
    roads: '#f59e0b',
    water: '#06b6d4',
    education: '#8b5cf6',
    power: '#eab308',
    agriculture: '#22c55e',
    healthcare: '#ec4899',
}

interface ProjectCardProps {
    project: Project
    index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    const statusInfo = statusConfig[project.status] || statusConfig.in_progress
    const StatusIcon = statusInfo.icon
    const categoryColor = categoryColors[project.category] || '#3b82f6'

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
        >
            {/* Category indicator bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: categoryColor }}
            />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="px-2 py-1 text-xs font-medium rounded-full capitalize"
                                style={{
                                    backgroundColor: `${categoryColor}20`,
                                    color: categoryColor
                                }}
                            >
                                {project.category}
                            </span>
                            <span className="text-xs text-gray-500">
                                {project.applicationNumber}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {project.title}
                        </h3>
                    </div>

                    <ProgressRing
                        progress={project.completionPercentage}
                        size={70}
                        strokeWidth={6}
                        color={statusInfo.color}
                    />
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{project.village}, {project.district}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <IndianRupee className="w-3 h-3" />
                            Approved
                        </div>
                        <div className="text-lg font-bold text-green-400">
                            ₹{(project.approvedAmount / 100000).toFixed(1)}L
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                            <Calendar className="w-3 h-3" />
                            Expected
                        </div>
                        <div className="text-sm font-medium text-white">
                            {new Date(project.expectedCompletionDate).toLocaleDateString('en-IN', {
                                month: 'short',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: `${statusInfo.color}15`,
                            color: statusInfo.color
                        }}
                    >
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                    </div>

                    <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors group/link"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
