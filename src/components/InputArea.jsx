import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InputArea = ({ onSend, isLoading, onStop }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    return (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`relative w-full max-w-3xl transition-all duration-300 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}
            >
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-20 blur-lg transition-opacity duration-300 ${isFocused ? 'opacity-50' : 'opacity-20'}`}></div>

                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-end gap-2 bg-slate-900/80 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-2xl"
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask anything..."
                        rows={1}
                        className="w-full bg-transparent text-slate-100 placeholder-slate-400 font-medium resize-none focus:outline-none px-3 py-2.5 max-h-[150px] overflow-y-auto"
                        style={{ minHeight: '48px' }}
                    />

                    <div className="flex-shrink-0 pb-1 pr-1">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.button
                                    key="stop"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    type="button"
                                    onClick={onStop}
                                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                    <StopCircle size={20} />
                                </motion.button>
                            ) : (
                                <motion.button
                                    key="send"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={`p-2.5 rounded-xl transition-all ${input.trim()
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    <ArrowUp size={20} className={input.trim() ? 'animate-pulse' : ''} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InputArea;
