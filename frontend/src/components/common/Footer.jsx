import { motion } from "framer-motion";
import Link from "next/link";
import { RiPlantLine } from "react-icons/ri";
import { HiChartBar, HiCamera, HiChatAlt2, HiUserGroup } from "react-icons/hi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiChartBar },
  { href: "/disease-detection", label: "Disease Detection", icon: HiCamera },
  { href: "/soil-monitor", label: "Soil Monitor", icon: RiPlantLine },
  { href: "/assistant", label: "AI Assistant", icon: HiChatAlt2 },
  { href: "/social", label: "Community", icon: HiUserGroup },
];

export const Footer = () => {
  return (
    <footer className="bg-clay-surface relative overflow-hidden">
      {/* Decorative Clay Element - Top */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-clay-surface shadow-clay-inset opacity-50" />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section - Claymorphism Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-clay-surface rounded-[24px] p-6 shadow-clay-md hover:shadow-clay-lg transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-clay-sm group-hover:shadow-clay-md transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiPlantLine className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                  AgriSense AI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Empowering Farmers Since 2025
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Harnessing AI, IoT, and data analytics to revolutionize
              agriculture with intelligent insights and sustainable solutions.
            </p>
            
            {/* Social Icons with Claymorphism */}
            <div className="flex gap-3 mt-6">
              {["🌾", "🚜", "🌱", "🌽"].map((icon, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-[16px] bg-clay-surface shadow-clay-sm flex items-center justify-center text-lg cursor-pointer hover:shadow-clay-md transition-all duration-200"
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links - Claymorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-clay-surface rounded-[24px] p-6 shadow-clay-md hover:shadow-clay-lg transition-all duration-300"
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-emerald-500" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {navItems.map((item, idx) => (
                <motion.li 
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-3 group transition-all duration-300 relative"
                  >
                    <span className="w-6 h-6 rounded-[12px] bg-clay-surface shadow-clay-sm flex items-center justify-center group-hover:shadow-clay-md group-hover:scale-110 transition-all duration-300">
                      <item.icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info - Claymorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-clay-surface rounded-[24px] p-6 shadow-clay-md hover:shadow-clay-lg transition-all duration-300"
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-emerald-500" />
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              {[
                { icon: "📧", text: "umairim@gmail.com", delay: 0 },
                { icon: "📱", text: "+92 - 309 - 5330695", delay: 0.1 },
                { icon: "📍", text: "University of Agriculture, Fsd", delay: 0.2 },
              ].map((item, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + item.delay }}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-[16px] bg-clay-surface shadow-clay-sm flex items-center justify-center text-base group-hover:shadow-clay-md group-hover:scale-110 transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Project Info - Claymorphism Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-clay-surface rounded-[24px] p-6 shadow-clay-md hover:shadow-clay-lg transition-all duration-300"
          >
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4 text-lg flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-emerald-500" />
              Project Info
            </h4>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-clay-surface rounded-[20px] p-3 shadow-clay-inset"
              >
                <strong className="text-emerald-700 dark:text-emerald-400">Final Year Project 2025</strong>
                <br />
                Computer Science
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-clay-surface rounded-[20px] p-3 shadow-clay-inset"
              >
                <strong className="text-emerald-700 dark:text-emerald-400">Built With:</strong>
                <br />
                Next.js • TensorFlow • IoT • PostgreSQL
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-emerald-100/50 dark:border-emerald-900/30"
              >
                <p className="text-xs">
                  © {new Date().getFullYear()} AgriSense AI
                  <br />
                  All rights reserved
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar with Claymorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-emerald-100/50 dark:border-emerald-900/30"
        >
          <div className="bg-clay-surface rounded-[32px] p-6 shadow-clay-inset text-center">
            <motion.p 
              className="text-sm text-gray-600 dark:text-gray-400"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Developed by{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Muhammad Umair & Zain Azhar
              </span>{" "}
              with{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block"
              >
                ❤️
              </motion.span>{" "}
              <br />
              for sustainable agriculture worldwide.
            </motion.p>
            
            {/* Decorative Clay Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Clay Elements - Bottom */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-clay-surface shadow-clay-inset opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-[64px] bg-clay-surface shadow-clay-inset opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-[64px] bg-clay-surface shadow-clay-inset opacity-20" />
    </footer>
  );
};