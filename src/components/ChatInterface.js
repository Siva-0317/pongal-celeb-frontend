import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatInterface.css';

// Using your Render Backend URL
const API_URL = process.env.REACT_APP_API_URL || 'https://pongal-celeb.onrender.com';

const ChatInterface = ({ setEmotion, setIsSpeaking, conversationHistory, setConversationHistory }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // --- 1. LIVE TRANSLITERATION (English -> Tamil) ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Dictionary for common Pongal words
    const dictionary = {
      "hi": "வணக்கம்",
      "hello": "வணக்கம்",
      "pongal": "பொங்கல்",
      "happy": "இனிய",
      "menu": "உணவு பட்டியல்",
      "eat": "சாப்பிடு",
      "food": "உணவு",
      "sugarcane": "கரும்பு",
      "sweet": "இனிப்பு",
      "college": "கல்லூரி",
      "celebration": "கொண்டாட்டம்",
      "vadai": "வடை",
      "payasam": "பாயசம்",
      "thanks": "நன்றி"
    };

    // Check if the last character is a space (trigger replacement)
    if (val.endsWith(' ')) {
      const words = val.trim().split(' ');
      const lastWord = words[words.length - 1].toLowerCase();
      
      if (dictionary[lastWord]) {
        // Replace the last English word with Tamil
        words[words.length - 1] = dictionary[lastWord];
        setInput(words.join(' ') + ' '); // Rebuild string with trailing space
        return;
      }
    }

    setInput(val);
  };

  // --- 2. TEXT-TO-SPEECH HELPER ---
  const speakTamil = (text) => {
    if (!window.speechSynthesis) return;

    // Cancel current audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN'; 
    utterance.rate = 1;
    utterance.pitch = 1;

    // Find Tamil Voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(v => v.lang.includes('ta'));
    if (tamilVoice) utterance.voice = tamilVoice;

    // --- SYNC AVATAR WITH VOICE ---
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setEmotion('neutral'); // Reset emotion after speaking
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- 3. SEND MESSAGE ---
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Add User Message to History
    const userMessage = { role: 'user', content: input };
    setConversationHistory(prev => [...prev, userMessage]);
    
    // Store current input for backend call, clear UI
    const currentMessage = input;
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      // API Call
      const response = await axios.post(`${API_URL}/chat`, {
        message: currentMessage
      });

      const botResponseText = response.data.response;
      const botEmotion = response.data.emotion || 'happy';

      // Add Bot Message to History
      const botMessage = { role: 'assistant', content: botResponseText };
      setConversationHistory(prev => [...prev, botMessage]);
      
      // Update Emotion
      setEmotion(botEmotion);
      
      // Trigger Voice (Avatar will animate due to utterance.onstart above)
      speakTamil(botResponseText);

    } catch (error) {
      console.error("Chat Error:", error);
      setEmotion('sad');
      
      const errorMessage = { 
        role: 'assistant', 
        content: 'மன்னிக்கவும், சர்வர் இணைப்பு கிடைக்கவில்லை. (Server Error)' 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {/* Show all messages (scrollable) or slice if you prefer compact */}
        {conversationHistory.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="chat-input-container">
        <input
          value={input}
          onChange={handleInputChange} // Uses the new Transliteration handler
          onKeyPress={handleKeyPress}
          placeholder="Ask about Pongal menu... (Type 'pongal ')"
          disabled={isLoading}
          className="chat-input"
          maxLength={150}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;