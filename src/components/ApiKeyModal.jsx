import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const ApiKeyModal = ({ onSave }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 w-full max-w-lg shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden"
            >
                {/* Background glow blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                        <Key size={24} className="text-indigo-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 font-display">Welcome to Paradox AI</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        To start using Paradox AI, please enter your Access Key (Groq API Key) below.
                        It is stored securely in your browser.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="apiKey" className="block text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">
                                Groq API Key
                            </label>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl opacity-0 group-hover:opacity-30 group-focus-within:opacity-50 transition duration-500 blur"></div>
                                <input
                                    type="password"
                                    id="apiKey"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="relative w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="gsk_..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!key.trim()}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Initialize Chatbot
                        </button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <a
                            href="https://console.groq.com/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            Don't have a key? Get one here <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ApiKeyModal;
