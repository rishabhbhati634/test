import React, { useState, useEffect } from "react";
import axios from "axios";

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [responseText, setResponseText] = useState("");
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

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
  }, []);

  const handleTranslate = async () => {
    try {
      const response = await axios.get("https://tata-innovent-backend.onrender.com", {
        text: inputText,
        targetLanguage,
      });
      const result = response.data.translatedText || response.data.response;

      setResponseText(result);
      speakOutLoud(result, targetLanguage);
    } catch (error) {
      setResponseText("Error occurred during translation.");
      console.error(error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          🌍 Multilingual Voice Assistant
        </h1>

        <div className="flex items-start gap-2 w-full mb-4">
          <textarea
            className="border border-gray-300 text-gray-800 p-4 rounded-xl w-full h-28 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type or speak your prompt..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleMicClick}
            className={`min-w-[80px] h-12 mt-2 rounded-xl text-white font-semibold shadow-md transition-all ${
              listening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {listening ? "🎙️ Stop" : "🎤 Mic"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 mb-4">
          <select
            className="border border-gray-300 text-gray-800 p-2 rounded-xl shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>

          <button
            onClick={handleTranslate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md transition-all w-full"
          >
            Generate ✨
          </button>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-inner">
          <p className="text-gray-600 font-medium mb-1">Response:</p>
          <p className="text-lg text-gray-900 whitespace-pre-wrap">{responseText}</p>
        </div>
      </div>
    </div>
  );
};

export default Translator;
