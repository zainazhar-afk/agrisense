"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Languages,
  LoaderCircle,
  LogIn,
  Mic,
  MicOff,
  NotebookText,
  Plus,
  Save,
  Sparkles,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/components/system/AppProviders";
import {
  askRagAssistant,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  saveChatSession,
  speakText,
  translateAssistantText,
} from "@/utils/api";

const LANGUAGES = [
  { code: "ur", name: "Urdu", label: "اردو", dir: "rtl", speech: "ur-PK" },
  { code: "pa", name: "Punjabi", label: "پنجابی", dir: "rtl", speech: "ur-PK" },
  { code: "en", name: "English", label: "English", dir: "ltr", speech: "en-US" },
];

const WELCOME = {
  ur: "السلام علیکم۔ فصل، بیماری، آبپاشی، کھاد، منڈی یا موسمی فیصلوں سے متعلق سوال پوچھیے۔",
  pa: "السلام علیکم۔ فصل، بیماری، پانی، کھاد یا منڈی بارے سوال پچھو، میں عملی مدد دیواں گا۔",
  en: "Ask about crops, pests, irrigation, fertilizer, or farm decisions and I will answer with source-backed guidance.",
};

const PROMPTS = {
  ur: [
    "کپاس کے پتے مڑنے لگیں تو پہلے کیا دیکھوں؟",
    "گلابی سنڈی کے ابتدائی آثار کیا ہیں؟",
    "بارش کے بعد آبپاشی کا فیصلہ کیسے کروں؟",
  ],
  pa: [
    "روئی دے پتّے مڑن لگن تاں سب توں پہلا کیہڑا چیک کراں؟",
    "گلابی سنڈی دے شروع دے نشان کی نیں؟",
    "بارش توں بعد پانی کدوں دینا چاہیدا اے؟",
  ],
  en: [
    "What should a cotton farmer check first when leaves start curling?",
    "How can I distinguish pest damage from nutrient stress?",
    "What should I review after unexpected rain in cotton fields?",
  ],
};

const SOURCE_THEME = [
  "from-blue-600 via-cyan-500 to-teal-400",
  "from-violet-600 via-blue-500 to-cyan-400",
];

function getLanguageMeta(code) {
  return LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];
}

function createWelcomeMessage(language) {
  return {
    id: `welcome-${language}`,
    sender: "assistant",
    text: WELCOME[language] || WELCOME.ur,
    language,
    createdAt: new Date().toISOString(),
    sources: [],
    translations: {},
    isWelcome: true,
  };
}

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  const user = window.localStorage.getItem("user") || window.sessionStorage.getItem("user");
  if (!token || !user) {
    return { token: null, user: null };
  }
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token: null, user: null };
  }
}

function buildTitle(messages) {
  return messages.find((item) => item.sender === "user")?.text?.slice(0, 72) || "AgriSense chat";
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelative(value) {
  if (!value) {
    return "now";
  }
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

function getSourceStrength(source, index, total) {
  const numeric = Number(source?.score ?? source?.similarity ?? source?.confidence ?? 0);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.max(18, Math.min(100, Math.round(numeric <= 1 ? numeric * 100 : numeric)));
  }
  const falloff = total > 1 ? index / (total - 1) : 0;
  return Math.max(36, Math.round(100 - falloff * 42));
}

function LoadingTranscript() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="w-full max-w-2xl rounded-[1.8rem] bg-[linear-gradient(90deg,rgba(53,90,60,0.96),rgba(95,141,88,0.93),rgba(126,166,108,0.92))] px-5 py-4 text-white shadow-[0_18px_40px_rgba(53,90,60,0.18)]">
          <div className="skeleton-line h-3 w-28 bg-white/25" />
          <div className="skeleton-line mt-4 h-3 w-[92%] bg-white/25" />
          <div className="skeleton-line mt-3 h-3 w-[78%] bg-white/25" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-full max-w-3xl rounded-[1.8rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.94),rgba(226,234,220,0.94))] px-5 py-4 shadow-[0_16px_40px_rgba(95,141,88,0.08)]">
          <div className="skeleton-line h-3 w-36" />
          <div className="skeleton-line mt-4 h-3 w-[94%]" />
          <div className="skeleton-line mt-3 h-3 w-[88%]" />
          <div className="skeleton-line mt-3 h-3 w-[73%]" />
        </div>
      </div>
    </div>
  );
}

