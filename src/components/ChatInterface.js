import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const API_URL = 'https://pongal-celeb.onrender.com';

const ChatInterface = ({ externalInput, setVoiceInput, setIsSpeaking, setEmotion }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- AUTO SCROLL ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLE VOICE INPUT ---
  useEffect(() => {
    if (externalInput) {
      const tamilDisplay = convertToTamil(externalInput);
      // Show Tamil version of voice input immediately
      const userMsg = { role: 'user', content: tamilDisplay };
      setMessages(prev => [...prev, userMsg]);

      // Send original English to backend
      handleSend(externalInput, tamilDisplay);
      setVoiceInput('');
    }
  }, [externalInput]);

  // --- TRANSLITERATION HELPER ---
  const convertToTamil = (text) => {
    if (!text) return "";
    const dictionary = {
      "hi": "வணக்கம்", "hello": "வணக்கம்", "pongal": "பொங்கல்",
      "happy": "இனிய", "menu": "உணவு பட்டியல்", "food": "உணவு",
      "eat": "சாப்பிடு", "thanks": "நன்றி", "what": "என்ன",
      "is": "இருக்கிறது", "special": "சிறப்பு", "tell": "சொல்லுங்கள்",
      "me": "எனக்கு", "about": "பற்றி", "come": "வாருங்கள்",
      "advantages": "நன்மைகள்", "benefits": "பலன்கள்", "festival": "பண்டிகை",
      "celebration": "கொண்டாட்டம்"
    };
    return text
      .toLowerCase()
      .trim()
      .split(" ")
      .map(word => dictionary[word] || word)
      .join(" ");
  };

  // --- TTS AUDIO ---
  const speakTamil = async (text, speed = 1.1) => {
    try {
      setIsSpeaking(true);
      const res = await fetch(`${API_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS request failed");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.playbackRate = speed; // control speed here
      audio.play();

      audio.onended = () => setIsSpeaking(false);
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(false);
    }
  };

  // --- SEND LOGIC ---
  const handleSend = async (msgOverride = null, displayOverride = null) => {
    const rawText = msgOverride || input;
    const displayText = convertToTamil(rawText); // always convert to Tamil for display

    if (!rawText.trim()) return;

    // Show User Message (Tamil only)
    if (!msgOverride) {
      const userMsg = { role: 'user', content: displayText };
      setMessages(prev => [...prev, userMsg]);
    }

    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: rawText });
      const botResponse = res.data.response;

      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setEmotion(res.data.emotion || 'happy');

      speakTamil(botResponse, 1.1); // slightly faster default
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "மன்னிக்கவும், சர்வர் பதில் அளிக்கவில்லை."
      }]);
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
              {msg.role === 'bot' && (
                <button
                  className="audio-replay-btn"
                  onClick={() => speakTamil(msg.content)}
                  title="Read Aloud"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading-dots">Bot is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="இங்கே தட்டச்சு செய்யவும்..." // Tamil placeholder
        />
        <button onClick={() => handleSend()}>➤</button>
      </div>
    </div>
  );
};

export default ChatInterface;
