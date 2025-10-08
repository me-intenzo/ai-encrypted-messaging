'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, LogOut, Settings, Plus, Shield, Sparkles, Zap, Menu } from 'lucide-react'
import AuthForm from '@/components/AuthForm'
import ChatInterface from '@/components/ChatInterface'
import UserSearchModal from '@/components/UserSearchModal'
import HeroPage from '@/components/HeroPage'
import SettingsPage from '@/components/SettingsPage'
import AIVisualization from '@/components/AIVisualization'
import { ParticlesSVG, ShieldSVG } from '@/components/SVGBackgrounds'
import AnimatedButton from '@/components/AnimatedButton'
import { authManager } from '@/lib/auth'

export default function Home() {
  const [user, setUser] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chats, setChats] = useState<{id: string, username: string, lastMessage?: string}[]>([])
  const [chatPartnerUsername, setChatPartnerUsername] = useState<string>('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHero, setShowHero] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const getUsernameById = async (userId: string): Promise<string> => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/user-by-id/${userId}`)
      const data = await response.json()
      return data.success ? data.user.username : userId
    } catch (error) {
      return userId
    }
  }

  const loadChats = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/messages/chats?user_id=${userId}`)
      const data = await response.json()
      const chatArray = Array.isArray(data) ? data : [];
      const chatObjects = await Promise.all(
        chatArray.map(async (chatId: string) => {
          const username = await getUsernameById(chatId)
          return {
            id: chatId,
            username: username,
            lastMessage: 'Click to start chatting...'
          }
        })
      )
      setChats(chatObjects)
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  const handleAuthSuccess = (userId: string, email?: string, userUsername?: string) => {
    setUser(userId)
    setUsername(userUsername || null)
    loadChats(userId)
  }
  
  // Auto-login and responsive check
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const tokens = await authManager.autoLogin()
        if (tokens) {
          setUser(tokens.user_id)
          setUsername(tokens.username)
          loadChats(tokens.user_id)
        }
      } catch (error) {
        console.error('Auto-login failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    tryAutoLogin()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    authManager.logout()
    setUser(null)
    setUsername(null)
    setSelectedChat(null)
    setChats([])
    setChatPartnerUsername('')
  }

  const handleSelectUser = (userId: string, userUsername: string) => {
    const newChat = { id: userId, username: userUsername }
    
    setSelectedChat(userId)
    setChatPartnerUsername(userUsername)
    
    setChats(prev => {
      const exists = prev.find(chat => chat.id === userId)
      if (!exists) {
        return [...prev, newChat]
      }
      return prev
    })
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <ParticlesSVG />
        <div className="text-center z-10 animate-scaleIn">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading SecureChat AI</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    if (showHero) {
      return <HeroPage onGetStarted={() => setShowHero(false)} />
    }
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <ParticlesSVG />
      
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="fixed top-4 left-4 z-50 p-3 bg-gray-900/80 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-gray-800/80 transition-all animate-scaleIn"
        >
          <Menu size={24} />
        </button>
      )}
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ease-out' : 'relative'}
        ${isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'w-80' : 'w-80 lg:w-96'}
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 flex flex-col
        ${!isMobile && 'page-transition'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-purple-500/50">
                {username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  @{username || 'user'}
                </h2>
                <p className="text-sm text-white/70 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white transition-all duration-300"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-xl mb-4">
            <Shield size={20} className="text-purple-400" />
            <span className="text-white font-semibold text-base">
              SecureChat AI
            </span>
          </div>

          {/* New Chat Button */}
          <AnimatedButton
            variant="secondary"
            icon={<Plus size={20} />}
            onClick={() => setShowSearchModal(true)}
            className="w-full"
          >
            New Chat
          </AnimatedButton>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          {chats.length === 0 ? (
            <div className="text-center py-12 px-4 text-white/70">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-lg shadow-purple-500/50">
                <MessageCircle size={32} className="text-white" />
              </div>
              <p className="text-base font-semibold text-white mb-2">
                No conversations yet
              </p>
              <p className="text-sm">
                Start a secure chat with someone
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {chats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id)
                    setChatPartnerUsername(chat.username)
                    if (isMobile) setShowMobileSidebar(false)
                  }}
                  className={`
                    w-full p-4 text-left rounded-xl border transition-smooth
                    hover:scale-[1.02] hover:shadow-lg
                    ${selectedChat === chat.id
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-purple-500/20'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {chat.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-1 flex items-center gap-2">
                        @{chat.username}
                        <Zap size={14} className="text-yellow-400 animate-bounce-slow" />
                      </div>
                      <div className="text-sm opacity-80 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex relative z-10 min-w-0 page-transition">
        {selectedChat ? (
          <ChatInterface 
            currentUserId={user} 
            currentUsername={username || ''}
            chatPartnerId={selectedChat} 
            chatPartnerUsername={chatPartnerUsername}
            onNewMessage={() => loadChats(user)}
            onLogout={handleLogout}
          />
        ) : (
          <div className="flex w-full">
            {/* Welcome Section */}
            <div className="flex-1 flex items-center justify-center bg-slate-900/50 backdrop-blur-xl page-transition">
              <div className="text-center p-8">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float shadow-2xl shadow-purple-500/50">
                  <MessageCircle size={64} className="text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  Welcome to AI SecureChat
                  <Sparkles size={32} className="text-purple-400 animate-bounce-slow" />
                </h2>
                <p className="text-lg text-white/70 mb-8">
                  Select a conversation to start secure messaging
                </p>
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <Shield size={16} className="animate-pulse" />
                    End-to-End Encrypted
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Zap size={16} className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                    AI-Protected
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles size={16} className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                    Secure
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Visualization Section */}
            {!isMobile && (
              <div className="w-96 bg-slate-900/50 backdrop-blur-xl border-l border-slate-700 page-transition">
                <AIVisualization isActive={false} />
              </div>
            )}
          </div>
        )}
      </div>
      
      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectUser={handleSelectUser}
        currentUsername={username || ''}
      />
      
      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        username={username || ''}
        userId={user || ''}
        onLogout={handleLogout}
      />
    </div>
  )
}