import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [listening, setListening] = useState(false);

  const emotionConfig = {
    neutral: {
      accentColor: '#00d4ff',
      description: 'Chatbot-க்கு Hi சொல்லியாச்சா 😄 பொங்கல் சாப்பிட்டாச்சா? 🌾'
    },
    happy: {
      accentColor: '#00ffcc',
      description: 'இனிய பதில் 😄'
    },
    excited: {
      accentColor: '#ffaa00',
      description: 'ரொம்ப சந்தோஷம்!'
    },
    thinking: {
      accentColor: '#bb88ff',
      description: 'சிந்திக்கிறேன்...'
    }
  };

  const config = emotionConfig[emotion] || emotionConfig.neutral;

  // 🎤 MIC HANDLER
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // handles Tanglish well
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      console.log('🎤 Heard:', transcript);
      sendToBackend(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  // 🔁 SEND TO BACKEND
  const sendToBackend = async (text) => {
    try {
      const res = await fetch('https://pongal-celeb.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      console.log('🤖 Bot:', data.response);

      speakTamil(data.response);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔊 TAMIL SPEECH OUTPUT
  const speakTamil = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="avatar-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ '--accent-color': config.accentColor }}
    >
      {/* Logos */}
      <div className="frame-logos">
        <img src="https://i.ibb.co/d4KrJrxv/eec-logo-finalized-1536x516-1.png" className="frame-logo left" />
        <img src="https://i.ibb.co/wFFkzGVR/ACE.png" className="frame-logo right" />
      </div>

      <div className={`avatar-wrapper ${isHovering ? 'hovering' : ''} ${isSpeaking ? 'speaking' : ''}`}>
        <div className="avatar-video-wrapper">
          <video ref={videoRef} className="avatar-video" autoPlay loop muted>
            <source src={`${process.env.PUBLIC_URL}/videos/pongal-chatbot.mp4`} type="video/mp4" />
          </video>

          {isHovering && <div className="interaction-pulse" />}
        </div>

        <div className="avatar-status">{config.description}</div>

        {/* 🎤 MIC BUTTON */}
        <button
          className={`mic-btn ${listening ? 'listening' : ''}`}
          onClick={startListening}
        >
          🎤
        </button>
      </div>
    </div>
  );
};

export default ChatbotAvatar;
