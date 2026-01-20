'use client';

import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const sendMessage = useAction(api.tutor.sendMessage);
  const messages = useQuery(api.tutor.getHistory) || [];
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const text = input;
    setInput("");
    try {
      await sendMessage({ body: text });
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[450px] w-full rounded-2xl bg-black/40 border border-white/5 shadow-inner overflow-hidden">
      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.role === "assistant" 
                  ? "bg-premium-violet/10 border-premium-violet/30 text-premium-violet" 
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-premium-indigo text-white shadow-lg shadow-indigo-500/10"
                    : "bg-white/5 text-gray-200 border border-white/10"
                }`}
              >
                {msg.body}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
             <div className="w-8 h-8 rounded-lg bg-premium-violet/10 border border-premium-violet/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-premium-violet animate-pulse" />
             </div>
             <div className="bg-white/5 rounded-2xl px-4 py-2 text-sm text-gray-400 border border-white/10 italic">
                Tutor is thinking...
             </div>
          </motion.div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/10">
               <Bot className="w-8 h-8 text-premium-violet" />
            </div>
            <p className="text-gray-500 text-sm">
              I'm your AI Teacher. Ask me anything about your current lesson!
            </p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-premium-indigo transition-all placeholder:text-gray-600"
          disabled={loading}
        />
        <Button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          size="icon"
          className="bg-premium-indigo hover:bg-premium-violet text-white rounded-xl h-9 w-9 shrink-0 shadow-lg shadow-indigo-500/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
