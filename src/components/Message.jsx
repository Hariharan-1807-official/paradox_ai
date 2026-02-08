import React from 'react';
import Markdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Message = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={clsx(
                "flex w-full mt-4 space-x-4 max-w-4xl mx-auto px-4 md:px-0",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <Sparkles size={18} className="text-secondary" />
                </div>
            )}

            <div className={clsx(
                "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 text-sm md:text-base shadow-lg transition-all",
                isUser
                    ? "bg-gradient-to-br from-violet-600/90 to-indigo-600/90 backdrop-blur-md text-white rounded-tr-sm border border-white/10"
                    : "bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-slate-100 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            )}>
                {isUser ? (
                    <p className="whitespace-pre-wrap font-sans tracking-wide leading-relaxed">{content}</p>
                ) : (
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none leading-relaxed prose-code:bg-slate-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:text-indigo-300">
                        <Markdown>{content}</Markdown>
                    </div>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <User size={18} className="text-white" />
                </div>
            )}
        </motion.div>
    );
};

export default Message;
