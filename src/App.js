import React, { useState, useRef } from 'react';
import ChatbotAvatar from './components/ChatbotAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  return (
    <div className="App">
      {/* Interactive avatar section */}
      <div className="avatar-section">
        <ChatbotAvatar emotion={emotion} isSpeaking={isSpeaking} />
      </div>
      
      {/* Compact bottom chat */}
      <ChatInterface
        setEmotion={setEmotion}
        setIsSpeaking={setIsSpeaking}
        conversationHistory={conversationHistory}
        setConversationHistory={setConversationHistory}
      />
    </div>
  );
}

export default App;
