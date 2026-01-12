import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ChatInterface = ({ setEmotion, setIsSpeaking, conversationHistory, setConversationHistory }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setConversationHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: input,
        conversation_history: conversationHistory
      });

      const botMessage = { role: 'assistant', content: response.data.response };
      setConversationHistory(prev => [...prev, botMessage]);
      setEmotion(response.data.emotion);
      
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
        setEmotion('neutral');
      }, 2000);

    } catch (error) {
      setEmotion('sad');
      const errorMessage = { 
        role: 'assistant', 
        content: 'Oops! Check backend connection.' 
      };
      setConversationHistory(prev => [...prev, errorMessage]);
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
        {/* Show only last 3 messages for compact view */}
        {conversationHistory.slice(-3).map((msg, idx) => (
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
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about Pongal menu..."
          disabled={isLoading}
          className="chat-input"
          maxLength={100}
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
