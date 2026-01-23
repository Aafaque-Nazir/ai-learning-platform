"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

import { useLessonContext } from "./LessonContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AITutor() {
  const { lessonContext } = useLessonContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI Mentor. 👋\n\nI can help you understand this lesson, debug code, or explain complex topics. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatAction = useAction(api.ai.chat);

  const scrollToBottom = () => {
    if (scrollRef.current) {
        // @ts-ignore
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Use recent history (last 10 messages) to save tokens
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      
      const response = await chatAction({
        messages: [...history, userMsg] as any, // Cast for simple type matching
        context: lessonContext
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the AI brain. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto"> 
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] md:w-[450px] h-[600px] bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-indigo-500/20 bg-indigo-500/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">AI Mentor</h3>
                  <p className="text-indigo-300 text-xs">
                    {lessonContext ? "Viewing Lesson Context" : "General Guidance"}
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      m.role === "user" ? "bg-purple-600" : "bg-indigo-600"
                    )}>
                      {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed",
                      m.role === "user" 
                        ? "bg-purple-600/20 text-purple-100 border border-purple-500/30 rounded-tr-sm" 
                        : "bg-slate-800 text-slate-200 border border-indigo-500/30 rounded-tl-sm"
                    )}>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                     </div>
                     <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-indigo-500/30 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-slate-400 text-xs">Thinking...</span>
                     </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <form 
                onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-slate-800 border-white/10 text-white focus-visible:ring-indigo-500"
                />
                <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Floating Button (Always Visible) */}
      <div className="pointer-events-auto">
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg shadow-indigo-500/40 text-white border border-white/20 hover:shadow-indigo-500/60 transition-all group"
        >
            {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
            <span className="sr-only">Toggle AI Tutor</span>
            
            {!isOpen && (
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-indigo-900 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Need Help?
                </span>
            )}
        </motion.button>
      </div>
    </div>
  );
}
