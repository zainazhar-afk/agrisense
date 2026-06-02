"use client";

import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import  Header  from "@/components/layout/Header";
import  Footer  from "@/components/common/Footer";
import { Analytics } from "@vercel/analytics/next"
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      setTheme("dark");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(
      new CustomEvent("themeChange", { detail: { theme: newTheme } })
    );
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${manrope.variable} ${sora.variable} app-shell font-sans antialiased text-slate-900 dark:text-slate-50 transition-colors duration-500`}
      >
        {/* Header Component */}
        <Header
          theme={theme}
          mobileMenuOpen={mobileMenuOpen}
          scrolled={scrolled}
          onToggleMenu={toggleMobileMenu}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content with subtle entrance animation */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[calc(100vh-180px)] w-full"
        >
          {children}
        </motion.main>
        <Analytics />
        {/* Footer Component */}
        <Footer />
      </body>
    </html>
  );
}
