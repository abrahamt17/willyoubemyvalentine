"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Lock, Sparkles, ArrowRight, Shield, Users, Eye, Languages, Globe, LogIn, User, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "./contexts/LanguageContext";
import Background3D from "./components/Background3D";

export default function HomePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginGender, setLoginGender] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchingAccounts, setSearchingAccounts] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState<any[]>([]);
  const [loadingRecentAccounts, setLoadingRecentAccounts] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load recent accounts from localStorage
    loadRecentAccounts();
    
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.hasCompletedOnboarding) {
          // User is logged in and has completed onboarding - stay on page or redirect
          // Don't auto-redirect, let them see the homepage
        } else if (data?.userId) {
          // User is logged in but hasn't completed onboarding
          router.push("/onboarding");
        }
        // If no data, user is not logged in - show login/register options
      })
      .catch(() => {});
  }, [router]);

  const loadRecentAccounts = async () => {
    try {
      const stored = localStorage.getItem("recent_accounts");
      if (!stored) {
        setRecentAccounts([]);
        return;
      }

      const userIds = JSON.parse(stored);
      if (!Array.isArray(userIds) || userIds.length === 0) {
        setRecentAccounts([]);
        return;
      }

      setLoadingRecentAccounts(true);
      const res = await fetch(`/api/auth/recent-accounts?user_ids=${userIds.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setRecentAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Error loading recent accounts:", error);
      setRecentAccounts([]);
    } finally {
      setLoadingRecentAccounts(false);
    }
  };

  const saveRecentAccount = (userId: string) => {
    try {
      const stored = localStorage.getItem("recent_accounts");
      let userIds = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists
      userIds = userIds.filter((id: string) => id !== userId);
      // Add to beginning
      userIds.unshift(userId);
      // Keep only last 5
      userIds = userIds.slice(0, 5);
      
      localStorage.setItem("recent_accounts", JSON.stringify(userIds));
    } catch (error) {
      console.error("Error saving recent account:", error);
    }
  };

  const handleQuickLoginSearch = async () => {
    if (!loginName.trim() || !loginGender) {
      setError("Please enter your nickname and select gender");
      return;
    }

    setSearchingAccounts(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/accounts?anonymous_name=${encodeURIComponent(loginName.trim())}&gender=${encodeURIComponent(loginGender)}`);
      const data = await res.json();
      
      if (res.ok && data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
      } else {
        setError("No accounts found with that nickname and gender");
        setAccounts([]);
      }
    } catch {
      setError("Could not search for accounts");
    } finally {
      setSearchingAccounts(false);
    }
  };

  const handleAccountLogin = async (userId: string) => {
    setLoginLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Save to recent accounts
        saveRecentAccount(userId);
        
        // Check if user has completed onboarding
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.hasCompletedOnboarding) {
            router.replace("/dashboard");
          } else {
            router.replace("/onboarding");
          }
        }
      } else {
        setError(data.error || "Could not log in");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoginLoading(false);
    }
  };

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
          // Go directly to onboarding (language already selected on homepage)
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

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Language Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="w-4 h-4" />
              <span>{language === "it" ? "🇮🇹 IT" : "🇬🇧 EN"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("it")}>
              <span className="mr-2">🇮🇹</span>
              Italiano
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              <span className="mr-2">🇬🇧</span>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

          {/* Built For */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-base md:text-lg font-medium text-muted-foreground italic mb-2"
          >
            {t.landing.builtFor}
          </motion.p>

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

        {/* Recent Accounts Section */}
        {recentAccounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="w-full max-w-md mt-8"
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-center">
                  {t.landing.recentAccounts || "Your Accounts"}
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  {t.landing.recentAccountsDesc || "Select an account to continue"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loadingRecentAccounts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    recentAccounts.map((account) => (
                      <motion.div
                        key={account.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAccountLogin(account.id)}
                          disabled={loginLoading}
                          className="w-full justify-start h-auto p-3"
                        >
                          <div className="flex items-center gap-3 w-full">
                            {account.avatar_url ? (
                              <img
                                src={account.avatar_url}
                                alt={account.anonymous_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/20">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 text-left">
                              <p className="font-medium">
                                {account.display_name || account.anonymous_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {account.anonymous_name} • {account.gender}
                              </p>
                            </div>
                            {loginLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                          </div>
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Login / Register Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-md mt-12"
        >
          <div className="flex gap-2 mb-4 justify-center">
            <Button
              type="button"
              variant={!showQuickLogin ? "default" : "outline"}
              onClick={() => {
                setShowQuickLogin(false);
                setError(null);
                setAccounts([]);
              }}
              size="sm"
            >
              {t.landing.newAccount || "New Account"}
            </Button>
            <Button
              type="button"
              variant={showQuickLogin ? "default" : "outline"}
              onClick={() => {
                setShowQuickLogin(true);
                setError(null);
                setCode("");
              }}
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.landing.quickLogin || "Quick Login"}
            </Button>
          </div>

          {showQuickLogin ? (
            /* Quick Login Card */
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <LogIn className="w-6 h-6" />
                  {t.landing.quickLogin || "Quick Login"}
                </CardTitle>
                <CardDescription className="text-center">
                  {t.landing.quickLoginDesc || "Enter your nickname and gender to find your account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t.landing.loginNamePlaceholder || "Your Nickname"}
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      disabled={loginLoading || searchingAccounts}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={loginGender}
                      onValueChange={setLoginGender}
                      disabled={loginLoading || searchingAccounts}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t.landing.loginGenderPlaceholder || "Select Gender"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                  <Button
                    type="button"
                    onClick={handleQuickLoginSearch}
                    disabled={!loginName.trim() || !loginGender || searchingAccounts || loginLoading}
                    size="lg"
                    className="w-full"
                  >
                    {searchingAccounts ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin mr-2" />
                        {t.landing.searching || "Searching..."}
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        {t.landing.findAccount || "Find My Account"}
                      </>
                    )}
                  </Button>
                  
                  {accounts.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-muted-foreground text-center">
                        {t.landing.selectAccount || "Select your account:"}
                      </p>
                      {accounts.map((account) => (
                        <Button
                          key={account.id}
                          type="button"
                          variant="outline"
                          onClick={() => handleAccountLogin(account.id)}
                          disabled={loginLoading}
                          className="w-full justify-start"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {account.anonymous_name} ({account.gender})
                          {loginLoading && <Loader2 className="w-4 h-4 ml-auto animate-spin" />}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Invite Form Card - New Account */
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder={t.landing.codePlaceholder}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      disabled={loading || success}
                      className="text-center text-lg font-medium tracking-wider h-12 flex-1"
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {/* Language Toggle - Next to Input */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="icon"
                          className="h-12 w-12 shrink-0"
                          disabled={loading || success}
                        >
                          <Globe className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage("it")}>
                          <span className="mr-2">🇮🇹</span>
                          Italiano
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage("en")}>
                          <span className="mr-2">🇬🇧</span>
                          English
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
          )}
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
