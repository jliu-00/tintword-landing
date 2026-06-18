import { motion } from "motion/react";

interface LanguageToggleProps {
  lang: "en" | "zh";
  setLang: (lang: "en" | "zh") => void;
}

export function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  const toggle = () => setLang(lang === "en" ? "zh" : "en");

  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-mono text-sm tracking-widest uppercase transition-colors ${
          lang === "en" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        EN
      </span>

      {/* Retro Metallic Switch Base */}
      <div
        className="relative h-7 w-14 cursor-pointer rounded-full p-1"
        style={{
          background: "radial-gradient(120% 120% at 32% 28%, #ECE5DC 0%, #CFC6BA 45%, #A89E90 100%)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.8)",
        }}
        onClick={toggle}
      >
        {/* The Toggle Knob */}
        <motion.div
          layout
          initial={false}
          animate={{
            x: lang === "en" ? 0 : 28,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25,
            mass: 0.8,
          }}
          className="h-5 w-5 rounded-full flex items-center justify-center relative"
          style={{
            background: "radial-gradient(120% 120% at 32% 28%, #FAFAFA 0%, #E0D7CD 45%, #BBAFA1 100%)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.9)",
          }}
        >
          {/* Knurled Texture */}
          <div
            className="absolute inset-[2px] rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(45,41,38,0.08) 0deg 10deg, transparent 10deg 20deg)",
              WebkitMaskImage: "radial-gradient(transparent 50%, #000 51%, #000 80%, transparent 81%)",
              maskImage: "radial-gradient(transparent 50%, #000 51%, #000 80%, transparent 81%)",
            }}
          />
        </motion.div>
      </div>

      <span
        className={`font-mono text-sm tracking-widest transition-colors ${
          lang === "zh" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        中文
      </span>
    </div>
  );
}
