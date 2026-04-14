import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, Info, ShieldAlert, BookOpen, User, Languages } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.PROD
  ? 'https://legal-aid-backend-8lg9.onrender.com'
  : '/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState(null);
  const [language, setLanguage] = useState('en');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, role: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        query_id: `q_${Date.now()}`,
        text: input,
        language: language
      });

      const aiMsg = {
        id: Date.now() + 1,
        text: response.data.answer,
        role: 'ai',
        sources: response.data.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: "Sorry, I'm having trouble connecting to the legal knowledge base. Please try again later.",
        role: 'ai',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-legal-600 p-2 rounded-lg">
            <Scale className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Legal Aid Assistant</h1>
            <p className="text-xs text-slate-500 font-medium">Empowering Common People with Knowledge</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(lang => lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Languages size={16} />
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <div className="flex items-center gap-2 text-amber-600 px-3 py-1.5 bg-amber-50 rounded-full text-xs font-semibold border border-amber-100">
            <ShieldAlert size={14} />
            PROTOTYPE: INDIAN LAW
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-slate-900 text-slate-300 py-2 px-6 text-[10px] md:text-xs flex items-center justify-center gap-2 text-center">
        <Info size={12} className="shrink-0" />
        IMPORTANT: This AI provides information, not legal advice. Always consult a qualified lawyer.
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">How can I help you today?</h2>
                  <p className="text-slate-600 mb-8">Describe your legal concern in plain language. For example:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    {[
                      "What are my rights if I'm arrested?",
                      "How do I file a consumer complaint?",
                      "What is the punishment for cheating in BNS?",
                      "My landlord is forcing me to vacate without notice."
                    ].map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(q)}
                        className="p-3 text-sm border border-slate-200 rounded-xl hover:border-legal-600 hover:bg-legal-50 transition-all text-slate-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-slate-200' : 'bg-legal-600'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Scale size={16} className="text-white" />}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-legal-600 text-white shadow-md rounded-tr-none' 
                        : msg.isError 
                          ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                          : 'bg-white shadow-sm border border-slate-200 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {msg.text}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <button 
                          onClick={() => setSelectedSources(msg.sources)}
                          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-legal-600 hover:text-legal-800 uppercase tracking-wider"
                        >
                          <BookOpen size={14} />
                          View References ({msg.sources.length})
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your legal problem..."
                className="w-full p-4 pr-16 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-legal-600 transition-all text-slate-900"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-2 bg-legal-600 text-white rounded-xl hover:bg-legal-700 disabled:opacity-50 disabled:bg-slate-400 transition-all"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Source Sidebar */}
        <AnimatePresence>
          {selectedSources && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full md:w-96 bg-white border-l border-slate-200 shadow-xl overflow-y-auto z-20"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-legal-600" />
                    References
                  </h3>
                  <button onClick={() => setSelectedSources(null)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>
                <div className="space-y-6">
                  {selectedSources.map((source, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-legal-600 uppercase tracking-widest bg-legal-100 px-2 py-0.5 rounded">
                          {source.act_name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          SCORE: {Math.round(source.score * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{source.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
