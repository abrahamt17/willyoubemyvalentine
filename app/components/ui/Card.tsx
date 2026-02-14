"use client";

import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
  delay?: number;
}

export default function Card({ 
  children, 
  className = "", 
  hover = true, 
  style,
  delay = 0 
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={hover ? {
        scale: 1.02,
        y: -5,
        rotateY: 2,
        rotateX: 2,
        transition: { duration: 0.3 }
      } : {}}
      className={`
        rounded-3xl p-6 transition-all duration-500
        glass-morphism
        shadow-lg shadow-black/20
        transform-3d
        ${hover ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative h-full w-full">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-3xl shimmer opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
