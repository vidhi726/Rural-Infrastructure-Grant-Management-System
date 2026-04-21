'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    icon?: ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
    className?: string
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    onClick,
    type = 'button',
    className = ''
}: ButtonProps) {
    const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
  `

    const variants = {
        primary: `
      bg-gradient-to-r from-sky-600 to-indigo-600
      hover:from-sky-500 hover:to-indigo-500
      text-white
      shadow-lg shadow-sky-500/20
      hover:shadow-sky-500/40
      hover:-translate-y-0.5
    `,
        secondary: `
      bg-sky-50 border border-sky-100
      text-sky-700
      hover:bg-sky-100 hover:border-sky-200
      hover:-translate-y-0.5
    `,
        success: `
      bg-gradient-to-r from-green-600 to-green-500
      hover:from-green-500 hover:to-green-400
      text-white
      hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)]
      hover:-translate-y-0.5
    `,
        danger: `
      bg-gradient-to-r from-red-600 to-red-500
      hover:from-red-500 hover:to-red-400
      text-white
      hover:shadow-[0_10px_30px_rgba(239,68,68,0.4)]
      hover:-translate-y-0.5
    `,
        ghost: `
      bg-transparent
      text-slate-600 hover:text-sky-600
      hover:bg-sky-50
    `
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    }

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileTap={{ scale: 0.98 }}
            suppressHydrationWarning
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                whileHover={{ translateX: '100%' }}
                transition={{ duration: 0.6 }}
            />

            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : icon ? (
                icon
            ) : null}

            <span className="relative z-10">{children}</span>
        </motion.button>
    )
}
