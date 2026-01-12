import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatInterface.css'; // Make sure you have the CSS from previous steps

const API_URL = 'https://pongal-celeb.onrender.com';

const ChatInterface = ({ externalInput, setVoiceInput, setIsSpeaking, setEmotion }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Voice Input from App.js
  useEffect(() => {
    if (externalInput) {
      handleSend(externalInput);
      setVoiceInput('');
    }
  }, [externalInput]);

  // --- 🔊 FIXED AUDIO FUNCTION ---
  const speakTamil = (text) => {
    // 1. Safety Check
    if (!window.speechSynthesis) return;
    
    // 2. Clear any stuck audio queue
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN';
    utterance.rate = 1.0;  // Normal speed
    utterance.volume = 1.0; // Max volume

    // 3. Voice Selection (Crucial for Chrome)
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Google Tamil or any Tamil
      const tamilVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('ta')) 
                      || voices.find(v => v.lang.includes('ta'));
      
      if (tamilVoice) utterance.voice = tamilVoice;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    // 4. Lip Sync Events
    utterance.onstart = () => { console.log("Speaking started..."); setIsSpeaking(true); };
    utterance.onend = () => { console.log("Speaking ended."); setIsSpeaking(false); };
    utterance.onerror = (e) => { console.error("Audio Error:", e); setIsSpeaking(false); };

    // 5. Speak!
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: text });
      const botResponse = res.data.response;
      
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setEmotion(res.data.emotion || 'happy');
      
      // CALL AUDIO IMMEDIATELY
      speakTamil(botResponse);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to server." }]);
      setEmotion('sad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface-container">
      {/* Messages Area */}
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading-dots">Bot is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question here..."
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;