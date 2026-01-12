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

  // --- HANDLE VOICE INPUT FROM AVATAR ---
  useEffect(() => {
    if (externalInput) {
      // Convert spoken English to Tamil for display
      const tamilDisplay = convertToTamil(externalInput);
      handleSend(externalInput, tamilDisplay);
      setVoiceInput('');
    }
  }, [externalInput]);

  // --- 🔤 TRANSLITERATION HELPER (English -> Tamil) ---
  const convertToTamil = (text) => {
    if (!text) return "";
    const lower = text.toLowerCase().trim();
    
    const dictionary = {
      "hi": "வணக்கம்",
      "hello": "வணக்கம்",
      "pongal": "பொங்கல்",
      "happy": "இனிய",
      "menu": "உணவு பட்டியல்",
      "food": "உணவு",
      "eat": "சாப்பிடு",
      "thanks": "நன்றி",
      "what": "என்ன",
      "is": "இருக்கிறது",
      "special": "சிறப்பு"
    };

    // Replace known words, keep others
    return text.split(" ").map(word => dictionary[word.toLowerCase()] || word).join(" ");
  };

  // --- 🔊 BULLETPROOF AUDIO FIX ---
  const speakTamil = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    // 1. Cancel active speech to prevent queue jams
    synth.cancel();

    // 2. Create the utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ta-IN'; 
    utterance.rate = 1.0; 
    utterance.volume = 1.0;

    // 3. Voice Selection (The tricky part)
    const setVoice = () => {
      const voices = synth.getVoices();
      // Prioritize Google Tamil (Best quality) -> Any Tamil -> Any generic
      const tamilVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('ta')) 
                      || voices.find(v => v.lang.includes('ta'));
      
      if (tamilVoice) {
        utterance.voice = tamilVoice;
        console.log("Speaking with:", tamilVoice.name);
      }
    };

    if (synth.getVoices().length > 0) {
      setVoice();
    } else {
      synth.onvoiceschanged = setVoice;
    }

    // 4. Lip Sync Triggers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => { console.error("Audio error", e); setIsSpeaking(false); };

    // 5. SPEAK
    synth.speak(utterance);
  };

  // --- SEND LOGIC ---
  const handleSend = async (msgOverride = null, displayOverride = null) => {
    // Determine what to send (to backend) and what to show (to user)
    const rawText = msgOverride || input;
    const displayText = displayOverride || convertToTamil(rawText);

    if (!rawText.trim()) return;

    // 1. Show User Message (in TAMIL)
    const userMsg = { role: 'user', content: displayText };
    setMessages(prev => [...prev, userMsg]);
    
    setInput('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      // 2. Send to Backend (English or Tamil, backend handles both)
      const res = await axios.post(`${API_URL}/chat`, { message: rawText });
      
      const botResponse = res.data.response;
      const botEmotion = res.data.emotion || 'happy';

      // 3. Show Bot Response
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setEmotion(botEmotion);

      // 4. PLAY AUDIO (Unlock browser audio)
      speakTamil(botResponse);

    } catch (err) {
      console.error(err);
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