import { motion } from "framer-motion";
import Link from "next/link";
import { RiPlantLine } from "react-icons/ri";

export const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="flex items-center gap-3"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative w-10 h-10 rounded-[20px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-clay-md group-hover:shadow-clay-lg transition-all duration-300"
        >
          <RiPlantLine className="w-5 h-5 relative z-10" />
          
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
        
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
            AgriSense AI
          </h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
            Smart Farming Solutions
          </p>
        </div>
      </Link>
    </motion.div>
  );
};