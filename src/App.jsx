import React, { useState, useEffect, useRef } from 'react';
import { Settings, Trash2, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './components/Message';
import InputArea from './components/InputArea';
import WelcomeModal from './components/WelcomeModal';
import { createGroqClient, streamChatCompletion } from './services/groq';
import { CONFIG } from './config';

function App() {
  // Backend manages API Key now, so we don't need user input.
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('paradox_user_profile')) || null;
    } catch { return null; }
  });

  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Persistence Effects
  // Chat history is now session-only (clears on refresh), so we don't save 'messages' to localStorage.

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('paradox_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed handleSetApiKey and handleClearApiKey

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = async (content) => {
    if (!content.trim()) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // No apiKey needed for factory
      const groq = createGroqClient();
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      await streamChatCompletion(
        groq,
        apiMessages,
        userProfile?.name, // Pass User Name
        (chunk) => {
          setMessages(current => {
            const lastMsg = current[current.length - 1];
            if (lastMsg.role === 'assistant') {
              return [
                ...current.slice(0, -1),
                { ...lastMsg, content: lastMsg.content + chunk }
              ];
            }
            return current;
          });
        },
        (fullResponse) => {
          setIsLoading(false);
        },
        (error) => {
          console.error(error);
          setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error.message}` }]);
          setIsLoading(false);
        }
      );

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to initialize Groq client." }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px] animate-mesh"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }}></div>
      </div>

      <AnimatePresence>
        {!userProfile && <WelcomeModal onSave={setUserProfile} />}
      </AnimatePresence>

      {/* Header */}
      <header className="flex-shrink-0 backdrop-blur-xl bg-slate-950/70 border-b border-white/5 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 blur-lg opacity-40"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-inner border border-white/10">
              <Cpu size={22} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white font-display">{CONFIG.APP_NAME} <span className="text-indigo-400">V1.0</span></h1>
            {CONFIG.SHOW_MODEL_INFO && <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Llama 3.3 • 70B Versatile</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClearChat}
            className="group p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Clear Chat"
          >
            <Trash2 size={20} className="group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-0 flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 pt-8 pb-36 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80"
          >
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
              <Cpu size={96} className="text-indigo-500/80 relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white font-display tracking-tight">How can I help you?</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Experience insightful responses powered by <strong>{CONFIG.APP_NAME}</strong>.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <Message key={index} role={msg.role} content={msg.content} />
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start w-full max-w-4xl mx-auto px-4 md:px-0 mt-4"
              >
                <div className="flex items-center gap-1.5 h-10 px-4 bg-slate-900/50 rounded-full border border-white/5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Input Area */}
      <InputArea onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}

export default App;
