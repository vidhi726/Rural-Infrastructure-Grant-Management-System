'use client'

import { HTMLMotionProps, motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode
    className?: string
    hover?: boolean
    delay?: number
    glowColor?: 'blue' | 'green' | 'amber' | 'none'
}

export default function GlassCard({
    children,
    className = '',
    hover = true,
    delay = 0,
    glowColor = 'none',
    ...props
}: GlassCardProps) {
    const glowClasses = {
        blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
        green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
        amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
        none: ''
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            whileHover={hover ? {
                y: -5,
                transition: { duration: 0.3 }
            } : undefined}
            className={`
        relative overflow-hidden
        bg-[var(--card-bg)] backdrop-blur-xl
        border border-[var(--card-border)]
        rounded-[2rem]
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        transition-all duration-300
        ${hover ? 'hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]' : ''}
        ${glowClasses[glowColor]}
        ${className}
      `}
            {...props}
        >
            {/* Soft accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[40px] -mr-16 -mt-16 rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -ml-16 -mb-16 rounded-full" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
