'use client'

import { CheckCircle, AlertTriangle, Shield, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

function FeedbackButton({ messageId }: { messageId: string }) {
  const [showPopup, setShowPopup] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)

  const submitFeedback = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        message_id: messageId,
        feedback_type: 'false_positive',
        user_id: localStorage.getItem('user_id') || 'anonymous'
      })
      
      const response = await fetch(`http://localhost:8000/api/messages/feedback?${params}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setShowPopup(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (error) {
      console.error('Feedback error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        title="Report false positive"
      >
        Not spam?
      </button>
      
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm mx-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Report False Positive</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-6">
              This will help improve our AI classification. Are you sure this message was incorrectly flagged?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slideInUp">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Feedback submitted successfully!</span>
          </div>
        </div>
      )}
    </>
  )
}

interface MessageBubbleProps {
  id: string
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
  id,
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
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4 animate-slideInUp`}>
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
            transition-all duration-200
            hover:shadow-lg active:scale-[0.98]
            ${isSent
              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-600/90 border-indigo-400/30 rounded-tr-sm'
              : 'bg-gray-900/90 border-gray-700/50 rounded-tl-sm'
            }
          `}
        >

          
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
              
              <div className="flex items-center gap-2">
                {aiAnalysis && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI
                  </button>
                )}
                {status === 'flagged' && (
                  <FeedbackButton messageId={id} />
                )}
              </div>
            </div>

            {/* AI Analysis Details */}
            {showDetails && aiAnalysis && (
              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-purple-500/30 animate-fadeIn">
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
