"use client";

import { motion } from "framer-motion";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  displayName?: string | null;
  revealed?: boolean;
}

export default function Avatar({ name, size = "md", displayName, revealed = false }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-xl",
    xl: "h-20 w-20 text-2xl"
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      whileHover={{ scale: 1.1, rotateZ: 5 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`
          ${sizes[size]} rounded-full 
          bg-gradient-to-br from-blush-400 via-blush-500 to-purple-500 
          flex items-center justify-center font-bold text-white 
          shadow-lg shadow-blush-500/50 flex-shrink-0
          relative overflow-hidden
        `}
        whileHover={{
          boxShadow: "0 0 30px rgba(236, 64, 122, 0.6), 0 0 60px rgba(236, 64, 122, 0.3)",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, #f97393, #a855f7)",
            "linear-gradient(135deg, #ec407a, #c084fc)",
            "linear-gradient(135deg, #f97393, #a855f7)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <span className="relative z-10">{name.charAt(0).toUpperCase()}</span>
      </motion.div>
      {revealed && displayName && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-blush-400 font-semibold text-center glow-text"
        >
          {displayName}
        </motion.p>
      )}
    </motion.div>
  );
}
