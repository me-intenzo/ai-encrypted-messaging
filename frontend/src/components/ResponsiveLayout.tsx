'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

interface ResponsiveLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  aiPanel?: ReactNode
}

export default function ResponsiveLayout({ sidebar, main, aiPanel }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold">AI SecureChat</h1>
          <div className="w-10" />
        </div>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowSidebar(false)}
          >
            <div
              className="w-80 h-full bg-gray-900/95 backdrop-blur-xl animate-slideInLeft"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebar}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {main}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Desktop Sidebar */}
      <div className="w-80 animate-slideInLeft">
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="flex-1 animate-fadeIn">
        {main}
      </div>

      {/* AI Panel */}
      {aiPanel && (
        <div className="w-96 animate-slideInRight">
          {aiPanel}
        </div>
      )}
    </div>
  )
}
