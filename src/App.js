import React, { useState, useRef, useEffect } from 'react';
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
      <div className="avatar-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <ChatbotAvatar emotion={emotion} isSpeaking={isSpeaking} />
        </Canvas>
      </div>
      
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
