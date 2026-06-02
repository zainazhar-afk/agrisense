"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import {
  askRagAssistant,
  getChatSession,
  getChatSessions,
  saveChatSession,
  translateAssistantText,
  speakText,
  deleteChatSession,
} from "@/utils/api";

// ============================================================================
// SELF-CONTAINED STYLES
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-6px) rotate(1deg); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.85); opacity: 0.6; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    @keyframes typewriter {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .text-gradient {
      background: linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientFlow 4s ease infinite;
    }
    .dark .text-gradient {
      background: linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #2dd4bf 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    .dark .glass-panel {
      background: rgba(12, 18, 16, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .message-bubble-user {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
    }
    .message-bubble-ai {
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.9) 100%);
      box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(16,185,129,0.1) inset;
    }
    .dark .message-bubble-ai {
      background: linear-gradient(135deg, rgba(30,41,38,0.9) 0%, rgba(20,30,27,0.9) 100%);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(16,185,129,0.15) inset;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.25); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
    .cursor-blink {
      animation: typewriter 1s step-end infinite;
    }
  `}</style>
);

// ============================================================================
// PARTICLE FIELD
// ============================================================================

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.06 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
}

// ============================================================================
// INLINE SVG ICONS
// ============================================================================

const Ico = {
  Robot: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  User: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Send: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Mic: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
  Volume: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  Translate: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  ),
  Document: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Brain: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Loader: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  Leaf: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  History: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sparkle: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
};

// ============================================================================
// DATA
// ============================================================================

const LANGUAGES = [
  { code: "ur", label: "اردو", name: "Urdu", speech: "ur-PK", dir: "rtl", flag: "🇵🇰", gradient: "from-emerald-500 to-teal-500" },
  { code: "pa", label: "پنجابی", name: "Punjabi", speech: "ur-PK", dir: "rtl", flag: "🇵🇰", gradient: "from-amber-500 to-orange-500" },
  { code: "en", label: "English", name: "English", speech: "en-US", dir: "ltr", flag: "🇺🇸", gradient: "from-blue-500 to-cyan-500" },
];

const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

const makeTitle = (messages) => {
  const first = messages.find((m) => m.sender === "user")?.text;
  return first?.slice(0, 60) || "New Conversation";
};

// ============================================================================
// TYPING INDICATOR
// ============================================================================

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-6">
      <div className="flex gap-3 max-w-[85%]">
        <div className="shrink-0">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <Ico.Robot className="w-5 h-5 text-white" />
            <span className="absolute -inset-1 rounded-2xl border-2 border-emerald-400/30 animate-[pulse-ring_2s_ease-out_infinite]" />
          </div>
        </div>
        <div className="message-bubble-ai rounded-3xl px-5 py-3.5">
          <div className="flex gap-1.5 items-center h-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

function ChatMessage({ message, index, onSpeak, onTranslate, translating }) {
  const isUser = message.sender === "user";
  const [translatedText, setTranslatedText] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const hasSources = !isUser && message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 40 : -40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26, delay: Math.min(index * 0.04, 0.2) }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`flex gap-3 max-w-[88%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <motion.div
          className="shrink-0 self-end"
          whileHover={{ scale: 1.1, rotate: isUser ? -5 : 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${isUser ? "bg-gradient-to-br from-emerald-500 to-teal-600" : hasSources ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
            {isUser ? <Ico.User className="w-5 h-5 text-white" /> : <Ico.Robot className="w-5 h-5 text-white" />}
            {!isUser && (
              <span className="absolute -inset-1 rounded-2xl border-2 border-emerald-400/20 animate-[pulse-ring_2.5s_ease-out_infinite]" />
            )}
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative px-5 py-3.5 rounded-3xl ${isUser ? "message-bubble-user text-white" : "message-bubble-ai text-gray-800 dark:text-gray-100"} overflow-hidden`}
          >
            {/* Hover shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: isHovered ? "100%" : "-100%" }}
              transition={{ duration: 0.6 }}
            />

            {/* Source badge */}
            {!isUser && (
              <div className="relative z-10 mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30">
                {hasSources ? (
                  <>
                    <Ico.Check className="w-3 h-3" />
                    Verified from Documents
                  </>
                ) : (
                  <>
                    <Ico.Brain className="w-3 h-3" />
                    AI Knowledge
                  </>
                )}
              </div>
            )}

            <p className="relative z-10 text-[15px] leading-relaxed whitespace-pre-wrap" dir={getLanguage(message.language || "en").dir}>
              {translatedText || message.text}
            </p>
          </motion.div>

          {/* Actions */}
          {!isUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 flex flex-wrap items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSpeak({ ...message, text: translatedText || message.text })} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium bg-white/50 dark:bg-white/5 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                <Ico.Volume className="w-3.5 h-3.5" />
                Listen
              </motion.button>

              {LANGUAGES.filter((l) => l.code !== message.language).map((l) => (
                <motion.button
                  key={l.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTranslate(message.id, l.code, setTranslatedText)}
                  disabled={translating === message.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 disabled:opacity-50 transition-all"
                >
                  <Ico.Translate className="w-3.5 h-3.5" />
                  {translating === message.id ? <Ico.Loader className="w-3 h-3 animate-spin" /> : `${l.flag} ${l.label}`}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Sources */}
          {!isUser && message.sources?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/20 p-3">
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <Ico.Document className="w-3.5 h-3.5" />
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.slice(0, 4).map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                    {s.source} <span className="text-emerald-500 font-semibold">p.{s.page}</span>
                  </span>
                ))}
                {message.sources.length > 4 && <span className="text-[11px] text-gray-400 px-2 py-1">+{message.sources.length - 4}</span>}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SIDEBAR SESSION ITEM
// ============================================================================

function SessionItem({ session, isActive, onClick, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className="group relative"
    >
      <button
        onClick={onClick}
        className={`w-full text-left rounded-xl px-3 py-3 transition-all duration-300 ${isActive ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/30" : "hover:bg-white/50 dark:hover:bg-white/5 border border-transparent"}`}
      >
        <p className="text-xs font-medium text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed">{session.title}</p>
        <p className="text-[10px] text-gray-400 mt-1">{new Date(session.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
      </button>
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          >
            <Ico.Trash className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AssistantContent() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      sender: "ai",
      text: "🌾 السلام علیکم! میں آپ کا زرعی معاون ہوں۔\n\nAsk me anything about crops, pests, diseases, fertilizers, or irrigation. I can answer in اردو, پنجابی, or English.",
      language: "ur",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [inputLanguage, setInputLanguage] = useState("ur");
  const [targetLanguage, setTargetLanguage] = useState("ur");
  const [language, setLanguage] = useState("ur");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Init
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          getChatSessions(savedToken).then((d) => setSavedSessions(d.sessions || [])).catch(() => {});
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    // Speech recognition
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (e) => {
          let t = "";
          for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
          setInput(t);
          setIsListening(false);
        };
        recognitionRef.current.onerror = () => { setIsListening(false); };
        recognitionRef.current.onend = () => { setIsListening(false); };
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const aiReplyCount = messages.filter((m) => m.sender === "ai").length - 1;
  useEffect(() => {
    if (!user && aiReplyCount >= 2) setTimeout(() => setShowAuthModal(true), 600);
  }, [aiReplyCount, user]);

  const persistMessages = async (nextMessages) => {
    if (!token) return;
    try {
      const d = await saveChatSession({ token, sessionId, title: makeTitle(nextMessages), language, messages: nextMessages });
      if (d.session?.id) setSessionId(d.session.id);
    } catch (err) { console.error(err); }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: "ai",
        text: "🌾 السلام علیکم! میں آپ کا زرعی معاون ہوں۔\n\nAsk me anything about crops, pests, diseases, fertilizers, or irrigation. I can answer in اردو, پنجابی, or English.",
        language: "ur",
        createdAt: new Date().toISOString(),
      },
    ]);
    setSessionId(null);
    setInput("");
    setLanguage("ur");
    setInputLanguage("ur");
    setTargetLanguage("ur");
    setError("");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: crypto.randomUUID(), sender: "user", text: input.trim(), language: inputLanguage, createdAt: new Date().toISOString() };
    const pending = [...messages, userMsg];
    setMessages(pending);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const llmLang = targetLanguage || inputLanguage;
      let question = userMsg.text;
      if (inputLanguage !== llmLang) {
        const t = await translateAssistantText({ text: userMsg.text, language: llmLang });
        question = t.text || userMsg.text;
      }
      const ragHistory = pending.map((m) => (m.id === userMsg.id ? { ...m, text: question, language: llmLang } : m));
      const response = await askRagAssistant({ question, language: llmLang, chatHistory: ragHistory });
      const aiMsg = { id: crypto.randomUUID(), sender: "ai", text: response.answer, language: response.language, sources: response.sources || [], createdAt: new Date().toISOString() };
      const next = [...pending, aiMsg];
      setMessages(next);
      setLanguage(response.language);
      await persistMessages(next);
    } catch (err) {
      setError(err.message || "Assistant unavailable. Please try again.");
      setTimeout(() => setError(""), 5000);
      setMessages([...pending, { id: crypto.randomUUID(), sender: "ai", text: "⚠️ I couldn't reach the knowledge base. Please check your connection and try again.", language: "en", createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (msgId, targetLang, setTranslatedText) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    setTranslating(msgId);
    try {
      const r = await translateAssistantText({ text: msg.text, language: targetLang });
      setTranslatedText(r.text);
    } catch (err) {
      setError("Translation failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setTranslating(null);
    }
  };

  const speak = async (message) => {
    try {
      const blob = await speakText({ text: message.text, language: message.language });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      setError("Could not generate audio");
      setTimeout(() => setError(""), 3000);
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setError("Voice input not supported");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const map = { ur: "ur-PK", pa: "ur-PK", en: "en-US" };
      recognitionRef.current.lang = map[inputLanguage] || "ur-PK";
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAuthSuccess = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setShowAuthModal(false);
    try {
      await saveChatSession({ token: userToken, sessionId, title: makeTitle(messages), language, messages });
      const d = await getChatSessions(userToken);
      setSavedSessions(d.sessions || []);
    } catch (err) {
      setError("Logged in but couldn't save history");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteChat = async (sid) => {
    if (!token || !window.confirm("Delete this conversation?")) return;
    try {
      await deleteChatSession({ token, sessionId: sid });
      const d = await getChatSessions(token);
      setSavedSessions(d.sessions || []);
      if (sessionId === sid) startNewChat();
    } catch (err) {
      setError("Could not delete chat");
      setTimeout(() => setError(""), 3000);
    }
  };

  const loadSession = async (sid) => {
    if (!token) return;
    setSessionId(sid);
    try {
      const d = await getChatSession({ token, sessionId: sid });
      if (d.session?.messages?.length) {
        setMessages(d.session.messages.map((m) => ({ ...m, id: m.id || crypto.randomUUID() })));
        setLanguage(d.session.language || "ur");
        setInputLanguage(d.session.language || "ur");
        setTargetLanguage(d.session.language || "ur");
      }
    } catch {
      setError("Could not load chat");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <GlobalStyles />

      {/* Scroll Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left" style={{ scaleX, background: "linear-gradient(90deg, #10b981, #14b8a6, #10b981)" }} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-[#0a0f0e] dark:via-[#0d1412] dark:to-[#0a1510] text-gray-900 dark:text-white transition-colors duration-500 relative">
        <ParticleField />

        {/* Ambient Glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <motion.div animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>

        {/* MAIN CONTENT - pt-24 for navbar spacing */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }} className="mb-6">
            <div className="glass-panel rounded-[2rem] p-5 md:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    animate={{ boxShadow: ["0 10px 25px rgba(16,185,129,0.15)", "0 15px 35px rgba(16,185,129,0.25)", "0 10px 25px rgba(16,185,129,0.15)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Ico.Leaf className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    <span className="absolute -inset-1 rounded-2xl border-2 border-emerald-400/20 animate-[pulse-ring_2.5s_ease-out_infinite]" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gradient">AgriSense Assistant</h1>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Powered by RAG • Multilingual • Document-Verified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startNewChat} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow">
                    <Ico.Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Chat</span>
                  </motion.button>
                  
                  {!user ? (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAuthModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20">
                      Save Chats
                    </motion.button>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                      {user.name}
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                    <Ico.History className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Chat Area */}
            <motion.main initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] glass-panel rounded-[2rem] shadow-xl overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <ChatMessage key={msg.id} message={msg} index={i} onSpeak={speak} onTranslate={handleTranslate} translating={translating} />
                  ))}
                  {loading && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mx-4 md:mx-6 mb-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="border-t border-gray-200/50 dark:border-white/5 p-4 md:p-5 bg-gradient-to-t from-white/30 to-transparent dark:from-white/[0.02]">
                {/* Language Bar */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 rounded-full p-1 border border-gray-200/50 dark:border-white/10">
                    {LANGUAGES.map((l) => (
                      <motion.button
                        key={l.code}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setInputLanguage(l.code); setTargetLanguage(l.code); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${inputLanguage === l.code ? `bg-gradient-to-r ${l.gradient} text-white shadow-md` : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                      >
                        {l.flag} {l.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Answer in:</span>
                    <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="text-xs bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30">
                      {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Input Box */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      dir={getLanguage(inputLanguage).dir}
                      rows={1}
                      maxLength={800}
                      disabled={loading}
                      placeholder={inputLanguage === "ur" ? "اپنا سوال لکھیں..." : inputLanguage === "pa" ? "اپنا سوال لکھو..." : "Ask about crops, pests, diseases..."}
                      className="w-full resize-none rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-5 py-3.5 pr-16 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      style={{ minHeight: "52px", maxHeight: "120px" }}
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-mono">{input.length}/800</span>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={toggleVoice}
                      disabled={loading}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isListening ? "bg-rose-500 text-white animate-pulse shadow-rose-500/30" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"}`}
                      title="Voice input"
                    >
                      <Ico.Mic className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: "0 0 25px rgba(16,185,129,0.3)" }}
                      whileTap={{ scale: 0.92 }}
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                    >
                      {loading ? <Ico.Loader className="w-5 h-5 animate-spin" /> : <Ico.Send className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.main>

            {/* Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.aside
                  initial={{ opacity: 0, x: 30, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: 30, width: 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                  className="lg:block overflow-hidden"
                >
                  <div className="glass-panel rounded-[2rem] p-5 shadow-xl h-full max-h-[calc(100vh-220px)] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200/50 dark:border-white/5">
                      <Ico.History className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white">Conversations</h3>
                      <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{savedSessions.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                      <AnimatePresence>
                        {savedSessions.length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                              <Ico.Sparkle className="w-8 h-8 text-emerald-400/50" />
                            </motion.div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No saved chats</p>
                            <p className="text-xs text-gray-400 mt-1">Login to save your history</p>
                          </motion.div>
                        ) : (
                          savedSessions.map((s) => (
                            <SessionItem
                              key={s.id}
                              session={s}
                              isActive={sessionId === s.id}
                              onClick={() => loadSession(s.id)}
                              onDelete={() => handleDeleteChat(s.id)}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Try asking</p>
                      {[
                        "What causes bacterial blight in cotton?",
                        "How to treat fungal leaf spot?",
                        "Best fertilizer for wheat crops?",
                      ].map((tip, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ x: 3 }}
                          onClick={() => { setInput(tip); inputRef.current?.focus(); }}
                          className="block w-full text-left text-[11px] text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 transition-colors truncate"
                        >
                          → {tip}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      </div>
    </>
  );
}