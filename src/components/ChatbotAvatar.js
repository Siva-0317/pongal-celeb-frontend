import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [botText, setBotText] = useState('');

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

  /* 🎤 MIC */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Tanglish friendly
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserText(transcript);
      setListening(false);
      sendToBackend(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  /* 🌐 BACKEND */
  const sendToBackend = async (text) => {
  try {
    setBotText('...'); // loading indicator

    const res = await fetch('https://pongal-celeb.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    setBotText(data.response);

    // 🔊 Must be inside user-trigger chain
    setTimeout(() => speakTamil(data.response), 200);

  } catch (err) {
    setBotText('பிழை ஏற்பட்டுள்ளது 😢');
  }
};

  /* 🔊 TAMIL VOICE */
  const speakTamil = (text) => {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ta-IN';
  utterance.rate = 1;
  utterance.pitch = 1.1;

  // Force Tamil voice
  const voices = speechSynthesis.getVoices();
  const tamilVoice = voices.find(v =>
    v.lang === 'ta-IN' || v.lang.includes('ta')
  );

  if (tamilVoice) {
    utterance.voice = tamilVoice;
  }

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
        <img
          src="https://i.ibb.co/d4KrJrxv/eec-logo-finalized-1536x516-1.png"
          className="frame-logo left"
          alt="EEC"
        />
        <img
          src="https://i.ibb.co/wFFkzGVR/ACE.png"
          className="frame-logo right"
          alt="ACE"
        />
      </div>

      <div className={`avatar-wrapper ${isHovering ? 'hovering' : ''} ${isSpeaking ? 'speaking' : ''}`}>
        <div className="avatar-video-wrapper">
          <video ref={videoRef} className="avatar-video" autoPlay loop muted>
            <source src={`${process.env.PUBLIC_URL}/videos/pongal-chatbot.mp4`} type="video/mp4" />
          </video>
          {isHovering && <div className="interaction-pulse" />}
        </div>

        <div className="avatar-status">{config.description}</div>

        {/* 🎤 MIC */}
        <button
          className={`mic-btn ${listening ? 'listening' : ''}`}
          onClick={startListening}
        >
          🎤
        </button>

        {/* 🗨️ SPOKEN TEXT */}
        <div className="chat-area">
  {userText && (
    <div className="chat-bubble user">
      <strong>நீங்க:</strong> {userText}
    </div>
  )}

  {botText && (
    <div className="chat-bubble bot">
      <strong>Bot:</strong> {botText}
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default ChatbotAvatar;
