import React, { useState, useEffect, useRef } from "react";

const LANGUAGES = [
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "en", label: "English" },
];

const InCarAssistantDashboard = () => {
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hi, I'm Leaty. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatEndRef = useRef(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "en-US";
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      recog.onend = () => setListening(false);
      setRecognition(recog);
    }
  }, []);

  const speakOutLoud = (text, languageCode) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(languageCode));
    if (matchedVoice) utterance.voice = matchedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
    } else {
      recognition.lang = "en-US";
      recognition.start();
    }
    setListening(!listening);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputText }
    ]);
    setInputText("");
    setIsAssistantTyping(true);
    try {
      const response = await fetch("http://localhost:5000/api/openai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage,
        })
      });
      const data = await response.json();
      const result = data.translatedText || data.response;
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: result }
        ]);
        setIsAssistantTyping(false);
        speakOutLoud(result, targetLanguage);
      }, Math.max(1000, result.length * 30));
    } catch (error) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: "Error occurred during translation." }
        ]);
        setIsAssistantTyping(false);
      }, 1000);
      console.error(error);
    }
  };

  const EngineIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M3 7v2h2v8H3v2h6v-2H7v-2h2v-2H7v-2h2V9H7V7h2V5H3v2zm8-2v14h8V5h-8zm6 12h-4V7h4v10z"/>
      <rect x="13" y="8" width="2" height="2" fill="currentColor"/>
      <rect x="13" y="11" width="2" height="2" fill="currentColor"/>
      <rect x="13" y="14" width="2" height="2" fill="currentColor"/>
    </svg>
  );

  const TireIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );

  const BatteryIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <rect x="4" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
      <rect x="6" y="8" width="3" height="8" fill="currentColor"/>
      <rect x="10" y="8" width="3" height="8" fill="currentColor"/>
      <rect x="14" y="8" width="2" height="8" fill="currentColor"/>
    </svg>
  );

  const OilIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L12 22l4.5-10c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z"/>
      <circle cx="12" cy="8" r="2" fill="#fff"/>
      <path d="M8 12l2-1 2 1 2-1 2 1" stroke="#fff" strokeWidth="1" fill="none"/>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0e2731 0%, #1a3a47 50%, #0e2731 100%)',
      color: '#fff',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        padding: '2rem 0 1rem 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <svg viewBox="0 0 24 24" fill="#4CAF50" width="40" height="40">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h1 style={{
            margin: 0,
            fontSize: '2.2rem',
            fontWeight: 600
          }}>GenAI-Powered In-Car Assistant</h1>
        </div>
        <button style={{
          background: '#2d4959',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.6rem 1.3rem',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}>
          ✨ Tell me more!
        </button>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: '2rem',
        padding: '0 2rem'
      }}>
        {/* Sidebar */}
        <aside style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          marginRight: '2rem'
        }}>
          {/* Engine Icon */}
          <div style={{
            background: '#1f3642',
            borderRadius: '50%',
            padding: '1rem',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff4444',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)'
          }}>
            <EngineIcon />
          </div>

          {/* Tire Pressure Icon */}
          <div style={{
            background: '#1f3642',
            borderRadius: '50%',
            padding: '1rem',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffaa00',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <TireIcon />
          </div>

          {/* Battery Icon */}
          <div style={{
            background: '#1f3642',
            borderRadius: '50%',
            padding: '1rem',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4CAF50',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <BatteryIcon />
          </div>

          {/* Oil Icon */}
          <div style={{
            background: '#1f3642',
            borderRadius: '50%',
            padding: '1rem',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2196F3',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <OilIcon />
          </div>


        </aside>

        {/* Main Panel */}
        <main style={{
          background: '#151f25',
          borderRadius: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          width: '700px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Phone Status Bar */}
          <div style={{
            background: '#000',
            color: '#fff',
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>📶</span>
              <span>🔵</span>
              <span>📡</span>
              <span>📶</span>
            </div>
            <div style={{ fontWeight: 'bold' }}>10:30 PM</div>
          </div>

          {/* Assistant Window */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '450px',
            position: 'relative'
          }}>
            {/* Assistant Header */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '24px',
              fontWeight: '500',
              color: '#b0c4ce',
              fontSize: '1.05rem',
              zIndex: 2
            }}>
              Leaty Assistant
            </div>

            {/* Chat Section */}
            <div style={{
              flex: 2,
              padding: '48px 24px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              height: '100%'
            }}>
              {/* Language Select */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <label style={{ color: '#b0c4ce', fontSize: '0.9rem' }}>Translate to:</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  style={{
                    background: '#2a4152',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.9rem'
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Chat Messages */}
              <div style={{
                flex: 1,
                maxHeight: '250px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                marginBottom: '1rem'
              }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      background: msg.sender === 'user' ? '#215b8e' : '#22292f',
                      padding: '1rem 1.2rem',
                      borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      color: '#e6e6e6',
                      fontSize: '1rem',
                      maxWidth: '85%',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {isAssistantTyping && (
                  <div style={{
                    background: '#22292f',
                    borderRadius: '12px',
                    padding: '0.8rem 1.2rem',
                    maxWidth: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#b0c4ce',
                    fontStyle: 'italic'
                  }}>
                    <span>Leaty is typing</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#b0c4ce',
                        animation: 'blink 1s infinite alternate'
                      }}></div>
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#b0c4ce',
                        animation: 'blink 1s infinite alternate 0.2s'
                      }}></div>
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#b0c4ce',
                        animation: 'blink 1s infinite alternate 0.4s'
                      }}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Suggested Answer */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#b0c4ce' }}>Suggested answer:</span>
                <div style={{
                  background: '#2a4152',
                  color: '#fff',
                  borderRadius: '10px',
                  display: 'inline-block',
                  padding: '0.6rem 1rem',
                  marginTop: '0.45rem',
                  cursor: 'pointer'
                }}>
                  Hey, what's this red light on my dashboard?
                </div>
              </div>

              {/* Input Row */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <textarea
                  placeholder="Type or speak your prompt..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  rows={2}
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    border: 'none',
                    padding: '0.8rem 1rem',
                    fontSize: '1rem',
                    color: '#222',
                    background: '#fff',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={handleMicClick}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9rem',
                    color: '#fff',
                    cursor: 'pointer',
                    background: listening ? '#e74c3c' : '#215b8e',
                    transition: 'background 0.2s'
                  }}
                >
                  {listening ? '🎙 Stop' : '🎤'}
                </button>
                <button
                  onClick={handleTranslate}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9rem',
                    color: '#fff',
                    cursor: 'pointer',
                    background: '#2d4959',
                    transition: 'background 0.2s'
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Map Section */}
            <div style={{
              flex: 1.3,
              padding: '24px 24px 24px 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end'
            }}>
              {/* Interactive Map */}
              <div style={{
                width: '220px',
                height: '280px',
                borderRadius: '14px',
                background: 'linear-gradient(45deg, #e8f4fd 0%, #c3e6f7 100%)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}>
                {/* Map Grid */}
                <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                  {/* Grid lines */}
                  {[...Array(10)].map((_, i) => (
                    <g key={i}>
                      <line
                        x1={i * 22}
                        y1="0"
                        x2={i * 22}
                        y2="280"
                        stroke="#ddd"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1={i * 28}
                        x2="220"
                        y2={i * 28}
                        stroke="#ddd"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  
                  {/* Roads */}
                  <path
                    d="M50 0 L50 140 L170 140 L170 280"
                    stroke="#666"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    d="M0 100 L220 100"
                    stroke="#666"
                    strokeWidth="4"
                    fill="none"
                  />
                  
                  {/* Current location (blue dot) */}
                  <circle cx="110" cy="180" r="8" fill="#2196F3">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="110" cy="180" r="4" fill="#fff" />
                  
                  {/* Destination marker */}
                  <polygon
                    points="170,120 175,135 165,135"
                    fill="#ff4444"
                  />
                  
                  {/* Route line */}
                  <path
                    d="M110 180 L110 140 L170 140 L170 125"
                    stroke="#4CAF50"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
                  </path>
                </svg>
                
                {/* Google Maps style attribution */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.9)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  Maps
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <footer style={{
            padding: '1rem 0',
            background: '#1f3642',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            borderRadius: '0 0 18px 18px'
          }}>
            {[
              { icon: '⊞', label: 'Grid' },
              { icon: '💬', label: 'Chat' },
              { icon: '📞', label: 'Phone' },
              { icon: '🚗', label: 'Car' },
              { icon: '⚙', label: 'Settings' }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  padding: '0.5rem'
                }}
                title={item.label}
              >
                {item.icon}
              </div>
            ))}
          </footer>
        </main>
      </div>

      <style jsx>{`
        @keyframes blink {
          to { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default InCarAssistantDashboard;