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
      handleSend(externalInput, tamilDisplay);
      setVoiceInput('');
    }
  }, [externalInput]);

  // --- TRANSLITERATION HELPER ---
  const convertToTamil = (text) => {
    if (!text) return "";
    const lower = text.toLowerCase().trim();
    const dictionary = {
      "hi": "வணக்கம்", "hello": "வணக்கம்", "pongal": "பொங்கல்",
      "happy": "இனிய", "menu": "உணவு பட்டியல்", "food": "உணவு",
      "eat": "சாப்பிடு", "thanks": "நன்றி", "what": "என்ன",
      "is": "இருக்கிறது", "special": "சிறப்பு"
    };
    return text.split(" ").map(word => dictionary[word.toLowerCase()] || word).join(" ");
  };

const speakTamil = async (text) => {
  try {
    setIsSpeaking(true);

    // Call backend /tts
    const res = await fetch("https://pongal-celeb.onrender.com/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    // Backend returns an MP3 file
    if (!res.ok) throw new Error("TTS request failed");

    // Convert response to a blob
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);

    // Play audio
    const audio = new Audio(audioUrl);
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
    const displayText = displayOverride || convertToTamil(rawText);

    if (!rawText.trim()) return;

    // Show User Message
    const userMsg = { role: 'user', content: displayText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      // Call Backend
      const res = await axios.post(`${API_URL}/chat`, { message: rawText });
      const botResponse = res.data.response;
      
      // Show Bot Response
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setEmotion(res.data.emotion || 'happy');

      // PLAY AUDIO
      speakTamil(botResponse);

    } catch (err) {
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
              
              {/* 🔊 ADDED: Replay Button for Bot Messages */}
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
          placeholder="Type here..."
        />
        <button onClick={() => handleSend()}>➤</button>
      </div>
    </div>
  );
};

export default ChatInterface;