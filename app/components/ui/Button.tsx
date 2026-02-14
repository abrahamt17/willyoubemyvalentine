"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-blush-500 via-blush-400 to-blush-300 text-slate-950 shadow-lg shadow-blush-500/40 hover:shadow-xl hover:shadow-blush-500/50",
    secondary: "glass-morphism border border-white/20 text-slate-100 hover:border-blush-500/50",
    ghost: "glass-morphism hover:bg-white/10"
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { scale: 1.05, y: -2 },
        tap: { scale: 0.95, y: 0 },
      }}
      transition={{ duration: 0.2 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children && <span>{children}</span>}
      </span>
    </motion.button>
  );
}
