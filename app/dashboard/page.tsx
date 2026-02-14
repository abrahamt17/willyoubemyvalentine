"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, User, Send, Loader2 } from "lucide-react";
import Navigation from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "../contexts/LanguageContext";

type User = {
  id: string;
  anonymous_name: string;
  bio: string | null;
  gender: string | null;
  hobbies: string[] | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
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
        
        // If user hasn't completed onboarding, redirect to onboarding
        if (!data.hasCompletedOnboarding) {
          router.push("/onboarding");
        } else {
          loadUsers();
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: userId })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.matched) {
          alert(t.dashboard.match);
        } else {
          alert(t.dashboard.requestSent);
        }
        loadUsers();
      } else {
        alert(data.error || `${t.common.couldNot} send request.`);
      }
    } catch (error) {
      alert(t.common.networkError);
    } finally {
      setSendingRequest(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex flex-1 items-center justify-center min-h-screen pb-24">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground animate-pulse">{t.common.loading}</p>
          </div>
        </div>
        <Navigation />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              {t.dashboard.title}
            </h1>
            <p className="text-muted-foreground">
              {t.dashboard.description}
            </p>
          </motion.div>

          {/* Users Grid */}
          {users.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-16 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{t.dashboard.noUsers}</h3>
                <p className="text-muted-foreground">
                  {t.dashboard.noUsersDesc}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-primary/20 bg-card/50 backdrop-blur-xl hover:border-primary/40 transition-all h-full">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xl font-bold">
                            {user.anonymous_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-2 truncate">
                            {user.anonymous_name}
                          </CardTitle>
                          {user.gender && (
                            <Badge variant="secondary" className="mb-2">
                              <User className="w-3 h-3 mr-1" />
                              {user.gender}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user.bio && (
                        <>
                          <CardDescription className="text-sm leading-relaxed mb-4">
                            {user.bio}
                          </CardDescription>
                          <Separator className="my-4" />
                        </>
                      )}
                      {user.hobbies && user.hobbies.length > 0 && (
                        <>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {user.hobbies.slice(0, 5).map((hobby) => (
                              <Badge key={hobby} variant="outline" className="text-xs">
                                {hobby}
                              </Badge>
                            ))}
                            {user.hobbies.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.hobbies.length - 5}
                              </Badge>
                            )}
                          </div>
                          <Separator className="my-4" />
                        </>
                      )}
                      <Button
                        onClick={() => sendRequest(user.id)}
                        disabled={sendingRequest === user.id}
                        className="w-full"
                        size="lg"
                      >
                        {sendingRequest === user.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.dashboard.sending}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {t.dashboard.sendRequest}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </>
  );
}
