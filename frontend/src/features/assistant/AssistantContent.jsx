"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMessages } from "@/hooks";
import { Header } from "@/components/common";
import { RiRobotLine, RiUserLine, RiSendPlaneLine } from "react-icons/ri";

// ─── Claymorphism Chat Message Component ───────────────────────────────────
export const ChatMessage = ({ sender, text, index }) => {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar with Claymorphism */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-[16px] bg-clay-surface shadow-clay-sm flex items-center justify-center ${
            isUser ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20"
          }`}>
            {isUser ? (
              <RiUserLine className={`w-4 h-4 ${isUser ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
            ) : (
              <RiRobotLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
        </div>

        {/* Message Bubble with Claymorphism */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative px-4 py-3 rounded-[24px] shadow-clay-sm transition-all duration-200 ${
            isUser
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
              : "bg-clay-surface text-gray-800 dark:text-gray-100"
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {text}
          </p>
          
          {/* Decorative Clay Element */}
          <div className={`absolute -top-1 ${isUser ? "right-2" : "left-2"} w-2 h-2 rounded-full ${
            isUser ? "bg-emerald-400" : "bg-emerald-300 dark:bg-emerald-600"
          }`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Claymorphism Chat Messages Container ─────────────────────────────────
export const ChatMessages = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 px-4 space-y-2 custom-scrollbar">
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} sender={msg.sender} text={msg.text} index={idx} />
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

// ─── Claymorphism Chat Input Component ────────────────────────────────────
export const ChatInput = ({
  input,
  onInputChange,
  onSend,
  onKeyPress,
  loading,
}) => {
  return (
    <div className="relative mt-4">
      {/* Decorative Clay Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 rounded-[32px] blur-xl" />
      
      <div className="relative bg-clay-surface rounded-[32px] shadow-clay-lg p-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-5 py-3.5 text-sm rounded-[24px] border-0 bg-clay-surface shadow-clay-inset focus:shadow-clay-md transition-all duration-200 outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ask me anything about your crops, weather, pests, or farming tips..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={loading}
            />
            
            {/* Character count (optional) */}
            {input.length > 0 && (
              <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                {input.length}/500
              </div>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="relative px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[24px] font-semibold text-sm transition-all duration-200 shadow-clay-md hover:shadow-clay-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RiSendPlaneLine className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ─── Claymorphism Empty State Component ───────────────────────────────────
export const EmptyState = () => {
  const suggestions = [
    "How to increase crop yield?",
    "Identify common plant diseases",
    "Best time to plant wheat",
    "Organic pest control methods",
    "Weather forecast for farming",
    "Soil health improvement tips",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center mb-6 shadow-clay-lg">
        <RiRobotLine className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        AI Assistant Ready to Help
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Ask me anything about farming, crop management, pest control, weather conditions, and more!
      </p>
      
      <div className="grid grid-cols-2 gap-2 max-w-lg">
        {suggestions.map((suggestion, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 bg-clay-surface shadow-clay-sm hover:shadow-clay-md rounded-[20px] transition-all duration-200"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main Assistant Content Component ─────────────────────────────────────
export default function AssistantContent() {
  const { messages, input, loading, messagesEndRef, setInput, sendMessage, handleKeyPress } = useMessages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Claymorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-clay-surface rounded-[32px] shadow-clay-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[28px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-clay-md">
                <RiRobotLine className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                  AgriSense AI Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Get smart, context-aware agricultural advice instantly
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <main className="flex flex-col h-[calc(100vh-240px)] bg-clay-surface rounded-[32px] shadow-clay-xl overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-emerald-100/50 dark:border-slate-700/50">
            <ChatInput
              input={input}
              onInputChange={setInput}
              onSend={() => sendMessage()}
              onKeyPress={(e) => handleKeyPress(e)}
              loading={loading}
            />
          </div>
        </main>

        {/* Footer with Claymorphism */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="bg-clay-surface rounded-[24px] shadow-clay-sm px-4 py-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              🤖 AgriSense AI Assistant is here to help. Ask anything related to farming, crops, weather, and sustainable agriculture!
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}