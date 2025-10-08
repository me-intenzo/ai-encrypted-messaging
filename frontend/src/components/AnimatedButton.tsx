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
        transform transition-all duration-300
        hover:scale-105 hover:-translate-y-1
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon}
        {children}
      </span>
    </button>
  )
}
