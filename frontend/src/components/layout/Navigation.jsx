"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiChartBar,
  HiCamera,
  HiChatAlt2,
  HiUserGroup,
  HiHome,
} from "react-icons/hi";
import { RiPlantLine } from "react-icons/ri";

const navItems = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/dashboard", label: "Dashboard", icon: HiChartBar },
  { href: "/disease-detection", label: "Disease Detection", icon: HiCamera },
  { href: "/soil-monitor", label: "Soil Monitor", icon: RiPlantLine },
  { href: "/assistant", label: "AI Assistant", icon: HiChatAlt2 },
  { href: "/social", label: "Community", icon: HiUserGroup },
];

export const NavItems = ({ mobile = false }) => {
  const pathname = usePathname();

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={item.href}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-[20px] font-medium transition-all duration-300 group ${
                active
                  ? mobile
                    ? "bg-clay-emerald shadow-clay-inset text-emerald-700 dark:text-emerald-300"
                    : "bg-clay-surface shadow-clay-inset text-emerald-600 dark:text-emerald-400"
                  : mobile
                    ? "text-gray-700 dark:text-gray-300 hover:bg-clay-surface hover:shadow-clay-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-clay-surface hover:shadow-clay-sm hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              {/* Claymorphism Icon Container */}
              <div className={`relative ${active ? "animate-softBounce" : ""}`}>
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    active ? "scale-110 text-emerald-600 dark:text-emerald-400" : "group-hover:scale-110"
                  }`}
                />
                
                {/* Glow Effect on Hover */}
                {!active && (
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md" />
                  </div>
                )}
              </div>
              
              <span className="text-sm">{item.label}</span>

              {/* Claymorphism Active Indicator for Desktop */}
              {active && !mobile && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-2 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="absolute inset-0 bg-emerald-400 blur-sm rounded-full" />
                </motion.div>
              )}

              {/* Claymorphism Active Indicator for Mobile */}
              {active && mobile && (
                <motion.div
                  className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ originY: 0.5 }}
                >
                  <div className="absolute inset-0 bg-emerald-400 blur-sm rounded-full" />
                </motion.div>
              )}
              
              {/* Claymorphism Ripple Effect on Click */}
              <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-active:via-emerald-500/20 group-active:animate-ripple rounded-[20px]" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
};

export const DesktopNav = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:flex items-center gap-1 bg-clay-surface rounded-[32px] p-2 shadow-clay-md"
    >
      <NavItems />
    </motion.nav>
  );
};

export const MobileNav = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="lg:hidden absolute top-full left-4 right-4 bg-clay-surface rounded-[32px] shadow-clay-lg p-4 mt-2 z-50"
        >
          {/* Decorative Clay Header */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
            <div className="absolute inset-0 bg-emerald-400 blur-sm rounded-full" />
          </div>
          
          <div className="space-y-2">
            <NavItems mobile />
          </div>
          
          {/* Decorative Clay Elements */}
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-clay-surface shadow-clay-inset opacity-50" />
          <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-clay-surface shadow-clay-inset opacity-30" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-[16px] bg-clay-surface shadow-clay-sm flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-all duration-200 hover:shadow-clay-md hover:scale-110"
          >
            ✕
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

// Optional: Mobile Menu Button with Claymorphism
export const MobileMenuButton = ({ isOpen, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="lg:hidden relative w-10 h-10 rounded-[20px] bg-clay-surface shadow-clay-sm hover:shadow-clay-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5"
    >
      <motion.div
        animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"
      />
      <motion.div
        animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"
      />
      <motion.div
        animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"
      />
      
      {/* Ripple Effect on Click */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-active:via-emerald-500/20 group-active:animate-ripple rounded-[20px]" />
      </div>
    </motion.button>
  );
};

// Optional: Header Logo with Claymorphism
export const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-clay-md group-hover:shadow-clay-lg transition-all duration-300"
        >
          <RiPlantLine className="w-5 h-5" />
        </motion.div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
            AgriSense AI
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Smart Farming Solutions
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

// Optional: Complete Header Component with Claymorphism
export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-gradient-to-b from-white to-emerald-50/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-lg border-b border-emerald-100/50 dark:border-emerald-900/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          
          <DesktopNav />
          
          <MobileMenuButton 
            isOpen={mobileMenuOpen} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
        </div>
        
        <MobileNav 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      </div>
    </motion.header>
  );
};

// Add this to your global CSS for animations
const styles = `
@keyframes softBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-softBounce {
  animation: softBounce 0.3s ease-out;
}

.animate-ripple {
  animation: ripple 0.4s ease-out;
}
`;