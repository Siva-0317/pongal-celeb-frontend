import React, { useState } from 'react';
import ChatbotAvatar from './components/ChatbotAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');

  const handleMicInput = (text) => {
    console.log("App received:", text);
    setVoiceInput(text);
  };

  return (
    <div className="App">
      {/* === LEFT SIDE: Avatar, Logos, Mic === */}
      <div className="left-panel">
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
