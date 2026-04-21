'use client'

import { useState, useEffect } from 'react'
import { motion, animate, useMotionValue } from 'framer-motion'

interface ProgressRingProps {
    progress: number
    size?: number
    strokeWidth?: number
    color?: string
    bgColor?: string
    showLabel?: boolean
    label?: string
}

export default function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    bgColor = 'rgba(255, 255, 255, 0.1)',
    showLabel = true,
    label
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference
    const motionValue = useMotionValue(0)
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const controls = animate(motionValue, progress, {
            duration: 3,
            ease: 'easeInOut',
            onUpdate: (latest) => setDisplayValue(Math.round(latest))
        })
        return () => controls.stop()
    }, [progress, motionValue])

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    style={{
                        strokeDasharray: circumference,
                        filter: `drop-shadow(0 0 8px ${color})`
                    }}
                />
            </svg>

            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-4xl font-bold text-[var(--text-main)]"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {displayValue}%
                    </motion.span>
                    {label && (
                        <span className="text-sm text-[var(--text-muted)] mt-1 font-medium">{label}</span>
                    )}
                </div>
            )}
        </div>
    )
}
