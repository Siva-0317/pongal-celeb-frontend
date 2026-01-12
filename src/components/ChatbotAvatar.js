import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral' }) => {
  const avatarRef = useRef(null);
  const videoRef = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [botText, setBotText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const emotionConfig = {
    neutral: {
      bgColor: '#1a2a3a',
      accentColor: '#00d4ff',
      description: '🎤 பேசுங்க… Pongal Bot கேட்குது 🌾'
    }
  };

  const config = emotionConfig.neutral;

  /* 🎤 MIC → TEXT */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    setListening(true);

    recognition.start();

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setUserText(spokenText);
      setListening(false);

      await sendToBackend(spokenText);
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  /* 🌐 SEND TO BACKEND */
  const sendToBackend = async (text) => {
    try {
      const res = await fetch('https://pongal-celeb.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      setBotText(data.response);
      speakTamil(data.response);
    } catch (err) {
      setBotText('Server error 😢');
    }
  };

  /* 🔊 TAMIL VOICE OUTPUT */
  const speakTamil = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'ta-IN';
    utterance.rate = 1;
    utterance.pitch = 1;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synth.cancel();
    synth.speak(utterance);
  };

  return (
    <div
      className="avatar-container"
      ref={avatarRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ '--accent-color': config.accentColor }}
    >
      {/* LOGOS */}
      <div className="frame-logos">
        <img
          src="https://i.ibb.co/d4KrJrxv/eec-logo-finalized-1536x516-1.png"
          className="frame-logo"
          alt="EEC"
        />
        <img
          src="https://i.ibb.co/wFFkzGVR/ACE.png"
          className="frame-logo"
          alt="ACE"
        />
      </div>

      {/* AVATAR */}
      <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''}`}>
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

        {isHovering && <div className="interaction-pulse" />}

        <div className="avatar-status">
          {config.description}
        </div>

        {/* 🎤 MIC BUTTON */}
        <button
          className={`mic-btn ${listening ? 'active' : ''}`}
          onClick={startListening}
        >
          🎤
        </button>

        {/* 💬 CHAT DISPLAY */}
        {userText && (
          <div className="chat user">
            <strong>You:</strong> {userText}
          </div>
        )}

        {botText && (
          <div className="chat bot">
            <strong>Bot:</strong> {botText}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAvatar;
