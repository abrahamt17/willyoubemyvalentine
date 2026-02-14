"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon, description, action, children }: PageHeaderProps) {
  return (
    <motion.header
      className="flex flex-col items-center text-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {icon && (
        <motion.div
          className="mb-4"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="text-6xl float-3d">{icon}</span>
        </motion.div>
      )}
      <motion.h1
        className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.span
          className="block text-slate-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.span>
        {subtitle && (
          <motion.span
            className="block text-gradient-animated text-5xl md:text-6xl mt-2 glow-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {subtitle}
          </motion.span>
        )}
      </motion.h1>
      {description && (
        <motion.p
          className="mt-4 max-w-md text-base text-slate-300/90 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {description}
        </motion.p>
      )}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {children}
        </motion.div>
      )}
      {action && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {action}
        </motion.div>
      )}
    </motion.header>
  );
}
