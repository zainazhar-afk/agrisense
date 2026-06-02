"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Leaf, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Camera,
  MessageSquare,
  Users,
  BarChart3,
  Scan,
  ArrowUpRight
} from "lucide-react";

// ============================================================================
// CUSTOM CSS FOR CLAYMORPHISM & ANIMATIONS
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @keyframes softBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    @keyframes clayRipple {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    .animate-softBounce {
      animation: softBounce 0.4s ease-out;
    }
    .clay-outset {
      box-shadow: 
        8px 8px 16px rgba(163, 177, 198, 0.6), 
        -8px -8px 16px rgba(255, 255, 255, 0.9),
        inset 1px 1px 1px rgba(255, 255, 255, 0.6);
    }
    .dark .clay-outset {
      box-shadow: 
        8px 8px 16px rgba(0, 0, 0, 0.5), 
        -8px -8px 16px rgba(60, 70, 80, 0.3),
        inset 1px 1px 1px rgba(255, 255, 255, 0.05);
    }
    .clay-inset {
      box-shadow: 
        inset 6px 6px 12px rgba(163, 177, 198, 0.5), 
        inset -6px -6px 12px rgba(255, 255, 255, 0.8);
    }
    .dark .clay-inset {
      box-shadow: 
        inset 6px 6px 12px rgba(0, 0, 0, 0.5), 
        inset -6px -6px 12px rgba(60, 70, 80, 0.2);
    }
    .clay-button {
      box-shadow: 
        4px 4px 8px rgba(163, 177, 198, 0.5), 
        -4px -4px 8px rgba(255, 255, 255, 0.8),
        inset 1px 1px 1px rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
    }
    .clay-button:hover {
      box-shadow: 
        6px 6px 12px rgba(163, 177, 198, 0.6), 
        -6px -6px 12px rgba(255, 255, 255, 0.9),
        inset 1px 1px 1px rgba(255, 255, 255, 0.6);
      transform: translateY(-1px);
    }
    .clay-button:active {
      box-shadow: 
        inset 4px 4px 8px rgba(163, 177, 198, 0.4), 
        inset -4px -4px 8px rgba(255, 255, 255, 0.7);
      transform: translateY(0px);
    }
    .dark .clay-button {
      box-shadow: 
        4px 4px 8px rgba(0, 0, 0, 0.4), 
        -4px -4px 8px rgba(60, 70, 80, 0.25),
        inset 1px 1px 1px rgba(255, 255, 255, 0.05);
    }
    .dark .clay-button:hover {
      box-shadow: 
        6px 6px 12px rgba(0, 0, 0, 0.5), 
        -6px -6px 12px rgba(60, 70, 80, 0.3),
        inset 1px 1px 1px rgba(255, 255, 255, 0.08);
    }
    .dark .clay-button:active {
      box-shadow: 
        inset 4px 4px 8px rgba(0, 0, 0, 0.4), 
        inset -4px -4px 8px rgba(60, 70, 80, 0.2);
    }
    .gradient-text {
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #059669 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease infinite;
    }
    .dark .gradient-text {
      background: linear-gradient(135deg, #34d399 0%, #2dd4bf 50%, #34d399 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `}</style>
);

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/disease-detection", label: "Disease Lab", icon: Camera },
  { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/social", label: "Community", icon: Users },
];

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const scrollProgress = useSpring(scrollY, { stiffness: 100, damping: 30 });

  // Track scroll direction for hide/show header
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setMobileMenuOpen(false);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 30);
  });

  // Initialize theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <GlobalStyles />
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
        style={{ 
          scaleX: scrollProgress,
          background: "linear-gradient(90deg, #10b981, #14b8a6, #10b981)"
        }}
      />

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: hidden ? -120 : 0, 
          opacity: hidden ? 0 : 1 
        }}
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white/90 dark:bg-[#0c1412]/90 backdrop-blur-2xl border-b border-emerald-100/50 dark:border-emerald-900/20"
            : "bg-transparent"
        }`}
      >
        {/* Animated Top Gradient Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
          <motion.div
            animate={{ 
              backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
            style={{
              background: "linear-gradient(90deg, transparent, #10b981, #14b8a6, #10b981, transparent)",
              backgroundSize: "200% 100%"
            }}
          />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              opacity: scrolled ? [0.2, 0.4, 0.2] : 0,
              scale: [1, 1.3, 1],
              x: [0, 30, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 right-1/4 w-40 h-40 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ 
              opacity: scrolled ? [0.15, 0.3, 0.15] : 0,
              scale: [1, 1.2, 1],
              x: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -top-5 left-1/3 w-32 h-32 bg-teal-500/20 dark:bg-teal-500/10 rounded-full blur-[60px]"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center clay-button"
                >
                  <Leaf className="w-5 h-5 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold gradient-text tracking-tight">
                    AgriSense
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600/60 dark:text-emerald-400/50 tracking-[0.2em] uppercase -mt-0.5">
                    AI Detection
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation - Claymorphism Pill */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-gray-100/80 dark:bg-gray-800/60 clay-outset backdrop-blur-sm"
            >
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link key={item.href} href={item.href} className="relative">
                    {active && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ borderRadius: 9999 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors duration-300 ${
                        active 
                          ? "text-white shadow-lg" 
                          : "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                      }`}
                    >
                      <motion.div
                        animate={active ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-emerald-500"}`} />
                      </motion.div>
                      <span>{item.label}</span>
                      
                      {/* Hover glow for inactive */}
                      {!active && (
                        <motion.div
                          initial={false}
                          className="absolute inset-0 rounded-full bg-emerald-500/0 hover:bg-emerald-500/5 transition-colors -z-10"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </motion.nav>

            {/* Right Controls */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="relative w-10 h-10 rounded-full clay-button flex items-center justify-center overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "dark" ? (
                    <motion.div
                      key="moon"
                      initial={{ y: 20, rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -20, rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    >
                      <Moon className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ y: 20, rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -20, rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-full border border-emerald-500/0 hover:border-emerald-500/30 transition-colors" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                className="lg:hidden relative w-10 h-10 rounded-full clay-button flex items-center justify-center"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: -90, scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Desktop CTA */}
              <motion.a
                href="/disease-detection"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-semibold text-sm clay-button"
              >
                <Scan className="w-4 h-4" />
                <span>Start Scan</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowUpRight className="w-3 h-3" />
                </motion.div>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-[55] lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-[#0f1a18] z-[56] lg:hidden overflow-hidden shadow-2xl"
            >
              {/* Decorative Clay Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]"
                />
                <motion.div
                  animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                  className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-[80px]"
                />
              </div>

              <div className="relative z-10 flex flex-col h-full p-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center clay-button">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-lg gradient-text">AgriSense</span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase">AI Detection</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMenu}
                    className="w-10 h-10 rounded-full clay-button flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex-1 space-y-3">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 25 }}
                      >
                        <Link
                          href={item.href}
                          onClick={toggleMenu}
                          className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                            active
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 clay-outset"
                              : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 clay-outset"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                active 
                                  ? "bg-white/20" 
                                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </motion.div>
                            <div>
                              <span className="font-semibold block">{item.label}</span>
                              <span className={`text-xs ${active ? "text-emerald-100" : "text-gray-400"}`}>
                                {active ? "Currently viewing" : "Navigate to page"}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${active ? "text-white" : "text-gray-400"}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="mt-auto pt-6 border-t border-gray-100 dark:border-white/10"
                >
                  <Link
                    href="/disease-detection"
                    onClick={toggleMenu}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg clay-button"
                  >
                    <Scan className="w-6 h-6" />
                    Start Analysis
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Free agricultural intelligence for everyone
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}