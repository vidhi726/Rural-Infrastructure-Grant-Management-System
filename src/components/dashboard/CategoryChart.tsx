'use client'

import { motion } from 'framer-motion'
import {
    Route,
    Droplets,
    GraduationCap,
    Zap,
    Wheat,
    Heart,
    TrendingUp,
    IndianRupee
} from 'lucide-react'

interface CategoryData {
    category: string
    count: number
    amount: number
    completed: number
}

const categoryConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    roads: { icon: Route, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    water: { icon: Droplets, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
    education: { icon: GraduationCap, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    power: { icon: Zap, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
    agriculture: { icon: Wheat, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    healthcare: { icon: Heart, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
}

interface CategoryChartProps {
    data: CategoryData[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
    const maxAmount = Math.max(...data.map(d => d.amount))

    return (
        <div className="space-y-4">
            {data.map((item, index) => {
                const config = categoryConfig[item.category] || categoryConfig.roads
                const Icon = config.icon
                const percentage = (item.amount / maxAmount) * 100

                return (
                    <motion.div
                        key={item.category}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            {/* Icon */}
                            <div
                                className="flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110"
                                style={{ backgroundColor: config.bgColor }}
                            >
                                <Icon className="w-6 h-6" style={{ color: config.color }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium capitalize">{item.category}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            {item.count} projects
                                        </span>
                                        <span className="flex items-center gap-1 text-green-400">
                                            {item.completed} completed
                                        </span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${percentage}%` }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                                        className="absolute inset-y-0 left-0 rounded-full"
                                        style={{
                                            backgroundColor: config.color,
                                            boxShadow: `0 0 10px ${config.color}50`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="text-right min-w-[120px]">
                                <div className="flex items-center justify-end gap-1 text-lg font-bold" style={{ color: config.color }}>
                                    <IndianRupee className="w-4 h-4" />
                                    {(item.amount / 100000).toFixed(1)}L
                                </div>
                                <div className="text-xs text-gray-500">allocated</div>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
