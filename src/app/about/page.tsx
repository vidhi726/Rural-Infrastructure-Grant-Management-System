'use client'

import React from 'react'
import Header from '@/components/layout/Header'
import Scene3D from '@/components/3d/Scene3D'
import GlassCard from '@/components/ui/GlassCard'
import { Users } from 'lucide-react'

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-grid">
            <Scene3D />
            <Header />
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <GlassCard className="p-12">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">About RIGMS</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        The Rural Infrastructure Grant Management System (RIGMS) is a next-generation digital governance platform designed to ensure transparency, accountability, and efficiency in the distribution of funds for rural development.
                    </p>
                </GlassCard>
            </div>
        </main>
    )
}
