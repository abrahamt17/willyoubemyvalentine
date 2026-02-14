"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export default function Input({ label, icon, error, className = "", ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      {label && (
        <motion.label
          className="block text-sm font-semibold text-slate-200 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          {icon && <span className="text-lg">{icon}</span>}
          {label}
        </motion.label>
      )}
      <div className="relative">
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full rounded-2xl border border-white/10 
            glass-morphism
            px-4 py-3 text-sm text-slate-50
            placeholder:text-slate-500
            transition-all duration-300
            focus:outline-none focus:border-blush-500/50 
            focus:ring-2 focus:ring-blush-500/20
            focus:bg-white/10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {focused && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blush-500/10 via-purple-500/10 to-blush-500/10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-red-400 flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export function Textarea({ 
  label, 
  icon, 
  error, 
  maxLength,
  currentLength,
  className = "", 
  ...props 
}: TextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      {label && (
        <motion.label
          className="block text-sm font-semibold text-slate-200 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          {icon && <span className="text-lg">{icon}</span>}
          {label}
        </motion.label>
      )}
      <div className="relative">
        <textarea
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            resize-none w-full rounded-2xl border border-white/10 
            glass-morphism
            px-4 py-3 text-sm text-slate-50
            placeholder:text-slate-500
            transition-all duration-300
            focus:outline-none focus:border-blush-500/50 
            focus:ring-2 focus:ring-blush-500/20
            focus:bg-white/10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          maxLength={maxLength}
          {...props}
        />
        {focused && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blush-500/10 via-purple-500/10 to-blush-500/10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
      {maxLength && (
        <div className="flex items-center justify-between">
          {error ? (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <span>⚠️</span>
              {error}
            </motion.p>
          ) : (
            <div />
          )}
          <motion.p
            className="text-xs text-slate-500"
            animate={{ 
              color: (currentLength || 0) > maxLength * 0.9 ? "#ef4444" : "#64748b"
            }}
          >
            {currentLength || 0}/{maxLength}
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
