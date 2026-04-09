"use client";

import { motion } from "framer-motion";
import { UIMessage, isToolUIPart, isTextUIPart } from "ai";
import { Bot, User } from "lucide-react";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  const textContent = message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");

  const hasActiveToolCall = message.parts.some(
    (part) =>
      isToolUIPart(part) &&
      part.state !== "output-available" &&
      part.state !== "output-error" &&
      part.state !== "output-denied"
  );

  if (!textContent && !hasActiveToolCall) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {hasActiveToolCall && !textContent && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <motion.div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
            <span className="text-xs">Looking that up...</span>
          </div>
        )}
        {textContent && <MessageContent content={textContent} />}
      </div>
    </motion.div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;

        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span>•</span>
              <span>
                <InlineText text={line.replace(/^[\s]*[-•]\s*/, "")} />
              </span>
            </div>
          );
        }

        return (
          <p key={i}>
            <InlineText text={line} />
          </p>
        );
      })}
    </div>
  );
}

/** Renders inline text with **bold** support — no dangerouslySetInnerHTML. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
