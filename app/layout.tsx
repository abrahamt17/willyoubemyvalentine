import type { Metadata } from "next";
import "./globals.css";
import Background3D from "./components/Background3D";
import { LanguageProvider } from "./contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Will You Be My Valentine?",
  description:
    "Private, invite-only anonymous matching for a class Valentine event."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
        <LanguageProvider>
          <Background3D />
          <div className="relative z-10">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
