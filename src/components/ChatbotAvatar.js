import React, { useRef, useEffect, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const avatarRef = useRef(null);
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

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



  return (
    <div 
      className="avatar-container"
      ref={avatarRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ '--accent-color': config.accentColor, '--bg-color': config.bgColor }}
    >
      <div className={`avatar-wrapper ${isHovering ? 'hovering' : ''} ${isSpeaking ? 'speaking' : ''}`}>
        {/* Animated video */}
        <video
          ref={videoRef}
          className="avatar-video"
          autoPlay
          loop
          muted
          style={{ borderColor: config.accentColor }}
        >
          <source src={`${process.env.PUBLIC_URL}/videos/chatbot-avatar.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

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
