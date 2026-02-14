"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";

interface RevealOptionsProps {
  onSelect: (type: "whatsapp" | "room" | "both") => void;
  onCancel: () => void;
  hasWhatsApp: boolean;
  hasRoom: boolean;
}

export default function RevealOptions({ onSelect, onCancel, hasWhatsApp, hasRoom }: RevealOptionsProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<"whatsapp" | "room" | "both" | null>(null);

  const options = [
    {
      type: "whatsapp" as const,
      icon: MessageCircle,
      label: t.matches.revealWhatsApp,
      available: hasWhatsApp,
    },
    {
      type: "room" as const,
      icon: Home,
      label: t.matches.revealRoom,
      available: hasRoom,
    },
    {
      type: "both" as const,
      icon: CheckCircle2,
      label: t.matches.revealBoth,
      available: hasWhatsApp && hasRoom,
    },
  ].filter(opt => opt.available);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t.matches.revealOptions}</CardTitle>
        <CardDescription>{t.matches.revealConfirm}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.type}
              onClick={() => setSelected(option.type)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selected === option.type
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{option.label}</span>
              </div>
            </motion.button>
          );
        })}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="flex-1"
          >
            Confirm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

