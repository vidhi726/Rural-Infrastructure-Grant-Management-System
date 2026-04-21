'use client'

import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ReactNode } from 'react'

interface AppLayoutProps {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
            {/* Sidebar remains fixed on the left */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                <TopBar />

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
