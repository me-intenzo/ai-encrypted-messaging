'use client'

import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-500', border: 'border-green-600' },
    error: { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-600' },
    info: { icon: Info, bg: 'bg-blue-500', border: 'border-blue-600' }
  }

  const { icon: Icon, bg, border } = config[type]

  return (
    <div className={`fixed top-4 right-4 z-50 ${bg} border ${border} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] animate-slideInRight`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