function SessionEmptyState({ authenticated }) {
  return (
    <div className="empty-state rounded-[1.5rem] px-5 py-6">
      <div className="font-medium text-slate-950">
        {authenticated ? "No saved sessions yet" : "Sign in to keep chat history"}
      </div>
      <div className="mt-2 text-sm leading-7 text-slate-600">
        {authenticated
          ? "Saved conversations will appear here for quick return."
          : "Logging in lets farmers return to previous irrigation, pest, and fertilizer questions."}
      </div>
    </div>
  );
}

function SourceMatrix({ sources }) {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="rounded-[1.6rem] border border-emerald-100 bg-slate-100/76 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-950">Sources</div>
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{sources.length} refs</div>
      </div>
      <div className="mt-4 space-y-3">
        {sources.slice(0, 4).map((source, index, list) => {
          const strength = getSourceStrength(source, index, list.length);
          return (
            <div
              key={`${source.source || source.source_base || "source"}-${index}`}
              className="rounded-[1.25rem] border border-emerald-100 bg-slate-100/84 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-950">
                    {(source.source || source.source_base || "Document").slice(0, 46)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {source.page ? `page ${source.page}` : "knowledge source"}
                  </div>
                </div>
                <div className="rounded-full border border-emerald-100 bg-slate-200/80 px-3 py-1 text-xs text-slate-600">
                  {strength}%
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${SOURCE_THEME[index % SOURCE_THEME.length]}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageCard({ message, playingId, audioLoadingId, onSpeak, onTranslate, translatingId }) {
  const language = getLanguageMeta(message.language);
  const isAssistant = message.sender === "assistant";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-3xl rounded-[1.8rem] px-5 py-4 ${
          isAssistant
            ? "border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.94),rgba(226,234,220,0.94))] text-slate-900 shadow-[0_16px_40px_rgba(95,141,88,0.08)]"
            : "bg-[linear-gradient(90deg,rgba(53,90,60,0.96),rgba(95,141,88,0.93),rgba(126,166,108,0.92))] text-white shadow-[0_18px_40px_rgba(53,90,60,0.18)]"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] ${
            isAssistant ? "text-slate-400" : "text-white/74"
          }`}
        >
          <span>{isAssistant ? "Assistant" : "You"}</span>
          <span>•</span>
          <span>{language.name}</span>
          <span>•</span>
          <span>{formatTime(message.createdAt)}</span>
        </div>

        <div dir={language.dir} className="mt-3 whitespace-pre-wrap text-[15px] leading-7">
          {message.text}
        </div>

        {message.activeTranslation ? (
          <div className="mt-4 rounded-[1.2rem] border border-emerald-100 bg-slate-100/75 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {getLanguageMeta(message.activeTranslation.language).name} translation
            </div>
            <div
              dir={getLanguageMeta(message.activeTranslation.language).dir}
              className="mt-2 text-sm leading-7 text-slate-600"
            >
              {message.activeTranslation.text}
            </div>
          </div>
        ) : null}

        {isAssistant && message.sources?.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.sources.slice(0, 4).map((source, index) => (
              <span key={`${source.source || source.source_base || "source"}-${index}`} className="data-chip">
                {(source.source || source.source_base || "Document").slice(0, 34)}
                {source.page ? ` | p.${source.page}` : ""}
              </span>
            ))}
          </div>
        ) : null}

        {isAssistant && !message.isWelcome ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onSpeak(message)} className="button-secondary px-3 py-2 text-xs">
              {audioLoadingId === message.id ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : playingId === message.id ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
              {playingId === message.id ? "Stop audio" : "Listen"}
            </button>

            {LANGUAGES.filter((item) => item.code !== message.language).map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => onTranslate(message.id, item.code)}
                className="button-secondary bg-transparent px-3 py-2 text-xs text-slate-700"
              >
                {translatingId === `${message.id}:${item.code}` ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Languages className="h-3.5 w-3.5" />
                )}
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function AssistantContent() {
  const { pushToast } = useToast();
  const [inputLanguage, setInputLanguage] = useState("ur");
  const [responseLanguage, setResponseLanguage] = useState("ur");
  const [messages, setMessages] = useState([createWelcomeMessage("ur")]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [translatingId, setTranslatingId] = useState(null);
  const [audioLoadingId, setAudioLoadingId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const messagesEndRef = useRef(null);

  const assistantReplies = useMemo(
    () => messages.filter((item) => item.sender === "assistant" && !item.isWelcome),
    [messages]
  );
  const latestAssistant = assistantReplies[assistantReplies.length - 1] || null;
  const sourceStats = latestAssistant?.sources || [];

  useEffect(() => {
    const auth = getStoredAuth();
    setToken(auth.token);
    setUser(auth.user);
    if (auth.token) {
      refreshSessions(auth.token);
    }

    return () => {
      recognitionRef.current?.stop();
      stopAudio();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const refreshSessions = async (nextToken) => {
    try {
      const data = await getChatSessions(nextToken);
      setSavedSessions(data.sessions || []);
    } catch {}
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setPlayingId(null);
    setAudioLoadingId(null);
  };

  const persistMessages = async (nextMessages, nextLanguage, currentSessionId) => {
    if (!token) {
      return;
    }

    const payload = {
      token,
      sessionId: currentSessionId,
      title: buildTitle(nextMessages),
      language: nextLanguage,
      messages: nextMessages
        .filter((item) => !item.isWelcome)
        .map((item) => ({
          sender: item.sender,
          text: item.text,
          language: item.language,
          sources: item.sources || [],
          createdAt: item.createdAt,
        })),
    };

    try {
      let data;
      try {
        data = await saveChatSession(payload);
      } catch (saveError) {
        if (currentSessionId) {
          data = await saveChatSession({ ...payload, sessionId: null });
        } else {
          throw saveError;
        }
      }
      if (data?.session?.id) {
        setSessionId(data.session.id);
      }
      await refreshSessions(token);
    } catch {}
  };

  const handleManualSave = async () => {
    await persistMessages(messages, responseLanguage, sessionId);
    pushToast({
      title: "Conversation saved",
      message: "This assistant thread is now available in your saved sessions.",
      type: "success",
    });
  };

  const handleNewConversation = () => {
    stopAudio();
    setSessionId(null);
    setMessages([createWelcomeMessage(responseLanguage)]);
    setInput("");
    setError("");
    pushToast({
      title: "Fresh conversation started",
      message: "You now have a clean workspace for a new field question.",
      type: "info",
    });
  };

  const handlePromptInsert = (text) => setInput(text);

  const handleSend = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: input.trim(),
      language: inputLanguage,
      createdAt: new Date().toISOString(),
      sources: [],
      translations: {},
    };

    const chatHistory = messages
      .filter((item) => !item.isWelcome)
      .slice(-8)
      .map((item) => ({
        sender: item.sender,
        text: item.text,
        language: item.language,
      }));

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await askRagAssistant({
        question: userMessage.text,
        language: responseLanguage,
        chatHistory,
      });

      const assistantMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: response.answer,
        language: response.language || responseLanguage,
        createdAt: new Date().toISOString(),
        sources: response.sources || [],
        translations: {},
      };

      const updatedMessages = [...nextMessages, assistantMessage];
      setMessages(updatedMessages);
      await persistMessages(updatedMessages, assistantMessage.language, sessionId);

      if (!token && updatedMessages.filter((item) => item.sender === "assistant" && !item.isWelcome).length >= 2) {
        setShowAuthModal(true);
      }
    } catch (sendError) {
      setError(sendError.message || "The assistant could not answer right now.");
      pushToast({
        title: "Assistant unavailable",
        message: sendError.message || "The knowledge workflow did not return an answer.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (messageId, languageCode) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message) {
      return;
    }
    setTranslatingId(`${messageId}:${languageCode}`);
    setError("");

    try {
      const translated = await translateAssistantText({
        text: message.text,
        language: languageCode,
      });

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                translations: {
                  ...(item.translations || {}),
                  [languageCode]: translated.translation,
                },
                activeTranslation: {
                  language: languageCode,
                  text: translated.translation,
                },
              }
            : item
        )
      );

      pushToast({
        title: `Translated to ${getLanguageMeta(languageCode).name}`,
        message: "The translated answer is now shown inside the message card.",
        type: "success",
      });
    } catch (translateError) {
      setError(translateError.message || "Translation failed.");
      pushToast({
        title: "Translation failed",
        message: translateError.message || "The assistant could not translate this answer.",
        type: "error",
      });
    } finally {
      setTranslatingId(null);
    }
  };

  const handleSpeak = async (message) => {
    if (playingId === message.id) {
      stopAudio();
      pushToast({
        title: "Playback stopped",
        message: "Audio playback has been stopped.",
        type: "info",
      });
      return;
    }

    stopAudio();
    setAudioLoadingId(message.id);
    setError("");

    try {
      const blob = await speakText({ text: message.text, language: message.language });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      setPlayingId(message.id);
      setAudioLoadingId(null);
      audio.onended = stopAudio;
      audio.onerror = () => {
        stopAudio();
        setError("Audio playback failed.");
      };
      await audio.play();
    } catch (audioError) {
      stopAudio();
      setError(audioError.message || "Could not generate audio.");
      pushToast({
        title: "Audio unavailable",
        message: audioError.message || "The text-to-speech request did not complete.",
        type: "error",
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      pushToast({
        title: "Voice input unsupported",
        message: "This browser does not expose speech recognition.",
        type: "error",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLanguageMeta(inputLanguage).speech;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput((current) => `${current} ${transcript}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setError("Voice input stopped before a result was captured.");
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setError("");
    setIsListening(true);
  };

  const handleLoadSession = async (id) => {
    if (!token) {
      return;
    }

    setLoading(true);
    stopAudio();
    setError("");

    try {
      const data = await getChatSession({ token, sessionId: id });
      const session = data.session;
      const restoredMessages = (session.messages || []).map((item, index) => ({
        id: item.id || `${id}-${index}`,
        sender: item.sender,
        text: item.text,
        language: item.language || session.language || "ur",
        createdAt: item.createdAt,
        sources: item.sources || [],
        translations: {},
      }));

      setSessionId(id);
      setInputLanguage(session.language || "ur");
      setResponseLanguage(session.language || "ur");
      setMessages(restoredMessages.length ? restoredMessages : [createWelcomeMessage(session.language || "ur")]);
    } catch (loadError) {
      setError(loadError.message || "Could not load that conversation.");
      pushToast({
        title: "Could not load session",
        message: loadError.message || "The saved conversation could not be restored.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!token) {
      return;
    }
    try {
      await deleteChatSession({ token, sessionId: id });
      setSavedSessions((current) => current.filter((item) => item.id !== id));
      if (sessionId === id) {
        handleNewConversation();
      }
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete that conversation.");
      pushToast({
        title: "Delete failed",
        message: deleteError.message || "The session could not be deleted.",
        type: "error",
      });
    }
  };

  const handleAuthSuccess = async (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    await refreshSessions(nextToken);
    await persistMessages(messages, responseLanguage, sessionId);
  };

  return (
    <>
      <section className="section-dark pt-6">
        <div className="page-wrap pb-16">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
              <div className="panel rounded-[2rem] p-5">
                <div className="eyebrow">
                  <NotebookText className="h-3.5 w-3.5 text-emerald-500" />
                  assistant
                </div>
                <h1 className="section-title mt-5 text-[2.25rem]">
                  Ask like a farmer, not like a search form.
                </h1>
                <div className="mt-6 grid gap-3">
                  <div className="metric-tile rounded-[1.35rem] bg-slate-100/78">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Answer mode</div>
                    <div className="mt-3 font-display text-2xl text-slate-950">
                      {getLanguageMeta(responseLanguage).name}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Current response language</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button type="button" onClick={handleNewConversation} className="button-primary w-full">
                    <Plus className="h-4 w-4" />
                    New conversation
                  </button>
                  {!user ? (
                    <button type="button" onClick={() => setShowAuthModal(true)} className="button-secondary w-full">
                      <LogIn className="h-4 w-4" />
                      Login to save chats
                    </button>
                  ) : (
                    <button type="button" onClick={handleManualSave} className="button-secondary w-full">
                      <Save className="h-4 w-4" />
                      Save chat
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-emerald-100 bg-[rgba(244,247,240,0.76)] p-4 shadow-[0_18px_40px_rgba(95,141,88,0.08)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-950">Saved sessions</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {savedSessions.length} stored
                  </div>
                </div>

                {savedSessions.length === 0 ? (
                  <SessionEmptyState authenticated={Boolean(user)} />
                ) : (
                  <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1 xl:max-h-[28rem] xl:flex-col xl:overflow-auto xl:pb-0">
                    {savedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`min-w-[240px] rounded-[1.35rem] border p-4 xl:min-w-0 ${
                          session.id === sessionId
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-emerald-100 bg-slate-100/78"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadSession(session.id)}
                          className="w-full text-left"
                        >
                          <div className="font-medium text-slate-950">
                            {session.title || "Conversation"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Updated {formatRelative(session.updatedAt)}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id)}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              <div className="signal-grid rounded-[2rem] p-4 md:p-5">
                <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      conversation controls
                    </div>
                    <div className="mt-2 font-display text-[1.6rem] leading-tight text-slate-950">
                      Multilingual, source-backed farm guidance.
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                    <label className="text-sm text-slate-600">
                      <span className="mb-2 block">Question language</span>
                      <select
                        value={inputLanguage}
                        onChange={(event) => setInputLanguage(event.target.value)}
                        className="field-input"
                      >
                        {LANGUAGES.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm text-slate-600">
                      <span className="mb-2 block">Answer language</span>
                      <select
                        value={responseLanguage}
                        onChange={(event) => setResponseLanguage(event.target.value)}
                        className="field-input"
                      >
                        {LANGUAGES.map((language) => (
                          <option key={language.code} value={language.code}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="panel rounded-[2rem] p-4 md:p-5">
                <div className="custom-scrollbar min-h-[32rem] max-h-[56vh] space-y-4 overflow-auto pr-1">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      playingId={playingId}
                      audioLoadingId={audioLoadingId}
                      onSpeak={handleSpeak}
                      onTranslate={handleTranslate}
                      translatingId={translatingId}
                    />
                  ))}
                  {loading ? <LoadingTranscript /> : null}
                  <div ref={messagesEndRef} />
                </div>

                {error ? (
                  <div className="mt-4 rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="mt-4 space-y-4">
                  <SourceMatrix sources={sourceStats} />

                  <div className="rounded-[1.8rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(239,244,234,0.97),rgba(226,234,220,0.97))] p-4 shadow-[0_24px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex flex-wrap gap-2">
                      {(PROMPTS[inputLanguage] || PROMPTS.ur).map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handlePromptInsert(prompt)}
                          className="data-chip transition hover:border-emerald-200 hover:text-slate-950"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      rows={5}
                      className="field-input mt-4 min-h-[150px] resize-none"
                      placeholder={
                        inputLanguage === "ur"
                          ? "اپنا سوال یہاں لکھیں..."
                          : inputLanguage === "pa"
                            ? "اپنا سوال اتھے لکھو..."
                            : "Type a practical crop, pest, irrigation, or market question..."
                      }
                    />

                    <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={toggleListening} className="button-secondary">
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {isListening ? "Stop mic" : "Voice input"}
                        </button>
                        {playingId ? (
                          <button
                            type="button"
                            onClick={() => {
                              stopAudio();
                              pushToast({
                                title: "Playback stopped",
                                message: "Audio playback has been stopped.",
                                type: "info",
                              });
                            }}
                            className="button-secondary"
                          >
                            <Square className="h-4 w-4" />
                            Stop playback
                          </button>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="button-primary w-full justify-center xl:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        Send question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
