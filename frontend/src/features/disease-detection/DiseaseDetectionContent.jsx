"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { 
  Camera, 
  Shield, 
  Zap, 
  Leaf, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Upload,
  X,
  BarChart3,
  Droplets,
  ThermometerSun,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Scan,
  Brain,
  Activity,
  ChevronRight,
  Microscope,
  Waves,
  Sun,
  Moon,
  Star
} from "lucide-react";
import { predictDisease, getDiseaseInfo } from "../../utils/api";

// ============================================================================
// THEME CONTEXT
// ============================================================================

const themes = {
  dark: {
    bg: '#0a0f0e',
    surface: 'bg-white/[0.03]',
    surfaceHover: 'hover:bg-white/[0.08]',
    border: 'border-white/[0.08]',
    borderHover: 'hover:border-emerald-500/30',
    text: 'text-white',
    textSecondary: 'text-white/50',
    textTertiary: 'text-white/40',
    cardGradient: 'from-white/[0.07] to-white/[0.02]',
    heroBg: 'from-emerald-950/80 via-[#0f2922] to-teal-950/80',
    inputBorder: 'border-white/20',
    inputBorderHover: 'hover:border-emerald-500/50',
    progressBg: 'bg-white/10',
    buttonSecondary: 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10',
    glowColor: 'emerald-500/20',
    featureCardGradient: (color) => `from-${color}-500/20 to-${color}-600/5`,
    shadow: 'shadow-2xl shadow-emerald-900/20',
    particleOpacity: 0.6,
    gridOpacity: 0.03,
    blurAmount: 'backdrop-blur-xl',
    iconBg: 'bg-white/5',
    navBg: 'bg-white/5',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    previewBg: 'bg-black/40',
    listItemBg: 'bg-white/5',
    listItemHover: 'hover:bg-white/10',
    glowOrb1: 'bg-emerald-600/20',
    glowOrb2: 'bg-teal-600/15',
    glowOrb3: 'bg-emerald-900/20',
  },
  light: {
    bg: '#f8faf7',
    surface: 'bg-white/80',
    surfaceHover: 'hover:bg-emerald-50/80',
    border: 'border-emerald-200/50',
    borderHover: 'hover:border-emerald-400/50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    cardGradient: 'from-white/90 to-emerald-50/50',
    heroBg: 'from-emerald-50 via-teal-50 to-emerald-100',
    inputBorder: 'border-emerald-300',
    inputBorderHover: 'hover:border-emerald-500',
    progressBg: 'bg-emerald-100',
    buttonSecondary: 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200',
    glowColor: 'emerald-400/30',
    featureCardGradient: (color) => `from-${color}-100/80 to-${color}-50/40`,
    shadow: 'shadow-2xl shadow-emerald-200/20',
    particleOpacity: 0.3,
    gridOpacity: 0.05,
    blurAmount: 'backdrop-blur-2xl',
    iconBg: 'bg-emerald-100',
    navBg: 'bg-white/80',
    badgeBg: 'bg-emerald-100',
    badgeBorder: 'border-emerald-300',
    previewBg: 'bg-gray-100',
    listItemBg: 'bg-emerald-50/50',
    listItemHover: 'hover:bg-emerald-100/80',
    glowOrb1: 'bg-emerald-300/30',
    glowOrb2: 'bg-teal-300/25',
    glowOrb3: 'bg-emerald-200/30',
  }
};

// ============================================================================
// ANIMATED BACKGROUND PARTICLES
// ============================================================================

function ParticleField({ isDark }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = isDark ? 
          (Math.random() > 0.5 ? "99, 102, 241" : "16, 185, 129") :
          (Math.random() > 0.5 ? "5, 150, 105" : "20, 184, 166");
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }
    }
    
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${isDark ? '16, 185, 129' : '5, 150, 105'}, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [isDark]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: isDark ? 0.6 : 0.4 }}
    />
  );
}

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = parseFloat(value);
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start * 10) / 10);
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  
  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

// ============================================================================
// SCANNING EFFECT
// ============================================================================

function ScanningEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.8)]"
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-emerald-500/5" />
    </div>
  );
}

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ["#10b981", "#14b8a6", "#34d399", "#6ee7b7"][i % 4],
            left: `${Math.random() * 100}%`,
            top: -10,
          }}
          animate={{
            y: [0, 400 + Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DiseaseDetectionContent() {
  const [result, setResult] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [image, setImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  
  const theme = isDark ? themes.dark : themes.light;
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Listen for theme changes from Header component
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          setIsDark(isDarkMode);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // Initial check
    setIsDark(document.documentElement.classList.contains('dark'));
    
    return () => observer.disconnect();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      setError("Please upload a valid image file");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
    setError(null);
    setResult(null);
    setHasAnalyzed(false);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setError(null);
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const prediction = await predictDisease(uploadedFile, 3);

      const predictionList = Array.isArray(prediction?.predictions)
        ? prediction.predictions
        : Array.isArray(prediction?.all_predictions)
          ? prediction.all_predictions
          : [];

      const normalizedPredictions = predictionList.map((item) => {
        const disease = item?.disease || item?.class || item?.label || "Unknown";
        const confidenceValue = item?.confidence_percent || item?.confidence || item?.score;
        const confidencePercent = typeof confidenceValue === "number"
          ? `${(confidenceValue * 100).toFixed(1)}%`
          : (confidenceValue || "0%");

        return { disease, confidence_percent: confidencePercent };
      });

      if (!normalizedPredictions.length && (prediction?.class || prediction?.disease || prediction?.label)) {
        const fallbackDisease = prediction?.disease || prediction?.class || prediction?.label || "Unknown";
        const fallbackConfidence = prediction?.confidence_percent || prediction?.confidence || prediction?.score || "0%";
        normalizedPredictions.push({ disease: fallbackDisease, confidence_percent: fallbackConfidence });
      }

      const topPrediction = prediction?.top_prediction
        ? {
            disease: prediction.top_prediction.disease || prediction.top_prediction.class || "Unknown",
            confidence_percent: prediction.top_prediction.confidence_percent || prediction.top_prediction.confidence || "0%",
          }
        : normalizedPredictions[0] || { disease: "Unknown", confidence_percent: "0%" };

      const shouldFetchDiseaseInfo = topPrediction?.disease && topPrediction.disease !== "Unknown";
      const diseaseInfo = shouldFetchDiseaseInfo
        ? await getDiseaseInfo(topPrediction.disease).catch(() => null)
        : null;

      clearInterval(progressInterval);
      setScanProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      setResult({
        top_prediction: topPrediction,
        disease_info: {
          severity: diseaseInfo?.severity || "Unknown",
          symptoms: diseaseInfo?.symptoms || [],
          treatment: diseaseInfo?.treatment || [],
        },
        all_predictions: normalizedPredictions.length ? normalizedPredictions : [topPrediction],
      });
      setHasAnalyzed(true);
    } catch (apiError) {
      clearInterval(progressInterval);
      setScanProgress(0);
      setResult(null);
      setHasAnalyzed(false);
      setError(apiError?.message || "Failed to analyze the image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setHasAnalyzed(false);
    setImage(null);
    setUploadedFile(null);
    setError(null);
    setScanProgress(0);
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.12, delayChildren: 0.1 } 
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-colors duration-700 selection:bg-emerald-500/30 overflow-x-hidden ${isDark ? 'bg-[#0a0f0e] text-white' : 'bg-[#f8faf7] text-gray-900'}`}
    >
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 z-50 origin-left"
        style={{ scaleX }}
      />
      
      {/* Particle Background */}
      <ParticleField isDark={isDark} />
      
      {/* Ambient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: isDark ? [0.3, 0.5, 0.3] : [0.2, 0.35, 0.2],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${theme.glowOrb1}`}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: isDark ? [0.2, 0.4, 0.2] : [0.15, 0.3, 0.15],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className={`absolute bottom-20 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] ${theme.glowOrb2}`}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: isDark ? [0.15, 0.25, 0.15] : [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] ${theme.glowOrb3}`}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-24 pt-24 md:pt-28">
        
        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${theme.heroBg} p-10 md:p-20 shadow-2xl border ${isDark ? 'border-emerald-500/20' : 'border-emerald-300/30'} ${theme.blurAmount} transition-colors duration-700`}
        >
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0" style={{
            opacity: isDark ? 0.03 : 0.06,
            backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-10 right-20 ${isDark ? 'opacity-20' : 'opacity-30'}`}
          >
            <Scan className="w-24 h-24 text-emerald-400" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`absolute bottom-10 left-20 ${isDark ? 'opacity-20' : 'opacity-30'}`}
          >
            <Microscope className="w-20 h-20 text-teal-400" />
          </motion.div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 px-5 py-2.5 ${theme.badgeBg} border ${theme.badgeBorder} rounded-full mb-8 transition-colors duration-700`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </motion.div>
              <span className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'} tracking-wide uppercase transition-colors duration-700`}>
                Next-Gen AI Disease Detection
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight"
            >
              <span className={`bg-gradient-to-r ${isDark ? 'from-white via-emerald-100 to-emerald-200' : 'from-gray-900 via-emerald-800 to-gray-900'} bg-clip-text text-transparent transition-all duration-700`}>
                Detect Cotton
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Leaf Diseases
              </span>
              <br />
              <span className={isDark ? 'text-white/90' : 'text-gray-800 transition-colors duration-700'}>
                Instantly
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className={`mt-8 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-emerald-100/70' : 'text-gray-600 transition-colors duration-700'}`}
            >
              Harness the power of deep learning to identify cotton leaf diseases with 
              unprecedented accuracy. Upload an image and receive clinical-grade analysis 
              in seconds.
            </motion.p>

            <motion.div 
              variants={staggerContainer}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {[
                { icon: Zap, text: "99.2% Accuracy", color: "text-amber-400" },
                { icon: Brain, text: "Deep Learning", color: "text-emerald-400" },
                { icon: Shield, text: "Secure & Private", color: "text-teal-400" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex items-center gap-2.5 px-5 py-3 border backdrop-blur-sm rounded-2xl transition-all duration-300 cursor-default ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10' 
                      : 'bg-white/60 border-emerald-200 text-gray-800 hover:bg-white/90'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12">
              <motion.a
                href="#upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
              >
                Start Analysis
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.a>
            </motion.div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${isDark ? 'from-[#0a0f0e]' : 'from-[#f8faf7]'} to-transparent transition-colors duration-700`} />
        </motion.section>

        {/* ================================================================ */}
        {/* STATS BAR */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: "99.2", suffix: "%", label: "Detection Accuracy", icon: Activity },
            { value: "50", suffix: "K+", label: "Images Trained", icon: Brain },
            { value: "2", suffix: "s", label: "Analysis Speed", icon: Zap },
            { value: "24", suffix: "/7", label: "Always Available", icon: Waves },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-sm group transition-all duration-300 ${
                isDark 
                  ? 'bg-white/[0.03] border-white/[0.08] hover:border-emerald-500/30' 
                  : 'bg-white/70 border-emerald-200/50 hover:border-emerald-400/50'
              }`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors`} />
              <stat.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'} mb-3 transition-colors`} />
              <div className={`text-3xl md:text-4xl font-bold ${theme.text} transition-colors duration-700`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className={`mt-1 text-sm ${theme.textSecondary} transition-colors duration-700`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================================================================ */}
        {/* UPLOAD & HOW IT WORKS */}
        {/* ================================================================ */}
        <div id="upload" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Upload Section - Takes 3 columns */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-3"
          >
            <motion.div 
              variants={fadeUp}
              className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-b ${theme.cardGradient} border ${theme.border} p-8 md:p-10 backdrop-blur-xl shadow-2xl transition-colors duration-700`}
            >
              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                  className="p-3.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl"
                >
                  <Camera className="w-7 h-7 text-emerald-400" />
                </motion.div>
                <div>
                  <h2 className={`text-2xl md:text-3xl font-bold ${theme.text} transition-colors duration-700`}>
                    Upload Leaf Image
                  </h2>
                  <p className={`text-sm ${theme.textTertiary} mt-1 transition-colors duration-700`}>
                    Supported: JPG, PNG, WEBP — Max 10MB
                  </p>
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center transition-all duration-300 cursor-pointer overflow-hidden
                  ${dragActive 
                    ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]" 
                    : `${theme.inputBorder} ${theme.inputBorderHover} ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-emerald-50/50'}`
                  }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                
                <motion.div 
                  animate={dragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="flex flex-col items-center gap-5 relative z-10"
                >
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center`}
                  >
                    <Upload className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <div>
                    <p className={`font-medium text-lg ${isDark ? 'text-white/90' : 'text-gray-800'} transition-colors duration-700`}>
                      {dragActive ? "Release to Upload" : "Drop your image here"}
                    </p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-white/40' : 'text-gray-500'} transition-colors duration-700`}>
                      or click to browse from your device
                    </p>
                  </div>
                </motion.div>

                {dragActive && (
                  <motion.div
                    layoutId="dragGlow"
                    className="absolute inset-0 rounded-3xl border-2 border-emerald-400/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className={`mt-5 p-4 border rounded-2xl flex items-center gap-3 overflow-hidden transition-colors duration-300 ${
                      isDark 
                        ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                        : 'bg-red-50 border-red-300 text-red-700'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {image && !analyzing && !result && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 space-y-5"
                  >
                    <div className={`relative rounded-2xl overflow-hidden border ${isDark ? 'bg-black/40 border-white/10' : 'bg-gray-200 border-gray-300'} transition-colors duration-700`}>
                      <img src={image} alt="Preview" className="w-full max-h-80 object-contain" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleReset}
                        className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors z-10"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-sm text-white/70">{uploadedFile?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <Scan className="w-5 h-5" />
                        Analyze Disease
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className={`px-5 py-4 border rounded-2xl transition ${theme.buttonSecondary}`}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {analyzing && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 space-y-6"
                  >
                    <div className={`relative rounded-2xl overflow-hidden border ${isDark ? 'bg-black/40 border-emerald-500/30' : 'bg-gray-100 border-emerald-400/50'} transition-colors duration-700`}>
                      <img src={image} alt="Analyzing" className="w-full max-h-80 object-contain opacity-50" />
                      <ScanningEffect />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-24 h-24 border-2 border-emerald-400/50 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                            className="w-16 h-16 border border-emerald-400/30 rounded-full flex items-center justify-center"
                          >
                            <Brain className="w-8 h-8 text-emerald-400" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className={`font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'} transition-colors`}>Analyzing image patterns...</span>
                        <span className={isDark ? 'text-white/50' : 'text-gray-500 transition-colors'}>{Math.round(scanProgress)}%</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-emerald-100'} transition-colors`}>
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex gap-2 justify-center mt-4">
                        {["Preprocessing", "Feature Extraction", "Classification", "Finalizing"].map((step, i) => (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0.3 }}
                            animate={{ 
                              opacity: scanProgress > (i + 1) * 22 ? 1 : 0.3,
                              scale: scanProgress > (i + 1) * 22 ? 1.1 : 1
                            }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              scanProgress > (i + 1) * 22 
                                ? `bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ${isDark ? '' : 'bg-emerald-100 text-emerald-700 border-emerald-400'}` 
                                : isDark 
                                  ? 'bg-white/5 text-white/30 border border-white/10'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {step}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* How It Works - Takes 2 columns */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-2"
          >
            <motion.div 
              variants={fadeUp}
              className={`h-full rounded-[2rem] bg-gradient-to-b ${theme.cardGradient} border ${theme.border} p-8 md:p-10 backdrop-blur-xl relative overflow-hidden transition-colors duration-700`}
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-[80px]" />
              
              <h3 className={`text-2xl font-bold ${theme.text} mb-2 transition-colors duration-700`}>How It Works</h3>
              <p className={`${theme.textTertiary} text-sm mb-10 transition-colors duration-700`}>
                Powered by EfficientNetB3 on SAR-CLD-2024 dataset
              </p>
              
              <div className="space-y-0">
                {[
                  { step: "Image Preprocessing", desc: "Enhancement, normalization & augmentation", icon: Camera, color: "from-emerald-500 to-emerald-600" },
                  { step: "Neural Inference", desc: "Deep convolutional feature extraction", icon: Brain, color: "from-teal-500 to-teal-600" },
                  { step: "Pattern Recognition", desc: "Multi-class disease classification", icon: BarChart3, color: "from-cyan-500 to-cyan-600" },
                  { step: "Smart Recommendations", desc: "Treatment & prevention strategies", icon: Shield, color: "from-emerald-600 to-teal-600" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    variants={fadeUp}
                    className="relative flex gap-5 pb-10 last:pb-0 group"
                  >
                    {idx < 3 && (
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: idx * 0.2 }}
                        className={`absolute left-5 top-12 w-px bg-gradient-to-b ${isDark ? 'from-emerald-500/50' : 'from-emerald-400/50'} to-transparent transition-colors`}
                      />
                    )}
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg shrink-0`}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    
                    <div className="pt-1">
                      <h4 className={`font-semibold ${isDark ? 'text-white group-hover:text-emerald-300' : 'text-gray-900 group-hover:text-emerald-700'} transition-colors`}>
                        {item.step}
                      </h4>
                      <p className={`text-sm mt-1 leading-relaxed ${theme.textSecondary} transition-colors duration-700`}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ================================================================ */}
        {/* RESULT DISPLAY */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <Confetti />
              
              <div className={`rounded-[2.5rem] bg-gradient-to-b ${theme.cardGradient} border ${isDark ? 'border-emerald-500/30' : 'border-emerald-300/40'} p-8 md:p-14 backdrop-blur-xl shadow-2xl ${theme.shadow} overflow-hidden transition-colors duration-700`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-full mb-6 transition-colors duration-700 ${
                        isDark 
                          ? 'bg-emerald-500/15 border-emerald-500/40' 
                          : 'bg-emerald-100 border-emerald-400'
                      }`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'} tracking-wide uppercase transition-colors`}>
                        Analysis Complete
                      </span>
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`text-4xl md:text-5xl font-bold ${theme.text} transition-colors duration-700`}
                    >
                      Diagnostic Report
                    </motion.h2>
                  </div>

                  {/* Top Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    {[
                      { label: "Detected Disease", value: result.top_prediction.disease, icon: Leaf, gradient: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400" },
                      { label: "Confidence Score", value: result.top_prediction.confidence_percent, icon: TrendingUp, gradient: "from-teal-500/20 to-teal-600/10", iconColor: "text-teal-400" },
                      { label: "Severity Level", value: result.disease_info.severity, icon: AlertCircle, gradient: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-400" }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient} border ${isDark ? 'border-white/10' : 'border-gray-200'} p-8 text-center backdrop-blur-sm transition-colors`}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                        >
                          <item.icon className={`w-10 h-10 ${item.iconColor} mx-auto mb-4`} />
                        </motion.div>
                        <p className={`text-sm uppercase tracking-wider font-medium ${isDark ? 'text-white/50' : 'text-gray-500'} transition-colors`}>{item.label}</p>
                        <p className={`text-3xl font-bold ${theme.text} mt-2 transition-colors duration-700`}>{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Symptoms & Treatment */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className={`rounded-3xl border p-8 transition-colors duration-700 ${
                        isDark 
                          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20' 
                          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      }`}
                    >
                      <h3 className={`font-bold text-xl flex items-center gap-3 mb-6 ${theme.text}`}>
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-amber-200'}`}>
                          <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                        Observed Symptoms
                      </h3>
                      <ul className="space-y-4">
                        {result.disease_info.symptoms.map((symptom, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                              isDark 
                                ? 'bg-white/5 hover:bg-white/10' 
                                : 'bg-white/60 hover:bg-white/90'
                            }`}
                          >
                            <span className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            <span className={isDark ? 'text-white/80' : 'text-gray-700'}>{symptom}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className={`rounded-3xl border p-8 transition-colors duration-700 ${
                        isDark 
                          ? 'bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border-teal-500/20' 
                          : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-300'
                      }`}
                    >
                      <h3 className={`font-bold text-xl flex items-center gap-3 mb-6 ${theme.text}`}>
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-200'}`}>
                          <Shield className="w-6 h-6 text-teal-500" />
                        </div>
                        Recommended Actions
                      </h3>
                      <ul className="space-y-4">
                        {result.disease_info.treatment.map((action, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + idx * 0.1 }}
                            className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                              isDark 
                                ? 'bg-white/5 hover:bg-white/10' 
                                : 'bg-white/60 hover:bg-white/90'
                            }`}
                          >
                            <span className="w-2 h-2 mt-2 rounded-full bg-teal-400 shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                            <span className={isDark ? 'text-white/80' : 'text-gray-700'}>{action}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* All Predictions */}
                  {result.all_predictions && result.all_predictions.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className={`rounded-3xl border p-8 transition-colors duration-700 ${
                        isDark 
                          ? 'bg-white/[0.03] border-white/[0.1]' 
                          : 'bg-white/60 border-gray-200'
                      }`}
                    >
                      <h3 className={`font-bold text-xl mb-6 flex items-center gap-3 ${theme.text}`}>
                        <BarChart3 className="w-6 h-6 text-emerald-400" />
                        Classification Probabilities
                      </h3>
                      <div className="space-y-4">
                        {result.all_predictions.map((pred, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + idx * 0.1 }}
                            className="group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-medium group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                                {pred.disease}
                              </span>
                              <span className={`text-sm font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {pred.confidence_percent}
                              </span>
                            </div>
                            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: pred.confidence_percent }}
                                transition={{ delay: 1.2 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full relative"
                                style={{
                                  background: idx === 0 
                                    ? "linear-gradient(90deg, #10b981, #2dd4bf)" 
                                    : `linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'})`
                                }}
                              >
                                {idx === 0 && (
                                  <motion.div
                                    animate={{ x: ["0%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  />
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className={`mt-10 w-full py-4 border-2 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/60' 
                        : 'border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500/60'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Analyze Another Sample
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================ */}
        {/* FEATURES GRID */}
        {/* ================================================================ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { 
              icon: Shield, 
              title: "Clinical Precision", 
              text: "Trained on 50,000+ expert-annotated images with rigorous validation protocols",
              gradient: "from-emerald-500/20 to-emerald-600/5",
              lightGradient: "from-emerald-100 to-emerald-50",
              border: isDark ? "border-emerald-500/20" : "border-emerald-300/40"
            },
            { 
              icon: Zap, 
              title: "Lightning Fast", 
              text: "Edge-optimized inference delivers sub-second results on any modern device",
              gradient: "from-amber-500/20 to-amber-600/5",
              lightGradient: "from-amber-100 to-amber-50",
              border: isDark ? "border-amber-500/20" : "border-amber-300/40"
            },
            { 
              icon: Droplets, 
              title: "Zero Cost", 
              text: "Completely free agricultural technology for farmers and researchers worldwide",
              gradient: "from-teal-500/20 to-teal-600/5",
              lightGradient: "from-teal-100 to-teal-50",
              border: isDark ? "border-teal-500/20" : "border-teal-300/40"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-b border p-8 backdrop-blur-sm group transition-colors duration-700 ${
                isDark 
                  ? `${feature.gradient} ${feature.border}` 
                  : `${feature.lightGradient} ${feature.border}`
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors ${
                isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-white/40 group-hover:bg-white/60'
              }`} />
              
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 mb-6 border rounded-2xl flex items-center justify-center transition-colors ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-gray-200'
                }`}
              >
                <feature.icon className="w-8 h-8 text-emerald-500" />
              </motion.div>
              
              <h3 className={`text-2xl font-bold mb-3 ${theme.text} transition-colors duration-700`}>{feature.title}</h3>
              <p className={`leading-relaxed ${theme.textSecondary} transition-colors duration-700`}>{feature.text}</p>
              
              <motion.div
                className={`mt-6 flex items-center gap-2 text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity`}
                initial={false}
              >
                Learn more <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* ================================================================ */}
        {/* CTA SECTION */}
        {/* ================================================================ */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-12 md:p-20 text-center shadow-2xl"
        >
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 right-0 w-80 h-80 bg-teal-300/20 rounded-full blur-[80px]"
            />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Protect Your Crops With AI
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-emerald-100/80 max-w-xl mx-auto mb-10"
            >
              Early detection prevents crop loss, reduces chemical usage, and maximizes yield quality. Start analyzing today.
            </motion.p>
            <motion.a
              href="#upload"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-xl"
            >
              Get Started Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.a>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`text-center pb-8 pt-4 border-t transition-colors duration-700 ${
            isDark ? 'border-white/5' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-emerald-500" />
            <span className={`font-bold ${theme.text} transition-colors duration-700`}>CottonGuard AI</span>
          </div>
          <p className={`text-sm ${theme.textSecondary} transition-colors duration-700`}>
            Advanced agricultural intelligence for sustainable farming
          </p>
        </motion.footer>
      </div>
    </div>
  );
}