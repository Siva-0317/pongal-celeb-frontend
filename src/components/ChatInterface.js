import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const API_URL = 'https://pongal-celeb.onrender.com';

const ChatInterface = ({ externalInput, setVoiceInput, setIsSpeaking, setEmotion }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- AUTO-SCROLL ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 🎤 LISTENS FOR VOICE INPUT FROM APP.JS ---
  useEffect(() => {
    if (externalInput) {
      handleSend(externalInput);
      setVoiceInput(''); // Clear the bridge state
    }
  }, [externalInput]);

  // --- 🔊 ROBUST AUDIO FUNCTION ---
  const speakTamil = (text) => {
    if (!window.speechSynthesis) {
      console.error("Browser does not support TTS");
      return;
    }

    // 1. Cancel existing speech
    window.speechSynthesis.cancel();

    // 2. Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN'; 
    utterance.rate = 0.9;
    utterance.volume = 1.0;

    // 3. Force Tamil Voice (Wait for voices to load)
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.lang.includes('Tamil'));
      if (tamilVoice) utterance.voice = tamilVoice;
    };
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }

    // 4. Lip Sync Triggers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // 5. Speak
    window.speechSynthesis.speak(utterance);
  };

  // --- SEND LOGIC ---
  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim()) return;

    // 1. Add User Message
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      // 2. Call Backend
      const res = await axios.post(`${API_URL}/chat`, { message: msg });
      
      const botResponse = res.data.response;
      const botEmotion = res.data.emotion || 'happy';

      // 3. Add Bot Message
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setEmotion(botEmotion);

      // 4. PLAY AUDIO
      speakTamil(botResponse);

    } catch (err) {
      console.error("Backend Error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: "மன்னிக்கவும், சர்வர் பதில் அளிக்கவில்லை." }]);
      setEmotion('sad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading-dots">...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Type or use the Mic above..."
        />
        <button onClick={() => handleSend(input)}>➤</button>
      </div>
    </div>
  );
};

export default ChatInterface;