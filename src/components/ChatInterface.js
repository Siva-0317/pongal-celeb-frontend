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

      const botMessage = {
        role: 'assistant',
        content: response.data.response
      };

      setConversationHistory(prev => [...prev, botMessage]);
      setEmotion(response.data.emotion);
      
      // Simulate speaking animation
      setIsSpeaking(true);
      const speakDuration = response.data.response.length * 50; // 50ms per character
      setTimeout(() => {
        setIsSpeaking(false);
        setEmotion('neutral');
      }, speakDuration);

    } catch (error) {
      console.error('Error:', error);
      setEmotion('sad');
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
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
        {conversationHistory.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
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
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
        />
        <button onClick={handleSend} disabled={isLoading} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
