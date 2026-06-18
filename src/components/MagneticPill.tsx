import { motion, useMotionValue, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export function MagneticPill({ href }: { href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // The anchor point must remain visually fixed. 
  // Pill width is roughly 200, height 64. Center is 100.
  // We'll anchor it at x=100, y=-40 relative to the pill.
  const anchorX = useTransform(x, (v) => 100 - v);
  const anchorY = useTransform(y, (v) => -40 - v);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.6}
      dragTransition={{ bounceStiffness: 400, bounceDamping: 10 }}
      style={{ x, y }}
      className="group relative inline-flex h-[64px] w-[200px] items-center justify-center rounded-full"
    >
      {/* Elastic string / hook line */}
      <svg className="absolute inset-0 z-0 pointer-events-none overflow-visible w-full h-full">
        <motion.line
          x1={anchorX}
          y1={anchorY}
          x2={100}
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

      {/* The matte metal pill */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative z-10 flex h-full w-full items-center justify-between px-6 rounded-full"
        style={{
          background: "radial-gradient(120% 120% at 32% 28%, #ECE5DC 0%, #CFC6BA 45%, #A89E90 100%)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.25), 0 8px 16px rgba(45,41,38,0.2)",
        }}
      >
        {/* knurled bezel ring */}
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(45,41,38,0.12) 0deg 2deg, transparent 2deg 4deg)",
            WebkitMaskImage: "radial-gradient(transparent 68%, #000 69%, #000 85%, transparent 86%)",
            maskImage: "radial-gradient(transparent 68%, #000 69%, #000 85%, transparent 86%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-start leading-none pointer-events-none text-[#2D2926]">
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 mb-1">
            Get it on
          </span>
          <span className="text-lg font-serif font-bold tracking-tight">
            Google Play
          </span>
        </div>
        
        <ArrowUpRight
          size={22}
          className="relative z-10 text-[#2D2926] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 pointer-events-none"
        />
      </motion.div>
    </motion.a>
  );
}
