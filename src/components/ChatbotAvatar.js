import React, { useRef, useState, useEffect } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isHovering, setIsHovering] = useState(false);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [botText, setBotText] = useState('');

  // Emotion Configuration
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

  // --- 1. Translation Helper (English -> Tamil) ---
  const translateToTamil = async (englishText) => {
    // ⚠️ NOTE: Browsers cannot translate offline. 
    // You normally need a Google/Microsoft Translate API key here.
    // This is a SIMULATION for your demo.
    
    const lowerText = englishText.toLowerCase();
    
    const mockDictionary = {
      "hi": "வணக்கம்",
      "hello": "வணக்கம்",
      "how are you": "நீங்கள் எப்படி இருக்கிறீர்கள்?",
      "happy pongal": "இனிய பொங்கல் நல்வாழ்த்துக்கள்",
      "what is special today": "இன்று என்ன விசேஷம்?",
      "tell me about pongal": "பொங்கல் பற்றி சொல்லுங்கள்",
      "menu": "உணவு பட்டியல்"
    };

    // Return mapped Tamil or original text + hint if not found
    return mockDictionary[lowerText] || englishText + " (தமிழில்...)";
  };

  // --- 2. Tamil Text-to-Speech ---
  const speakTamil = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop previous audio

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN'; // Tamil India
    utterance.rate = 0.9;     // Slightly slower for clarity
    utterance.pitch = 1;

    // Try to find a specific Tamil voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang.includes('ta'));
    if (tamilVoice) utterance.voice = tamilVoice;

    window.speechSynthesis.speak(utterance);
  };

  // --- 3. Microphone Logic (Listens in English) ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // 🎤 Listen for English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.onstart = () => {
        console.log("Listening for English...");
    };

    recognition.start();

    recognition.onresult = async (event) => {
      const englishTranscript = event.results[0][0].transcript;
      console.log("User said (English):", englishTranscript);

      setListening(false);

      // A. Translate English input to Tamil for Display
      const tamilDisplay = await translateToTamil(englishTranscript);
      setUserText(tamilDisplay); // 🖥️ Print in Tamil

      // B. Send the original English query to backend (so backend understands intent clearly)
      // Or you can send 'tamilDisplay' if your backend expects Tamil.
      sendToBackend(englishTranscript); 
    };

    recognition.onerror = (event) => {
      console.error("Mic Error:", event.error);
      setListening(false);
    };
    
    recognition.onend = () => {
        setListening(false);
    };
  };

  // --- 4. Backend Interaction ---
  const sendToBackend = async (text) => {
    try {
      setBotText('...'); // Loading indicator

      const res = await fetch('https://pongal-celeb.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }) // Sending the query
      });

      const data = await res.json();
      
      // Update Bot Text
      setBotText(data.response);

      // 🔊 Read out loud (ensure browser allows autoplay)
      speakTamil(data.response);

    } catch (err) {
      console.error(err);
      setBotText('பிழை ஏற்பட்டுள்ளது 😢');
    }
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
        
        {/* Video Loop */}
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
          {listening ? '🛑' : '🎤'}
        </button>

        {/* 🗨️ CHAT AREA */}
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