'use client'

interface ProgressIndicatorProps {
  isVisible: boolean
  message?: string
}

export default function ProgressIndicator({ isVisible, message = "Processing..." }: ProgressIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-4 shadow-2xl border border-slate-700">
        <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}