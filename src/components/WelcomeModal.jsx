import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomeModal = ({ onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name: name.trim() });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-indigo-500/20">
                        <User size={32} className="text-indigo-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 font-display">Hello there!</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        I'm Paradox AI. Before we begin, what should I call you?
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label htmlFor="name" className="block text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors text-lg"
                                placeholder="e.g. Alex"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default WelcomeModal;
