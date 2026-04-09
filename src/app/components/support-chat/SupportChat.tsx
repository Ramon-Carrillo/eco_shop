"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { FloatingChatButton } from "./FloatingChatButton";

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      <FloatingChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[24rem] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:h-[36rem] sm:w-[26rem]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-emerald-600 px-4 py-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">EcoShop Support</h3>
                <p className="text-xs text-emerald-100">
                  {isLoading ? "Typing..." : "Online"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mb-3">
                    <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Welcome to EcoShop Support!
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I can help with orders, returns, product recommendations, and
                    more. Try asking:
                  </p>
                  <div className="mt-3 space-y-1.5 w-full">
                    {[
                      "Where's my order ECO-10001?",
                      "Show me kitchen products",
                      "I want to return an item",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage({ text: suggestion })}
                        className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {/* Input */}
            <ChatInput
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
