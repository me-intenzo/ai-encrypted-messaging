'use client'

import { CheckCircle, AlertTriangle, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface MessageBubbleProps {
  content: string
  isSent: boolean
  status: 'allowed' | 'flagged' | 'blocked'
  timestamp: string
  senderName: string
  aiAnalysis?: {
    spam_probability: number
    toxicity_probability: number
    confidence: number
    classification: string
  }
  fuzzyScore?: number
}

export default function MessageBubble({
  content,
  isSent,
  status,
  timestamp,
  senderName,
  aiAnalysis,
  fuzzyScore
}: MessageBubbleProps) {
  const [showDetails, setShowDetails] = useState(false)

  const statusConfig = {
    allowed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      textColor: 'text-green-400'
    },
    flagged: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-400'
    },
    blocked: {
      icon: <Shield className="w-4 h-4" />,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      textColor: 'text-red-400'
    }
  }

  const config = statusConfig[status]

  return (
    <div
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4 animate-slideInUp`}
      style={{ animationDelay: '0.1s' }}
    >
      <div className={`max-w-[70%] ${isSent ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender Name */}
        <div className={`flex items-center gap-2 px-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-semibold text-white/70">{senderName}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bgColor} ${config.borderColor} border`}>
            {config.icon}
            <span className={config.textColor}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        {/* Message Bubble */}
        <div
          className={`
            relative group
            px-4 py-3 rounded-2xl
            backdrop-blur-xl border
            transition-all duration-300
            hover:scale-[1.02] hover:shadow-2xl
            ${isSent
              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90 border-indigo-400/30 rounded-tr-sm'
              : 'bg-gray-900/90 border-gray-700/50 rounded-tl-sm'
            }
          `}
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r ${config.color}`} />
          
          {/* Content */}
          <div className="relative z-10">
            <p className="text-white text-sm leading-relaxed break-words">
              {content}
            </p>

            {/* Timestamp */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <span className="text-xs text-white/50">
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {aiAnalysis && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </button>
              )}
            </div>

            {/* AI Analysis Details */}
            {showDetails && aiAnalysis && (
              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-purple-500/30 animate-slideInUp">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">AI Analysis</span>
                  <span className={`
                    ml-auto px-2 py-0.5 rounded-full text-xs font-bold
                    ${aiAnalysis.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                      aiAnalysis.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'}
                  `}>
                    {Math.round(aiAnalysis.confidence * 100)}% Confident
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spam:</span>
                    <span className="text-white font-semibold">{Math.round(aiAnalysis.spam_probability * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Toxic:</span>
                    <span className="text-white font-semibold">{Math.round(aiAnalysis.toxicity_probability * 100)}%</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-cyan-400 font-semibold">{aiAnalysis.classification}</span>
                  </div>
                  {fuzzyScore !== undefined && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Fuzzy Score:</span>
                      <span className="text-blue-400 font-semibold">{fuzzyScore.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
