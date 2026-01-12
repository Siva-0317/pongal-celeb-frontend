import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ChatbotAvatar from './components/ChatbotAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  return (
    <div className="App">
      {/* Full screen avatar */}
      <div className="avatar-container">
        <Canvas 
          camera={{ position: [0, 0, 4], fov: 60 }}
          style={{ height: '85vh' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <ChatbotAvatar emotion={emotion} isSpeaking={isSpeaking} />
        </Canvas>
      </div>
      
      {/* Compact bottom chat - 15vh only */}
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
