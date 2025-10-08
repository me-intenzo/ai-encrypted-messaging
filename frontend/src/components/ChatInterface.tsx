'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Sparkles, X } from 'lucide-react'
import { api } from '@/lib/api'
import AIVisualization from './AIVisualization'
import MessageBubble from './MessageBubble'
import AnimatedButton from './AnimatedButton'
import { NetworkSVG } from './SVGBackgrounds'

interface User {
  id: string
  username: string
}

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  status: 'allowed' | 'flagged' | 'blocked'
  created_at: string
  sender_username?: string
  ai_score?: number
  fuzzy_score?: number
  fuzzy_details?: string
  ai_analysis?: {
    spam_probability: number
    toxicity_probability: number
    confidence: number
    classification: string
  }
}

interface ChatInterfaceProps {
  currentUserId: string
  currentUsername: string
  chatPartnerId: string
  chatPartnerUsername: string
  onNewMessage?: () => void
  onLogout?: () => void
  onBack?: () => void
}

export default function ChatInterface({ 
  currentUserId, 
  currentUsername, 
  chatPartnerId, 
  chatPartnerUsername,
  onNewMessage,
  onLogout,
  onBack 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (chatPartnerId) {
      loadMessages()
      connectWebSocket()
    }
    
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      ws?.close()
      window.removeEventListener('resize', checkMobile)
    }
  }, [chatPartnerId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8000/api/messages/ws/${currentUserId}`
    const websocket = new WebSocket(wsUrl)
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
  setMessages(prev => [...(Array.isArray(prev) ? prev : []), message])
    }
    
    setWs(websocket)
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/messages/chat/${chatPartnerId}?user_id=${currentUserId}`)
      const data = await response.json()
  setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load messages')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    setLoading(true)
    const messageContent = newMessage
    setNewMessage('')
    
    // Add temporary message with AI processing indicator
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: messageContent,
      sender_id: currentUserId,
      receiver_id: chatPartnerId,
      status: 'allowed',
      created_at: new Date().toISOString(),
      sender_username: currentUsername,
      ai_analysis: undefined
    }
  setMessages(prev => [...(Array.isArray(prev) ? prev : []), tempMessage])
    
    try {
      const response = await fetch('http://localhost:8000/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          recipient_id: chatPartnerId,
          content: messageContent
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Remove temp message and add real message with AI analysis
  setMessages(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== tempMessage.id))
        loadMessages()
        onNewMessage?.()
      }
    } catch (err) {
      console.error('Failed to send message')
      // Remove temp message on error
  setMessages(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setLoading(false)
    }
  }





  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      {/* Chat Section */}
      <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col min-w-0`}>
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-300"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/50">
            {chatPartnerUsername?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              @{chatPartnerUsername || 'User'}
              <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce-slow" />
            </h2>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Online</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
  {(Array.isArray(messages) ? messages : []).map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isSent={message.sender_id === currentUserId}
            status={message.status}
            timestamp={message.created_at}
            senderName={message.sender_id === currentUserId ? 'You' : chatPartnerUsername}
            aiAnalysis={message.ai_analysis}
            fuzzyScore={message.fuzzy_score}
          />

        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-4 animate-slideInUp">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              ${loading || !newMessage.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-110 shadow-lg shadow-blue-500/50'
              }
            `}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
      </div>
      
      {/* AI Visualization Section */}
      {!isMobile && (
        <div className="w-96 bg-slate-900/50 backdrop-blur-xl border-l border-slate-700 animate-slideInRight">
          <AIVisualization isActive={true} />
        </div>
      )}
    </div>
  )
}