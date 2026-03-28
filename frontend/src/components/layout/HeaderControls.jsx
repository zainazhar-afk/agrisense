import { motion } from "framer-motion";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { HiSun, HiMoon } from "react-icons/hi";

export const MobileMenuToggle = ({ isOpen, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="lg:hidden relative w-10 h-10 rounded-[20px] bg-clay-surface shadow-clay-sm hover:shadow-clay-md transition-all duration-300 flex items-center justify-center"
      aria-label="Toggle menu"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {isOpen ? (
          <HiOutlineX className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <HiOutlineMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </motion.div>
      
      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-active:via-emerald-500/20 group-active:animate-ripple rounded-[20px]" />
      </div>
    </motion.button>
  );
};

export const ThemeToggleButton = ({ theme, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative w-10 h-10 rounded-[20px] bg-clay-surface shadow-clay-sm hover:shadow-clay-md transition-all duration-300 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {theme === "dark" ? (
          <HiMoon className="w-5 h-5 text-emerald-400" />
        ) : (
          <HiSun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-emerald-500/10 to-amber-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-active:via-emerald-500/20 group-active:animate-ripple rounded-[20px]" />
      </div>
    </motion.button>
  );
};