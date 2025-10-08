'use client'

export const MessageBubbleSVG = () => {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    cx: (i * 43 + 13) % 100,
    cy: (i * 67 + 29) % 100,
    r: 20 + (i * 7) % 60,
    delay: i * 0.5,
    duration: 8 + (i % 4)
  }))

  return (
    <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={`${b.cx}%`}
          cy={`${b.cy}%`}
          r={b.r}
          fill="url(#bubbleGrad)"
          className="animate-float"
          style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s` }}
        />
      ))}
    </svg>
  )
}

export const NetworkSVG = () => (
  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[...Array(8)].map((_, i) => (
      <line
        key={i}
        x1="0"
        y1={`${i * 12.5}%`}
        x2="100%"
        y2={`${i * 12.5}%`}
        stroke="url(#lineGrad)"
        strokeWidth="1"
        className="animate-shimmer"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </svg>
)

export const ShieldSVG = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      d="M100 20 L160 40 L160 100 Q160 160 100 180 Q40 160 40 100 L40 40 Z"
      fill="url(#shieldGrad)"
      filter="url(#glow)"
      className="animate-pulse-glow"
    />
    <path
      d="M80 100 L95 115 L120 85"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

export const LockSVG = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect x="60" y="90" width="80" height="70" rx="10" fill="url(#lockGrad)" />
    <path
      d="M70 90 V70 Q70 40 100 40 Q130 40 130 70 V90"
      stroke="url(#lockGrad)"
      strokeWidth="12"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="100" cy="125" r="8" fill="white" />
    <rect x="96" y="125" width="8" height="20" rx="4" fill="white" />
  </svg>
)

export const BrainSVG = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path
      d="M100 40 Q80 40 70 60 Q60 50 50 60 Q40 70 45 85 Q35 95 40 110 Q35 125 45 135 Q40 145 50 155 Q55 165 70 165 Q75 175 90 175 Q95 185 110 175 Q125 175 130 165 Q145 165 150 155 Q160 145 155 135 Q165 125 160 110 Q165 95 155 85 Q160 70 150 60 Q140 50 130 60 Q120 40 100 40 Z"
      fill="url(#brainGrad)"
      className="animate-pulse"
    />
    <circle cx="80" cy="90" r="4" fill="white" className="animate-pulse" />
    <circle cx="120" cy="90" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
    <circle cx="100" cy="110" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    <circle cx="85" cy="130" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
    <circle cx="115" cy="130" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
  </svg>
)

export const WaveSVG = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#764ba2" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#667eea" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
      fill="url(#waveGrad)"
    >
      <animate
        attributeName="d"
        dur="10s"
        repeatCount="indefinite"
        values="
          M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z;
          M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z;
          M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z
        "
      />
    </path>
  </svg>
)

export const ParticlesSVG = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    cx: (i * 37 + 23) % 100,
    cy: (i * 53 + 17) % 100,
    r: 2 + (i % 4),
    delay: i * 0.3,
    duration: 5 + (i % 5)
  }))

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="particleGrad">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0" />
        </radialGradient>
      </defs>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={`${p.cx}%`}
          cy={`${p.cy}%`}
          r={p.r}
          fill="url(#particleGrad)"
          className="animate-float"
          style={{
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </svg>
  )
}
