import React, { useRef, useState } from 'react';
import './ChatbotAvatar.css';

const ChatbotAvatar = ({ emotion, isSpeaking, onMicInput }) => {
  const videoRef = useRef(null);
  const [listening, setListening] = useState(false);

  // --- AUDIO UNLOCKER ---
  // We play a silent sound immediately when you click MIC. 
  // This "tricks" the browser into allowing audio later.
  const unlockAudio = () => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance("");
    utter.volume = 0;
    synth.speak(utter);
  };

  const startListening = () => {
    unlockAudio(); // <--- CRITICAL FIX

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Please use Google Chrome for Voice features.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // We listen in English
    recognition.interimResults = false;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Mic heard:", transcript);
      setListening(false);
      onMicInput(transcript); // Send to App -> ChatInterface
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <div className="avatar-container">
      {/* Use a simple DIV wrapper or IMG if the Video is causing issues. 
         But sticking to your video structure:
      */}
      <div className={`avatar-wrapper ${isSpeaking ? 'speaking' : ''}`}>
        <div className="avatar-video-wrapper">
          <video ref={videoRef} className="avatar-video" autoPlay loop muted playsInline>
            <source src={`${process.env.PUBLIC_URL}/videos/pongal-chatbot.mp4`} type="video/mp4" />
          </video>
        </div>
        
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