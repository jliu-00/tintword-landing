import { motion, useTransform, useMotionValue } from "motion/react";
import { useState } from "react";
import { LanguageToggle } from "./components/LanguageToggle";
import { TintWordCTA } from "./components/TintWordCTA";
import { SwipeableFeatures } from "./components/SwipeableFeatures";
import { LiquidCursor } from "./components/LiquidCursor";
import { PhysicsPool } from "./components/PhysicsPool";

export default function App() {
  // Global drag value for ambient tinting
  // Passed down to SwipeableFeatures or TintWordCTA so they can update it
  const globalDragX = useMotionValue(0);
  const [lang, setLang] = useState<"en" | "zh">("en");

  // Ambient tint: Left = Red, Right = Green
  // We use the same FSRS colors but with very low opacity for the whole background
  const ambientColor = useTransform(
    globalDragX,
    [-300, 0, 300],
    ["rgba(225, 29, 72, 0.08)", "rgba(236, 229, 220, 0)", "rgba(16, 185, 129, 0.08)"]
  );

  return (
    <motion.div
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{ backgroundColor: ambientColor }}
      transition={{ duration: 0.5 }}
    >
      <LiquidCursor />

      {/* Top Nav */}
      <nav className="absolute top-6 right-6 md:top-10 md:right-12 z-50">
        <LanguageToggle lang={lang} setLang={setLang} />
      </nav>

      <main className="container mx-auto max-w-[1400px] px-6 md:px-16 pb-32">
        {/* Hero Section */}
        <TintWordCTA lang={lang} globalDragX={globalDragX} />

        {/* Feature Cards Deck */}
        <SwipeableFeatures lang={lang} globalDragX={globalDragX} />
        
        {/* Gravity Physics Pool */}
        <PhysicsPool />
      </main>

      <footer data-nosnippet className="w-full border-t border-foreground/10 py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm font-mono tracking-widest uppercase">
          <span>&copy; 2026 TintWord. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="https://jliu.eu" className="hover:text-accent transition-colors">jliu.eu</a>
            <span className="opacity-50">|</span>
            <a href="privacy.html" className="hover:text-accent transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
