import { useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

export function MagneticPill({ href }: { href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [active, setActive] = useState(false);

  // Anchor is 72x72, center is 36. Hook it slightly above the center (y=-30)
  const anchorX = useTransform(x, (v) => 36 - v);
  const anchorY = useTransform(y, (v) => -30 - v);

  return (
    <div className="flex items-center gap-6 relative">
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Download on Google Play"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.6}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 10 }}
        style={{ x, y }}
        className="group relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-full z-20 cursor-grab active:cursor-grabbing"
      >
        {/* Elastic string / hook line */}
        <svg className="absolute inset-0 z-0 pointer-events-none overflow-visible w-full h-full">
          <motion.line
            x1={anchorX}
            y1={anchorY}
            x2={36}
            y2={15}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/30"
          />
          <motion.circle
            cx={anchorX}
            cy={anchorY}
            r={3}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/50"
          />
        </svg>

        {/* The matte metal dial - perfectly circular to preserve the beautiful knurled texture */}
        <motion.span
          animate={{ scale: active ? 1.08 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="relative z-10 flex h-full w-full items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(120% 120% at 32% 28%, #ECE5DC 0%, #CFC6BA 45%, #A89E90 100%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.28), 0 6px 14px rgba(45,41,38,0.22)",
          }}
        >
          {/* knurled bezel ring - looks perfect on a circle */}
          <span
            className="absolute inset-[3px] rounded-full pointer-events-none"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(45,41,38,0.16) 0deg 4deg, transparent 4deg 8deg)",
              WebkitMaskImage: "radial-gradient(transparent 64%, #000 65%, #000 78%, transparent 79%)",
              maskImage: "radial-gradient(transparent 64%, #000 65%, #000 78%, transparent 79%)",
            }}
          />
          
          <span className="relative z-10 text-[#2D2926] transition-transform duration-300 group-hover:scale-110 ml-1 pointer-events-none">
            {/* Custom Google Play minimalist icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M5 2.05v19.9l16.1-9.95z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </span>
        </motion.span>
      </motion.a>

      {/* Typography placed outside the dial to maintain circular physics */}
      <div className="flex flex-col select-none pointer-events-none opacity-80">
        <span className="text-xs font-mono tracking-widest uppercase mb-1">Get it on</span>
        <span className="text-2xl font-serif font-bold tracking-tight">Google Play</span>
      </div>
    </div>
  );
}
