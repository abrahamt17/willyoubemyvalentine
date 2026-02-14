"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, getTranslation } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const defaultLanguage: Language = "it";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      if (saved && (saved === "en" || saved === "it")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language: mounted ? language : defaultLanguage,
        setLanguage,
        t: getTranslation(mounted ? language : defaultLanguage),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values during SSR
    return {
      language: defaultLanguage,
      setLanguage: () => {},
      t: getTranslation(defaultLanguage),
    };
  }
  return context;
}

