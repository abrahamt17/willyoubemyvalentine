"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Send, UserCheck, X, Loader2, Heart } from "lucide-react";
import Navigation from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "../contexts/LanguageContext";

type Request = {
  id: string;
  receiver_id?: string;
  sender_id?: string;
  status: string;
  created_at: string;
  receiver?: { id: string; anonymous_name: string; bio: string | null };
  sender?: { id: string; anonymous_name: string; bio: string | null };
};

export default function RequestsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);

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
          loadRequests();
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  const loadRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const data = await res.json();
        setSentRequests(data.sent || []);
        setReceivedRequests(data.received || []);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!confirm(t.requests.cancelConfirm)) return;

    try {
      const res = await fetch(`/api/requests?id=${requestId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadRequests();
      } else {
        alert(`${t.common.couldNot} cancel request.`);
      }
    } catch (error) {
      alert(t.common.networkError);
    }
  };

  const acceptRequest = async (senderId: string) => {
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: senderId
        })
      });
      if (res.ok) {
        alert("🎉 " + t.dashboard.match);
        loadRequests();
      }
    } catch (error) {
      alert(t.common.networkError);
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
              <Mail className="w-8 h-8 text-primary" />
              {t.requests.title}
            </h1>
            <p className="text-muted-foreground">
              {t.requests.description}
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Received Requests */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  {t.requests.received} ({receivedRequests.length})
                </h2>
              </div>
              {receivedRequests.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-16 text-center">
                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.requests.noReceived}</h3>
                    <p className="text-muted-foreground">
                      {t.requests.noReceivedDesc}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {receivedRequests.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="border-primary/20 bg-card/50 backdrop-blur-xl hover:border-primary/40 transition-all h-full">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                                {req.sender?.anonymous_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="truncate">
                                {req.sender?.anonymous_name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {new Date(req.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {req.sender?.bio && (
                            <>
                              <CardDescription>{req.sender.bio}</CardDescription>
                              <Separator />
                            </>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => acceptRequest(req.sender_id!)}
                              className="flex-1"
                              size="sm"
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              {t.requests.accept}
                            </Button>
                            <Button
                              onClick={() => cancelRequest(req.id)}
                              variant="outline"
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Sent Requests */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Send className="w-6 h-6 text-primary" />
                  {t.requests.sent} ({sentRequests.length})
                </h2>
              </div>
              {sentRequests.length === 0 ? (
                <Card className="border-primary/20">
                  <CardContent className="py-16 text-center">
                    <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">{t.requests.noSent}</h3>
                    <p className="text-muted-foreground">
                      {t.requests.noSentDesc}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {sentRequests.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="border-primary/20 bg-card/50 backdrop-blur-xl hover:border-primary/40 transition-all h-full">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                                {req.receiver?.anonymous_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="truncate">
                                {req.receiver?.anonymous_name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {new Date(req.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">{t.requests.pending}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {req.receiver?.bio && (
                            <CardDescription>{req.receiver.bio}</CardDescription>
                          )}
                          <Button
                            onClick={() => cancelRequest(req.id)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t.requests.cancel}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <Navigation />
    </>
  );
}
