import React, { useState } from 'react';
import ChatbotAvatar from './components/ChatbotAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  // 1. States for Avatar Animation (Lip-sync & Emotion)
  const [emotion, setEmotion] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 2. NEW: State to "Bridge" Voice Input (Avatar -> ChatInterface)
  const [voiceInput, setVoiceInput] = useState('');

  // 3. Handler: When Avatar hears something, save it here
  const handleMicInput = (text) => {
    console.log("App received voice:", text);
    setVoiceInput(text); // This triggers the update in ChatInterface
  };

  return (
    <div className="App">
      {/* Top: Avatar Section */}
      <div className="avatar-section">
        <ChatbotAvatar 
          emotion={emotion} 
          isSpeaking={isSpeaking} 
          onMicInput={handleMicInput} // Pass the handler to the Avatar
        />
      </div>
      
      {/* Bottom: Chat Interface */}
      <ChatInterface
        // Controls for the Avatar
        setEmotion={setEmotion}
        setIsSpeaking={setIsSpeaking}
        
        // The Bridge Props
        externalInput={voiceInput}    // Pass the voice text down
        setVoiceInput={setVoiceInput} // Allow clearing it after sending
      />
    </div>
  );
}

export default App;