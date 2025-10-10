'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  icon?: ReactNode
  children: ReactNode
  loading?: boolean
}

export default function AnimatedButton({
  variant = 'primary',
  icon,
  children,
  loading = false,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/50',
    secondary: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/50',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/50',
    ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
  }

  return (
    <button
      className={`
        relative overflow-hidden
        px-6 py-3 rounded-xl font-semibold
        transition-all duration-200
        hover:opacity-90 hover:shadow-lg
        active:animate-buttonPress
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      disabled={loading}
      {...props}
    >

      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : icon}
        {children}
      </span>
    </button>
  )
}
