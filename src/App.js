import React, { useState, useRef, useEffect } from 'react';
import ChatbotAvatar from './components/ChatbotAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');

  // 🎵 Background Music Ref
  const audioRef = useRef(null);

  useEffect(() => {
    // Set volume initially
    if (audioRef.current) {
      audioRef.current.volume = 0.55; // keep volume low for soothing effect
    }

    // Function to handle autoplay restrictions
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            // If play is successful, remove the event listeners so it doesn't try again
            document.removeEventListener('click', playAudio);
            document.removeEventListener('keydown', playAudio);
          })
          .catch((err) => {
            // If it fails (browser blocks it), we just wait for the next click
            console.log("Audio play failed (waiting for interaction):", err);
          });
      }
    };

    // Add listeners to document to detect user interaction
    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    // Cleanup listeners when component unmounts
    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  const handleMicInput = (text) => {
    console.log("App received:", text);
    setVoiceInput(text);
  };

  return (
    <div className="App">
      {/* 🎵 Background Music */}
      {/* Removed 'autoPlay' attribute; we handle it via the useEffect above */}
      <audio ref={audioRef} loop>
        <source src="/music/bgm.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* === LEFT SIDE: Avatar, Logos, Mic === */}
      <div className="left-panel">
        {/* 🔧 HEADER BAR WITH LOGOS + TEXT */}
        <div className="header-bar">
          <img 
            src="https://i.ibb.co/d4KrJrxv/eec-logo-finalized-1536x516-1.png" 
            className="header-logo-left" 
            alt="EEC Logo" 
          />
          <div className="header-text">Department of CSE</div>
          <img 
            src="https://i.ibb.co/wFFkzGVR/ACE.png" 
            className="header-logo-right" 
            alt="ACE Logo" 
          />
        </div>

        {/* AVATAR + MIC */}
        <div className="avatar-wrapper">
          <ChatbotAvatar 
            emotion={emotion} 
            isSpeaking={isSpeaking} 
            onMicInput={handleMicInput} 
          />
        </div>

        {/* CUTE TEXT */}
        <div className="cute-text-box">
          Chatbot-க்கு Hi சொல்லியாச்சா? 😄<br/>
          பொங்கல் சாப்பிட்டாச்சா? 🌾
        </div>
      </div>

      {/* === RIGHT SIDE: Chat Window === */}
      <div className="right-panel">
        <ChatInterface 
          setEmotion={setEmotion}
          setIsSpeaking={setIsSpeaking}
          externalInput={voiceInput}
          setVoiceInput={setVoiceInput}
        />
      </div>
    </div>
  );
}

export default App;