"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  const variants = {
    default: "glass-morphism text-slate-300 border-white/10",
    success: "bg-green-500/20 text-green-400 border-green-500/30 shadow-green-500/20",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20",
    info: "bg-blush-500/20 text-blush-400 border-blush-500/30 shadow-blush-500/20"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  };

  return (
    <motion.span
      className={`rounded-full font-bold border backdrop-blur-md ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 0 20px rgba(236, 64, 122, 0.4)"
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.span>
  );
}
