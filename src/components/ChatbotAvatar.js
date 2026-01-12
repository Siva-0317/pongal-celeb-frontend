import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const avatarRef = useRef(null);
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const emotionConfig = {
    neutral: {
      bgColor: '#1a2a3a',
      accentColor: '#00d4ff',
      description: 'Chatbot-க்கு Hi சொல்லியாச்சா 😄 பொங்கல் சாப்பிட்டாச்சா? 🌾'
    },
    happy: {
      bgColor: '#1a3a2a',
      accentColor: '#00ffcc',
      description: 'Happy to help!'
    },
    excited: {
      bgColor: '#3a2a1a',
      accentColor: '#ffaa00',
      description: 'Excited!'
    },
    thinking: {
      bgColor: '#2a2a3a',
      accentColor: '#bb88ff',
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
      style={{ '--accent-color': config.accentColor }}
    >
      {/* 🔹 TOP LOGOS */}
      <div className="frame-logos">
        <img
          src="https://i.ibb.co/d4KrJrxv/eec-logo-finalized-1536x516-1.png"
          alt="Easwari Engineering College"
          className="frame-logo left"
        />
        <img
          src="https://i.ibb.co/wFFkzGVR/ACE.png"
          alt="ACE"
          className="frame-logo right"
        />
      </div>

      <div className={`avatar-wrapper ${isHovering ? 'hovering' : ''} ${isSpeaking ? 'speaking' : ''}`}>
        {/* Avatar Video */}
        <div className="avatar-video-wrapper">
          <video
            ref={videoRef}
            className="avatar-video"
            autoPlay
            loop
            muted
          >
            <source
              src={`${process.env.PUBLIC_URL}/videos/pongal-chatbot.mp4`}
              type="video/mp4"
            />
          </video>

          {/* Perfect pulse */}
          {isHovering && <div className="interaction-pulse" />}
        </div>

        {/* Status */}
        <div className="avatar-status" style={{ color: config.accentColor }}>
          {config.description}
        </div>
      </div>
    </div>
  );
};

export default ChatbotAvatar;
