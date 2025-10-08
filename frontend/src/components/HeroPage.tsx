'use client'

import { Shield, Lock, Zap, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react'
import AnimatedButton from './AnimatedButton'

interface HeroPageProps {
  onGetStarted: () => void
}

export default function HeroPage({ onGetStarted }: HeroPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        {/* Logo & Nav */}
        <nav className="flex items-center justify-between mb-20 animate-slideInUp">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SecureChat AI</h1>
              <p className="text-xs text-gray-400">Intelligent Messaging</p>
            </div>
          </div>
          <AnimatedButton variant="ghost" onClick={onGetStarted}>
            Sign In
          </AnimatedButton>
        </nav>

        {/* Main Hero Content */}
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI-Powered Security</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold mb-6">
            Secure Messaging
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Experience next-generation encrypted messaging with real-time AI threat detection, 
            fuzzy logic filtering, and military-grade security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <AnimatedButton
              variant="primary"
              icon={<ArrowRight />}
              onClick={onGetStarted}
              className="text-lg px-8 py-4"
            >
              Get Started Free
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              className="text-lg px-8 py-4"
            >
              View Demo
            </AnimatedButton>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/50">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-400">AES-256 + RSA-2048 hybrid encryption ensures your messages stay private</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Threat Detection</h3>
              <p className="text-gray-400">Advanced ML models detect spam and toxic content in real-time</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Messaging</h3>
              <p className="text-gray-400">WebSocket-powered instant communication with zero delays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-slideInUp" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-gray-400">AI Accuracy</div>
            </div>
            <div className="animate-slideInUp" style={{ animationDelay: '0.7s' }}>
              <div className="text-4xl font-bold text-blue-400 mb-2">&lt;35ms</div>
              <div className="text-gray-400">Processing Time</div>
            </div>
            <div className="animate-slideInUp" style={{ animationDelay: '0.8s' }}>
              <div className="text-4xl font-bold text-green-400 mb-2">AES-256</div>
              <div className="text-gray-400">Encryption</div>
            </div>
            <div className="animate-slideInUp" style={{ animationDelay: '0.9s' }}>
              <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-400">Protection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose SecureChat AI?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Gradient Boosting AI Classifier',
              'Fuzzy Logic Decision Engine',
              'JWT Authentication System',
              'Real-time WebSocket Communication',
              'Spam & Toxicity Detection',
              'Message Status Indicators',
              'User Search & Discovery',
              'Responsive Mobile Design'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
