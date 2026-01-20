'use client';

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const sendMessage = useAction(api.tutor.sendMessage);
  const messages = useQuery(api.tutor.getHistory) || [];
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await sendMessage({ body: input });
      setInput("");
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md border rounded-xl bg-white dark:bg-gray-800 shadow-sm">
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">AI Tutor</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              }`}
            >
              {msg.body}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Ask me anything about the lesson!
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
