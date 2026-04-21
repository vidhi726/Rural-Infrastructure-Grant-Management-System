'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface StatCounterProps {
    value: number
    prefix?: string
    suffix?: string
    label: string
    duration?: number
    decimals?: number
}

export default function StatCounter({
    value,
    prefix = '',
    suffix = '',
    label,
    duration = 2,
    decimals = 0
}: StatCounterProps) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [isVisible])

    useEffect(() => {
        if (!isVisible) return

        let startTime: number
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentValue = easeOutQuart * value

            setCount(currentValue)

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrame)
    }, [isVisible, value, duration])

    const formattedValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.floor(count).toLocaleString()

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
        >
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-2">
                {prefix}{formattedValue}{suffix}
            </div>
            <div className="text-gray-400 text-sm md:text-base uppercase tracking-wider">
                {label}
            </div>
        </motion.div>
    )
}
