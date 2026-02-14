"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, User, FileText, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { hobbies, type Hobby } from "@/lib/hobbies";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [anonymousName, setAnonymousName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // First check if user has recent accounts (in case session was lost after redeployment)
    const stored = localStorage.getItem("recent_accounts");
    if (stored) {
      const userIds = JSON.parse(stored);
      if (Array.isArray(userIds) && userIds.length > 0) {
        // Check if any of these accounts have completed onboarding
        fetch(`/api/auth/recent-accounts?user_ids=${userIds.join(",")}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.accounts && data.accounts.length > 0) {
              // Found completed accounts - auto-login to most recent
              const mostRecent = data.accounts[0];
              fetch("/api/auth/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: mostRecent.id })
              })
                .then((loginRes) => loginRes.json())
                .then((loginData) => {
                  if (loginData.ok) {
                    // Successfully logged in - redirect to dashboard
                    router.replace("/dashboard");
                    return;
                  }
                  // If login fails, continue with normal flow
                  checkSession();
                })
                .catch(() => checkSession());
            } else {
              // No valid accounts, continue with normal flow
              checkSession();
            }
          })
          .catch(() => checkSession());
        return;
      }
    }
    
    // No recent accounts, check session normally
    checkSession();
    
    function checkSession() {
      fetch("/api/auth/me")
        .then((res) => {
          if (!res.ok) {
            router.push("/");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          
          // If user has completed onboarding, redirect to dashboard
          if (data.hasCompletedOnboarding) {
            router.push("/dashboard");
          } else {
            // User is logged in but hasn't completed onboarding - show form
            setChecking(false);
          }
        })
        .catch(() => {
          router.push("/");
        });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!whatsapp.trim()) {
      setError(t.onboarding.whatsappRequired);
      setLoading(false);
      return;
    }

    if (!gender || (gender !== "Male" && gender !== "Female")) {
      setError(t.onboarding.genderRequired);
      setLoading(false);
      return;
    }

    if (selectedHobbies.length < 3) {
      setError(t.onboarding.hobbiesRequired);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_name: anonymousName,
          bio: bio || null,
          gender: gender,
          whatsapp_number: whatsapp.trim(),
          hobbies: selectedHobbies
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error ?? t.common.error;
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success! Save to recent accounts and redirect to dashboard
      // Use replace to prevent going back to onboarding
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.userId) {
            // Save to recent accounts
            const stored = localStorage.getItem("recent_accounts");
            let userIds = stored ? JSON.parse(stored) : [];
            userIds = userIds.filter((id: string) => id !== meData.userId);
            userIds.unshift(meData.userId);
            userIds = userIds.slice(0, 5);
            localStorage.setItem("recent_accounts", JSON.stringify(userIds));
          }
        }
      } catch (e) {
        // Ignore errors saving recent account
      }
      router.replace("/dashboard");
    } catch {
      setError(t.common.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl mb-2">{t.onboarding.title}</CardTitle>
              <CardDescription className="text-base">
                {t.onboarding.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t.onboarding.anonymousName}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.onboarding.anonymousNamePlaceholder}
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  {t.onboarding.anonymousNameDesc}
                </p>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="whatsapp" className="flex items-center gap-2">
                   <MessageCircle className="w-4 h-4" />
                   {t.onboarding.whatsapp} *
                 </Label>
                 <Input
                   id="whatsapp"
                   type="tel"
                   placeholder={t.onboarding.whatsappPlaceholder}
                   value={whatsapp}
                   onChange={(e) => setWhatsapp(e.target.value)}
                   disabled={loading}
                   required
                   className="h-11"
                 />
                <p className="text-xs text-muted-foreground">
                  {t.onboarding.whatsappAuthDesc}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.onboarding.bio}
                </Label>
                <Textarea
                  id="bio"
                  placeholder={t.onboarding.bioPlaceholder}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t.onboarding.gender}</Label>
                <Select value={gender} onValueChange={setGender} disabled={loading} required>
                  <SelectTrigger id="gender" className="h-11">
                    <SelectValue placeholder={t.onboarding.genderPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.onboarding.hobbies} *
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t.onboarding.hobbiesDesc} ({selectedHobbies.length}/3 minimum)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md touch-pan-y">
                  {hobbies.map((hobby) => {
                    const isSelected = selectedHobbies.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
                          } else if (selectedHobbies.length < 20) {
                            setSelectedHobbies([...selectedHobbies, hobby]);
                          }
                        }}
                        disabled={loading || (!isSelected && selectedHobbies.length >= 20)}
                        className={`px-3 py-2 text-sm rounded-md border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-border"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {hobby}
                      </button>
                    );
                  })}
                </div>
                {selectedHobbies.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t.onboarding.selectedHobbies}: {selectedHobbies.join(", ")}
                  </p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

               <Button
                 type="submit"
                    disabled={loading || !anonymousName.trim() || !whatsapp.trim() || !gender.trim() || selectedHobbies.length < 3}
                 size="lg"
                 className="w-full"
               >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.onboarding.creating}
                  </>
                ) : (
                  <>
                    {t.onboarding.continue}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
