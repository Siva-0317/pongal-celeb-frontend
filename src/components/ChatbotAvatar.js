import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ onMicInput, isSpeaking, emotion }) => {
  const videoRef = useRef(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Use Chrome for Mic");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Captures English
    recognition.interimResults = false;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Mic heard:", transcript);
      
      // 🚀 SEND TEXT TO APP.JS (which sends to ChatInterface)
      onMicInput(transcript); 
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <div className="avatar-container">
      <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''}`}>
        <div className="avatar-video-wrapper">
          <video ref={videoRef} className="avatar-video" autoPlay loop muted>
            <source src={`${process.env.PUBLIC_URL}/videos/pongal-chatbot.mp4`} type="video/mp4" />
          </video>
        </div>
        
        {/* MIC BUTTON */}
        <button 
          className={`mic-btn ${listening ? 'listening' : ''}`} 
          onClick={startListening}
        >
          {listening ? '🛑' : '🎤'}
        </button>
      </div>
    </div>
  );
};

export default ChatbotAvatar;