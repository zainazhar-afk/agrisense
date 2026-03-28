import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { DesktopNav, MobileNav } from "./Navigation";
import { MobileMenuToggle, ThemeToggleButton } from "./HeaderControls";
import { ThemeToggle } from "@/components/common";

export const Header = ({
  theme,
  mobileMenuOpen,
  scrolled,
  onToggleMenu,
  onToggleTheme,
}) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-clay-surface shadow-clay-lg" 
          : "bg-clay-surface shadow-clay-md"
      }`}
    >
      {/* Decorative Clay Gradient Border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-b-full" />
      
      {/* Background with Claymorphism Effect */}
      <div className="absolute inset-0 bg-clay-surface opacity-95" />
      
      {/* Decorative Clay Dots Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-500/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-emerald-400/5 blur-xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          
          <DesktopNav />
          
          <div className="flex items-center gap-2">
            <ThemeToggleButton theme={theme} onClick={onToggleTheme} />
            <MobileMenuToggle isOpen={mobileMenuOpen} onClick={onToggleMenu} />
          </div>
        </div>

        <AnimatePresence>
          <MobileNav isOpen={mobileMenuOpen} onClose={onToggleMenu} />
        </AnimatePresence>
      </div>

      {/* Bottom Shadow for Depth */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      )}
    </motion.header>
  );
};