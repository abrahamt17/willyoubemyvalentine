"use client";

import { motion } from "framer-motion";
import { Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { Language } from "@/lib/translations";

interface LanguageSelectorProps {
  onSelect: () => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    onSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center"
            >
              <Globe className="w-16 h-16 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl mb-2">Scegli La Lingua / Choose Language</CardTitle>
              <CardDescription className="text-base">
                Seleziona la tua lingua preferita / Select your preferred language
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => handleLanguageSelect("it")}
                size="lg"
                className="w-full h-20 text-lg"
                variant="default"
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="text-4xl">🇮🇹</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold">Italiano</div>
                    <div className="text-sm opacity-80">Lingua predefinita</div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => handleLanguageSelect("en")}
                size="lg"
                className="w-full h-20 text-lg"
                variant="outline"
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="text-4xl">🇬🇧</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold">English</div>
                    <div className="text-sm opacity-80">Default language</div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

