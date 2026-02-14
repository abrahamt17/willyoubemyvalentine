"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Lock, Sparkles, ArrowRight, Shield, Users, Eye, Languages, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "./contexts/LanguageContext";
import Background3D from "./components/Background3D";
import LanguageSelector from "./components/LanguageSelector";

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if language was already selected
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved) {
        setLanguageSelected(true);
      }
    }
    
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.hasCompletedOnboarding) {
          router.push("/dashboard");
        } else if (data?.userId) {
          // User is logged in but hasn't completed onboarding
          router.push("/onboarding");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.common.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        if (data.alreadyLoggedIn) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }, 800);
    } catch {
      setError(t.common.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Show language selector first if not selected
  if (!languageSelected) {
    return <LanguageSelector onSelect={() => setLanguageSelected(true)} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col">

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <Heart className="w-20 h-20 text-primary fill-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block text-foreground mb-2">{t.landing.title}</span>
            <motion.span
              className="block bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {t.landing.subtitle}
            </motion.span>
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary font-semibold mb-2"
          >
            {t.landing.tagline}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line"
          >
            {t.landing.description}
          </motion.p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Lock className="w-4 h-4" />
              {t.landing.private}
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Shield className="w-4 h-4" />
              {t.landing.inviteOnly}
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Eye className="w-4 h-4" />
              {t.landing.anonymous}
            </Badge>
          </div>
        </motion.div>

        {/* Invite Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md mt-12"
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">{t.landing.enterCode}</CardTitle>
              <CardDescription className="text-center">
                {t.landing.codeDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder={t.landing.codePlaceholder}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={loading || success}
                    className="text-center text-lg font-medium tracking-wider h-12"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-sm text-green-400"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.landing.welcome}
                    </motion.div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !code.trim() || success}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      {t.landing.checking}
                    </>
                  ) : success ? (
                    <>
                      <Heart className="w-4 h-4 fill-current" />
                      {t.landing.success}
                    </>
                  ) : (
                    <>
                      {t.landing.unlockAccess}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: t.features.browse.title,
                description: t.features.browse.description,
              },
              {
                icon: Heart,
                title: t.features.mutual.title,
                description: t.features.mutual.description,
              },
              {
                icon: Shield,
                title: t.features.privacy.title,
                description: t.features.privacy.description,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-primary/20 bg-card/50 backdrop-blur-xl hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            {t.landing.footer}{" "}
            <Link href="#" className="text-primary hover:underline">
              {t.landing.learnMore}
            </Link>
          </p>
          <p className="mt-2 text-xs">
            {t.landing.agreement}
          </p>
        </div>
      </footer>
    </div>
  );
}
