"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Send, Loader2, Sparkles, Unlock, MessageCircle, Home } from "lucide-react";
import Navigation from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "../contexts/LanguageContext";
import RevealOptions from "../components/RevealOptions";
import { parseRoomNumber } from "@/lib/rooms";

type Match = {
  id: string;
      other_user: {
        id: string;
        anonymous_name: string;
        display_name: string | null;
        bio: string | null;
        avatar_url: string | null;
        whatsapp_number: string | null;
        room_number: string | null;
        hobbies: string[] | null;
      };
  my_reveal: boolean;
  their_reveal: boolean;
  reveal_type?: string;
  created_at: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function MatchesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [revealing, setRevealing] = useState<string | null>(null);
  const [showRevealOptions, setShowRevealOptions] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; anonymous_name: string; whatsapp_number: string | null; room_number: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          return;
        }
        
        // Load user profile for reveal options and avatar
        fetch("/api/profile")
          .then((res) => res.ok ? res.json() : null)
          .then((profileData) => {
            if (profileData?.user) {
              setCurrentUser(profileData.user);
              setCurrentUserId(profileData.user.id);
            }
          });
        
        loadMatches();
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id);
      const interval = setInterval(() => {
        loadMessages(selectedMatch.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedMatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        if (data.matches?.length > 0 && !selectedMatch) {
          setSelectedMatch(data.matches[0]);
        }
      }
    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const res = await fetch(`/api/messages?match_id=${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedMatch || !messageInput.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: selectedMatch.id,
          content: messageInput
        })
      });

      if (res.ok) {
        setMessageInput("");
        loadMessages(selectedMatch.id);
      } else {
        alert(`${t.common.couldNot} send message.`);
      }
    } catch (error) {
      alert(t.common.networkError);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRevealClick = (matchId: string) => {
    setShowRevealOptions(matchId);
  };

  const revealIdentity = async (matchId: string, revealType: "whatsapp" | "room" | "both") => {
    setShowRevealOptions(null);
    setRevealing(matchId);
    try {
      const res = await fetch("/api/matches/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, reveal_type: revealType })
      });

      if (res.ok) {
        loadMatches();
        if (selectedMatch?.id === matchId) {
          setSelectedMatch({ ...selectedMatch, my_reveal: true });
        }
      } else {
        alert(`${t.common.couldNot} reveal identity.`);
      }
    } catch (error) {
      alert(t.common.networkError);
    } finally {
      setRevealing(null);
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

  if (matches.length === 0) {
    return (
      <>
        <div className="min-h-screen pb-24 flex items-center justify-center px-4">
          <Card className="border-primary/20 max-w-md w-full">
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t.matches.noMatches}</h3>
              <p className="text-muted-foreground">
                {t.matches.noMatchesDesc}
              </p>
            </CardContent>
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen pb-20 overflow-hidden">
        {/* Match List Sidebar */}
        <div className="w-full md:w-1/3 border-r border-border/50 bg-card/50 backdrop-blur-xl overflow-y-auto max-h-[40vh] md:max-h-none">
          <div className="p-4 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-xl z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              {t.matches.title} ({matches.length})
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {matches.map((match) => (
              <motion.button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full p-4 text-left transition-all duration-300 hover:bg-accent/50 ${
                  selectedMatch?.id === match.id
                    ? "bg-primary/10 border-l-4 border-primary"
                    : ""
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                      {match.other_user.anonymous_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {match.other_user.anonymous_name}
                    </p>
                    {match.their_reveal && match.other_user.display_name && (
                      <p className="text-xs text-primary truncate mt-1">
                        {match.other_user.display_name}
                      </p>
                    )}
                    {match.my_reveal && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t.matches.youRevealed}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedMatch && (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="border-b border-border/50 p-4 bg-card/50 backdrop-blur-xl sticky top-0 z-10 relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                      {selectedMatch.other_user.anonymous_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {selectedMatch.other_user.anonymous_name}
                    </h3>
                    {selectedMatch.their_reveal && selectedMatch.other_user.display_name && (
                      <p className="text-sm text-primary truncate">
                        {selectedMatch.other_user.display_name}
                      </p>
                    )}
                    {selectedMatch.other_user.bio && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {selectedMatch.other_user.bio}
                      </p>
                    )}
                    {selectedMatch.other_user.hobbies && selectedMatch.other_user.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedMatch.other_user.hobbies.slice(0, 3).map((hobby) => (
                          <Badge key={hobby} variant="outline" className="text-xs">
                            {hobby}
                          </Badge>
                        ))}
                        {selectedMatch.other_user.hobbies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{selectedMatch.other_user.hobbies.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!selectedMatch.my_reveal && !showRevealOptions && (
                    <Button
                      onClick={() => handleRevealClick(selectedMatch.id)}
                      disabled={revealing === selectedMatch.id}
                      variant="outline"
                      size="sm"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      {t.matches.reveal}
                    </Button>
                  )}
                  {showRevealOptions === selectedMatch.id && (
                    <div className="absolute top-full right-0 mt-2 z-50 w-80">
                      <RevealOptions
                        onSelect={(type) => revealIdentity(selectedMatch.id, type)}
                        onCancel={() => setShowRevealOptions(null)}
                        hasWhatsApp={!!currentUser?.whatsapp_number}
                        hasRoom={!!currentUser?.room_number}
                      />
                    </div>
                  )}
                  {selectedMatch.my_reveal && selectedMatch.their_reveal && (
                    <div className="flex gap-2 flex-wrap">
                      {selectedMatch.other_user.whatsapp_number && selectedMatch.reveal_type && (selectedMatch.reveal_type === "whatsapp" || selectedMatch.reveal_type === "both") && (
                        <a
                          href={`https://wa.me/${selectedMatch.other_user.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="default" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t.matches.openWhatsApp}
                          </Button>
                        </a>
                      )}
                      {selectedMatch.other_user.room_number && selectedMatch.reveal_type && (selectedMatch.reveal_type === "room" || selectedMatch.reveal_type === "both") && (() => {
                        const { building, room } = parseRoomNumber(selectedMatch.other_user.room_number);
                        const displayText = building && room ? `${building} - ${room}` : selectedMatch.other_user.room_number;
                        return (
                          <div className="px-3 py-2 rounded-md bg-muted text-sm flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            {displayText}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background via-background to-muted/20">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative mb-6">
                      <MessageSquare className="w-20 h-20 text-primary/30 mx-auto" />
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t.matches.startConversation}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {t.matches.noMessagesDesc}
                    </p>
                  </motion.div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = currentUserId && msg.sender_id === currentUserId;
                  const showAvatar = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && showAvatar && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs">
                            {selectedMatch.other_user.anonymous_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-sm ${
                            isMe
                              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
                              : "bg-card/80 border border-border/50 text-foreground rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </motion.div>
                        <p className={`mt-1 text-xs px-2 ${isMe ? "text-muted-foreground" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {isMe && showAvatar && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs">
                            {currentUser?.anonymous_name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border/50 p-4 bg-card/80 backdrop-blur-xl sticky bottom-0">
              <motion.form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t.matches.messagePlaceholder}
                  disabled={sendingMessage}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 h-12 rounded-full border-2 focus:border-primary/50 transition-colors"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </>
  );
}
