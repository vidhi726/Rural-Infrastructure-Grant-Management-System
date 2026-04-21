'use client'

import { motion } from 'framer-motion'
import { MapPin, Users, IndianRupee, TrendingUp } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import ProgressRing from '../ui/ProgressRing'

interface VillageGrant {
    id: string
    name: string
    district: string
    grantCount: number
    totalApproved: number
    avgCompletion: number
}

interface VillageGridProps {
    villages: VillageGrant[]
}

export default function VillageGrid({ villages }: VillageGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villages.map((village, index) => (
                <GlassCard
                    key={village.id}
                    delay={index * 0.1}
                    className="p-6"
                    glowColor="blue"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                                {village.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                <MapPin className="w-4 h-4" />
                                {village.district}
                            </div>
                        </div>

                        <ProgressRing
                            progress={village.avgCompletion}
                            size={60}
                            strokeWidth={5}
                            color={village.avgCompletion >= 75 ? '#22c55e' : village.avgCompletion >= 50 ? '#3b82f6' : '#f59e0b'}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-3 rounded-xl bg-white/5"
                        >
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <TrendingUp className="w-4 h-4" />
                                Projects
                            </div>
                            <div className="text-2xl font-bold text-blue-400">
                                {village.grantCount}
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-3 rounded-xl bg-white/5"
                        >
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                <IndianRupee className="w-4 h-4" />
                                Funds
                            </div>
                            <div className="text-2xl font-bold text-green-400">
                                {(village.totalApproved / 100000).toFixed(1)}L
                            </div>
                        </motion.div>
                    </div>
                </GlassCard>
            ))}
        </div>
    )
}
