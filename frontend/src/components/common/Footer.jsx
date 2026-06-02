"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Heart,
  ChevronUp,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Sprout,
  Cpu,
  Database,
  Server,
  Layers,
  ArrowUp
} from "lucide-react";

// ============================================================================
// SELF-CONTAINED CLAYMORPHISM STYLES
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
      50% { transform: translateY(-10px) rotate(2deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    @keyframes wave {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .clay-outset {
      background: linear-gradient(145deg, #f0f0f0, #ffffff);
      box-shadow: 8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.9), inset 1px 1px 1px rgba(255,255,255,0.8);
    }
    .dark .clay-outset {
      background: linear-gradient(145deg, #151e1c, #1a2422);
      box-shadow: 8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(60,70,80,0.25), inset 1px 1px 1px rgba(255,255,255,0.05);
    }
    .clay-inset {
      background: #e8e8e8;
      box-shadow: inset 6px 6px 12px rgba(163,177,198,0.5), inset -6px -6px 12px rgba(255,255,255,0.8);
    }
    .dark .clay-inset {
      background: #121a18;
      box-shadow: inset 6px 6px 12px rgba(0,0,0,0.5), inset -6px -6px 12px rgba(60,70,80,0.2);
    }
    .clay-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .clay-button:hover {
      transform: translateY(-2px);
    }
    .clay-button:active {
      transform: translateY(0px);
    }
    .gradient-text-anim {
      background: linear-gradient(90deg, #059669, #0d9488, #10b981, #059669);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientFlow 4s ease infinite;
    }
    .dark .gradient-text-anim {
      background: linear-gradient(90deg, #34d399, #2dd4bf, #6ee7b7, #34d399);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .wave-bg {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2310b981' fill-opacity='0.1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
      background-size: 1440px 320px;
      animation: wave 20s linear infinite;
    }
    .dark .wave-bg {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2310b981' fill-opacity='0.05' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
      background-size: 1440px 320px;
    }
  `}</style>
);

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navItems = [
  { href: "/dashboard", label: "Insights", icon: Layers },
  { href: "/disease-detection", label: "Disease Lab", icon: Sprout },
  { href: "/assistant", label: "AI Assistant", icon: Cpu },
  { href: "/social", label: "Community", icon: Heart },
];

const techStack = [
  { name: "Next.js", icon: ExternalLink },
  { name: "TensorFlow", icon: Cpu },
  { name: "FastAPI", icon: Server },
  { name: "PostgreSQL", icon: Database },
];

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:umairim@gmail.com", label: "Email" },
];

// ============================================================================
// ANIMATED COUNTER FOR YEAR
// ============================================================================

function AnimatedYear() {
  const [year, setYear] = useState(2025);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <span>{year}</span>;
}

// ============================================================================
// MAIN FOOTER COMPONENT
// ============================================================================

export default function Footer() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const footerY = useTransform(scrollYProgress, [0.7, 1], [100, 0]);
  const footerOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <GlobalStyles />

      {/* Wave Separator */}
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 wave-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-[#0a0f0e]" />
      </div>

      <motion.footer
        style={{ y: footerY, opacity: footerOpacity }}
        className="relative bg-gray-50 dark:bg-[#0a0f0e] overflow-hidden"
      >
        {/* Ambient Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-40 -right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-600/10 rounded-full blur-[100px]"
          />
        </div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 rotate-12 hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 left-[10%] w-12 h-12 rounded-xl bg-teal-500/5 border border-teal-500/10 -rotate-12 hidden lg:block"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
            
            {/* Brand Column - Spans 4 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              className="lg:col-span-4"
            >
              <div className="clay-outset rounded-[2rem] p-8 h-full flex flex-col">
                <Link href="/" className="flex items-center gap-3 group mb-6">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <Leaf className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold gradient-text-anim">AgriSense AI</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 tracking-widest uppercase font-medium">
                      Smart Farming
                    </p>
                  </div>
                </Link>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 flex-1">
                  Harnessing the power of artificial intelligence and decision intelligence 
                  to modernize agriculture with clear insights, early disease detection, 
                  and sustainable outcomes for farmers worldwide.
                </p>

                {/* Social Icons */}
                <div className="flex gap-3">
                  {socialLinks.map((social, idx) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                      whileHover={{ y: -4, scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl clay-outset clay-button flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Links - Spans 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
              className="lg:col-span-3"
            >
              <div className="clay-outset rounded-[2rem] p-8 h-full">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + idx * 0.08 }}
                      >
                        <Link
                          href={item.href}
                          className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            active
                              ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300"
                              : "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            active
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                          <ArrowUpRight className={`w-3 h-3 ml-auto transition-all duration-300 ${
                            active ? "text-emerald-500" : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          }`} />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>

            {/* Contact - Spans 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
              className="lg:col-span-3"
            >
              <div className="clay-outset rounded-[2rem] p-8 h-full">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  Contact
                </h4>
                <div className="space-y-4">
                  {[
                    { icon: Mail, text: "umairim@gmail.com", href: "mailto:umairim@gmail.com" },
                    { icon: Phone, text: "+92 309 5330695", href: "tel:+923095330695" },
                    { icon: MapPin, text: "University of Agriculture, Faisalabad", href: "#" },
                  ].map((item, idx) => (
                    <motion.a
                      key={idx}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300 clay-button"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white transition-all duration-300">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {item.text}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Project Info - Spans 2 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
              className="lg:col-span-2"
            >
              <div className="clay-outset rounded-[2rem] p-8 h-full flex flex-col">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  Tech Stack
                </h4>
                
                <div className="space-y-3 mb-6">
                  {techStack.map((tech, idx) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + idx * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.05, x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 cursor-default"
                    >
                      <tech.icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto clay-inset rounded-2xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                    Final Year Project <AnimatedYear />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                    Computer Science
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 mb-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
          />

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              <span>Developed by</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Muhammad Umair & Zain Azhar
              </span>
              <span>with</span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="inline-block text-red-500"
              >
                <Heart className="w-4 h-4 fill-current" />
              </motion.span>
              <span>for sustainable agriculture</span>
            </div>

            <div className="flex items-center gap-6">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                © <AnimatedYear /> AgriSense AI. All rights reserved.
              </p>
              
              {/* Back to Top */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full clay-outset clay-button flex items-center justify-center text-emerald-600 dark:text-emerald-400"
                aria-label="Back to top"
              >
                <ChevronUp className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Large Background Logo Watermark */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.02] select-none">
          <Leaf className="w-[400px] h-[400px]" />
        </div>
      </motion.footer>
    </>
  );
}