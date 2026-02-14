"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Mail, Users, User } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState({
    pendingRequests: 0,
    unreadMessages: 0,
    newMatches: 0
  });

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/dashboard", label: t.nav.browse, icon: Heart, count: 0 },
    { href: "/requests", label: t.nav.requests, icon: Mail, count: notifications.pendingRequests },
    { href: "/matches", label: t.nav.matches, icon: Users, count: notifications.unreadMessages + notifications.newMatches },
    { href: "/profile", label: t.nav.profile, icon: User, count: 0 }
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/10 blur-md -z-10"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <Icon className={`w-5 h-5 ${isActive ? "fill-primary" : ""}`} />
                  {item.count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full"
                    >
                      {item.count > 99 ? "99+" : item.count}
                    </motion.span>
                  )}
                </motion.div>
                <span className="font-semibold">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
