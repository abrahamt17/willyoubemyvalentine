"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Save, LogOut, Loader2, UserCircle, FileText, Sparkles, MessageCircle, Home } from "lucide-react";
import Navigation from "../components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { buildings, rooms, formatRoomNumber, parseRoomNumber, type Building } from "@/lib/rooms";

type User = {
  id: string;
  anonymous_name: string;
  display_name: string | null;
  bio: string | null;
  gender: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    anonymous_name: "",
    display_name: "",
    bio: "",
    gender: "",
    whatsapp_number: ""
  });
  const [selectedBuilding, setSelectedBuilding] = useState<"ITACA" | "PADIGLIONE C" | "PADIGLIONE D" | "">("");
  const [selectedRoom, setSelectedRoom] = useState("");

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
          loadProfile();
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          anonymous_name: data.user.anonymous_name || "",
          display_name: data.user.display_name || "",
          bio: data.user.bio || "",
          gender: data.user.gender || "",
          whatsapp_number: data.user.whatsapp_number || ""
        });
        
        // Parse room number if it exists
        if (data.user.room_number) {
          const { building, room } = parseRoomNumber(data.user.room_number);
          setSelectedBuilding(building || "");
          setSelectedRoom(room || "");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          room_number: selectedBuilding && selectedRoom ? formatRoomNumber(selectedBuilding as Building, selectedRoom) : null
        })
      });

      if (res.ok) {
        alert(t.profile.saved);
        loadProfile();
      } else {
        const data = await res.json();
        const errorMessage = data.error || `${t.common.couldNot} update profile.`;
        
        // Check if it's a room number limit error
        if (errorMessage.includes("room") && (errorMessage.includes("2") || errorMessage.includes("occupied"))) {
          alert(t.onboarding.roomNumberTaken);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      alert(t.common.networkError);
    } finally {
      setSaving(false);
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
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              {t.profile.title}
            </h1>
            <p className="text-muted-foreground">
              {t.profile.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-2xl font-bold">
                      {formData.anonymous_name.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {formData.anonymous_name || "Anonymous User"}
                    </CardTitle>
                    <CardDescription>
                      {formData.display_name && `Real name: ${formData.display_name}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="anonymous_name" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      {t.profile.anonymousName} *
                    </Label>
                    <Input
                      id="anonymous_name"
                      type="text"
                      maxLength={32}
                      required
                      value={formData.anonymous_name}
                      onChange={(e) =>
                        setFormData({ ...formData, anonymous_name: e.target.value })
                      }
                      placeholder={t.profile.anonymousName}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.profile.anonymousNameDesc}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t.profile.realName}
                    </Label>
                    <Input
                      id="display_name"
                      type="text"
                      maxLength={64}
                      placeholder={t.profile.realNameDesc}
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({ ...formData, display_name: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.profile.realNameDesc}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {t.profile.whatsapp}
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder={t.profile.whatsappPlaceholder}
                      value={formData.whatsapp_number}
                      disabled={true}
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.profile.whatsappDesc}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t.profile.bio}
                    </Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      maxLength={240}
                      placeholder={t.profile.bio}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.bio.length}/240
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t.profile.gender}</Label>
                    <Input
                      id="gender"
                      type="text"
                      maxLength={32}
                      placeholder={t.profile.genderPlaceholder}
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="building" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      {t.onboarding.building}
                    </Label>
                    <Select 
                      value={selectedBuilding} 
                      onValueChange={(value) => {
                        setSelectedBuilding(value as Building | "");
                        setSelectedRoom(""); // Reset room when building changes
                      }}
                      disabled={saving}
                    >
                      <SelectTrigger id="building" className="h-11">
                        <SelectValue placeholder={t.onboarding.buildingPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building} value={building}>
                            {building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBuilding && (
                    <div className="space-y-2">
                      <Label htmlFor="room" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        {t.onboarding.roomNumber}
                      </Label>
                      <Select 
                        value={selectedRoom} 
                        onValueChange={setSelectedRoom}
                        disabled={saving}
                      >
                        <SelectTrigger id="room" className="h-11">
                          <SelectValue placeholder={t.onboarding.roomNumberPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms[selectedBuilding as Building].map((room) => (
                            <SelectItem key={room} value={room}>
                              {room}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t.onboarding.roomNumberDesc}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving || !formData.anonymous_name.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.profile.saving}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t.profile.save}
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <Separator className="my-6" />

                <Button
                  onClick={async () => {
                    if (confirm(t.profile.logoutConfirm)) {
                      await fetch("/api/auth/logout", { method: "POST" });
                      router.push("/");
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.profile.logout}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Navigation />
    </>
  );
}
