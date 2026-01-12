import React, { useRef, useEffect, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const avatarRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Track mouse position for interactive eyes
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!avatarRef.current) return;
      
      const rect = avatarRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      
      // Limit the movement angle
      const angle = Math.atan2(y, x);
      const distance = Math.min(15, Math.sqrt(x * x + y * y) / 20);
      
      setMousePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const emotionConfig = {
    neutral: {
      bgColor: '#1a2a3a',
      accentColor: '#00d4ff',
      eyeExpression: 'neutral',
      description: 'Ready to help!'
    },
    happy: {
      bgColor: '#1a3a2a',
      accentColor: '#00ffcc',
      eyeExpression: 'happy',
      description: 'Happy to help!'
    },
    excited: {
      bgColor: '#3a2a1a',
      accentColor: '#ffaa00',
      eyeExpression: 'excited',
      description: 'Excited!'
    },
    sad: {
      bgColor: '#2a1a3a',
      accentColor: '#6a7cff',
      eyeExpression: 'sad',
      description: 'Sorry about that...'
    },
    thinking: {
      bgColor: '#2a2a3a',
      accentColor: '#bb88ff',
      eyeExpression: 'thinking',
      description: 'Let me think...'
    }
  };

  const config = emotionConfig[emotion] || emotionConfig.neutral;

  // Eye rendering based on emotion
  const renderEyes = () => {
    const baseX = mousePos.x;
    const baseY = mousePos.y;

    switch (config.eyeExpression) {
      case 'happy':
        return (
          <>
            <circle cx={-25} cy={-15} r={16} fill={config.accentColor} opacity="0.8" />
            <circle cx={25} cy={-15} r={16} fill={config.accentColor} opacity="0.8" />
            {/* Happy eyes (curved) */}
            <path d="M -35 -15 Q -25 -5 -15 -15" stroke={config.bgColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 15 -15 Q 25 -5 35 -15" stroke={config.bgColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      
      case 'excited':
        return (
          <>
            <circle cx={-25 + baseX} cy={-15 + baseY} r={18} fill={config.accentColor} />
            <circle cx={25 + baseX} cy={-15 + baseY} r={18} fill={config.accentColor} />
            <circle cx={-25 + baseX} cy={-15 + baseY} r={8} fill={config.bgColor} />
            <circle cx={25 + baseX} cy={-15 + baseY} r={8} fill={config.bgColor} />
          </>
        );
      
      case 'sad':
        return (
          <>
            <circle cx={-25} cy={-15} r={16} fill={config.accentColor} opacity="0.6" />
            <circle cx={25} cy={-15} r={16} fill={config.accentColor} opacity="0.6" />
            {/* Sad eyes (curved down) */}
            <path d="M -35 -15 Q -25 -25 -15 -15" stroke={config.bgColor} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 15 -15 Q 25 -25 35 -15" stroke={config.bgColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      
      case 'thinking':
        return (
          <>
            <circle cx={-25} cy={-15} r={14} fill={config.accentColor} opacity="0.7" />
            <circle cx={25} cy={-15} r={14} fill={config.accentColor} opacity="0.7" />
            <circle cx={-25} cy={-15} r={5} fill={config.bgColor} />
            <circle cx={25} cy={-15} r={5} fill={config.bgColor} />
            {/* Thinking dots */}
            <circle cx={50} cy={-40} r="3" fill={config.accentColor} opacity="0.6" />
            <circle cx={60} cy={-50} r="3" fill={config.accentColor} opacity="0.4" />
            <circle cx={70} cy={-45} r="3" fill={config.accentColor} opacity="0.2" />
          </>
        );
      
      default: // neutral
        return (
          <>
            <circle cx={-25 + baseX} cy={-15 + baseY} r={14} fill={config.accentColor} />
            <circle cx={25 + baseX} cy={-15 + baseY} r={14} fill={config.accentColor} />
            {/* Pupils */}
            <circle cx={-25 + baseX} cy={-15 + baseY} r={6} fill={config.bgColor} />
            <circle cx={25 + baseX} cy={-15 + baseY} r={6} fill={config.bgColor} />
          </>
        );
    }
  };

  // Mouth rendering
  const renderMouth = () => {
    if (isSpeaking) {
      return (
        <>
          <ellipse cx="0" cy="25" rx="25" ry="20" fill={config.accentColor} opacity="0.4" />
          <path d="M -20 15 Q 0 40 20 15" stroke={config.accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
    }

    switch (emotion) {
      case 'happy':
        return <path d="M -15 20 Q 0 30 15 20" stroke={config.accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      case 'excited':
        return <path d="M -20 15 Q 0 35 20 15" stroke={config.accentColor} strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'sad':
        return <path d="M -15 30 Q 0 15 15 30" stroke={config.accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
      default:
        return <line x1="-12" y1="22" x2="12" y2="22" stroke={config.accentColor} strokeWidth="2" strokeLinecap="round" />;
    }
  };

  return (
    <div 
      className="avatar-container"
      ref={avatarRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ '--accent-color': config.accentColor, '--bg-color': config.bgColor }}
    >
      <div className={`avatar-wrapper ${isHovering ? 'hovering' : ''} ${isSpeaking ? 'speaking' : ''}`}>
        {/* Main avatar SVG */}
        <svg className="avatar-svg" viewBox="-100 -100 200 200" width="200" height="200">
          {/* Background glow */}
          <defs>
            <filter id={`glow-${emotion}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="avatarGradient">
              <stop offset="0%" stopColor={config.accentColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={config.accentColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer glow circle */}
          <circle cx="0" cy="0" r="95" fill="url(#avatarGradient)" />

          {/* Main head */}
          <circle cx="0" cy="0" r="70" fill={config.bgColor} stroke={config.accentColor} strokeWidth="2" filter={`url(#glow-${emotion})`} />

          {/* Accent ring */}
          <circle cx="0" cy="0" r="70" fill="none" stroke={config.accentColor} strokeWidth="1" opacity="0.4" />

          {/* Eyes */}
          <g className="eyes">
            {renderEyes()}
          </g>

          {/* Mouth */}
          <g className="mouth">
            {renderMouth()}
          </g>

          {/* Optional: Bottom accent bar for speaking */}
          {isSpeaking && (
            <rect x="-50" y="75" width="100" height="4" rx="2" fill={config.accentColor} opacity="0.6" />
          )}
        </svg>

        {/* Status text */}
        <div className="avatar-status" style={{ color: config.accentColor }}>
          {config.description}
        </div>

        {/* Interaction pulse (shows on hover) */}
        {isHovering && <div className="interaction-pulse" style={{ borderColor: config.accentColor }} />}
      </div>

      {/* Placeholder for video - will be added later */}
      <div className="video-placeholder" style={{ borderColor: config.accentColor }}>
        <p>Video Animation</p>
        <p style={{ fontSize: '12px', opacity: 0.6 }}>Coming soon...</p>
      </div>
    </div>
  );
};

export default ChatbotAvatar;
