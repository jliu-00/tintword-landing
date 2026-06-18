import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, MotionValue } from "motion/react";
import { MorphingText } from "./MorphingText";

interface Feature {
  id: number;
  word: string;
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  pos: "der" | "die" | "das" | "verb" | "adj";
  component?: React.ReactNode;
}

const features: Feature[] = [
  {
    id: 0,
    word: "das Wischen",
    titleEn: "Intuitive Swipe",
    titleZh: "滑动记忆",
    descEn: "Powered by the advanced FSRS algorithm. Simply swipe to indicate your retention level, making every review session naturally fluid and highly efficient.",
    descZh: "基于先进的 FSRS 记忆算法，通过简单的划动操作即可标记词汇的掌握程度，让每一次复习都如行云流水般自然高效。",
    pos: "das",
  },
  {
    id: 1,
    word: "die Farbe",
    titleEn: "Visual Gender Coding",
    titleZh: "词性色彩编码",
    descEn: "Card backgrounds automatically adapt to the noun's gender, utilizing visual memory to help you master Der, Die, and Das.",
    descZh: "背景色自动响应单词词性，视觉潜意识助你不再混淆 Der, Die, Das。",
    pos: "die",
    component: (
      <div className="flex gap-3 mt-4 justify-center">
        <span className="w-4 h-4 rounded-full bg-[#8B9EA8] shadow-[0_0_8px_rgba(139,158,168,0.5)]" title="Der"></span>
        <span className="w-4 h-4 rounded-full bg-[#C49FA2] shadow-[0_0_8px_rgba(196,159,162,0.5)]" title="Die"></span>
        <span className="w-4 h-4 rounded-full bg-[#A8B5A0] shadow-[0_0_8px_rgba(168,181,160,0.5)]" title="Das"></span>
      </div>
    )
  },
  {
    id: 2,
    word: "abfahren",
    titleEn: "Comprehensive Morphology",
    titleZh: "详尽的词形变化",
    descEn: "Includes complete verb conjugations and noun plurals to help you conquer German grammar. Hover below to see the flow.",
    descZh: "内置完整的动词变位以及名词复数形式，全面攻克语法难关。悬停下方体验词形流动。",
    pos: "verb",
    component: <MorphingText />
  },
  {
    id: 3,
    word: "die Sprache",
    titleEn: "Multilingual",
    titleZh: "多语种词库",
    descEn: "Master 7,000 core words from A1 to C1 levels. Seamlessly switch between English, Chinese, Romanian, and Turkish.",
    descZh: "涵盖 A1 至 C1 级别的 7000 个核心词汇。支持英语、中文、罗马尼亚语和土耳其语四种语言的无缝切换。",
    pos: "die",
  }
];

interface SwipeableFeaturesProps {
  lang: "en" | "zh";
  globalDragX: MotionValue<number>;
}

export function SwipeableFeatures({ lang, globalDragX }: SwipeableFeaturesProps) {
  const [index, setIndex] = useState(0);

  // We only render up to 3 cards to avoid DOM bloat, the top card is interactive.
  // We loop the features infinitely.
  const visibleFeatures = [
    features[index % features.length],
    features[(index + 1) % features.length],
    features[(index + 2) % features.length],
  ];

  return (
    <section className="relative w-full max-w-[800px] mx-auto mt-20 flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Title / Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-mono text-sm tracking-[0.2em] uppercase text-muted-foreground mb-12 text-center"
      >
        {lang === "en" ? "Click to flip • Swipe to next" : "点击翻转卡片 • 左右划动切换"}
      </motion.p>

      <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center" style={{ perspective: 1200 }}>
        <AnimatePresence mode="popLayout">
          {visibleFeatures.map((feature, i) => (
            <FeatureCard 
              key={`${feature.id}-${index + i}`} 
              feature={feature} 
              index={i} 
              lang={lang}
              setIndex={setIndex}
              isTop={i === 0}
              globalDragX={i === 0 ? globalDragX : undefined}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FeatureCard({ 
  feature, 
  index, 
  lang, 
  setIndex, 
  isTop,
  globalDragX 
}: { 
  feature: Feature; 
  index: number; 
  lang: "en" | "zh"; 
  setIndex: any;
  isTop: boolean;
  globalDragX?: MotionValue<number>;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotateZ = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Sync with global drag if it's the top card
  if (isTop && globalDragX) {
    x.on("change", (v) => globalDragX.set(v));
  }

  const handleDragEnd = (_e: any, info: any) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      // Swiped away!
      if (globalDragX) globalDragX.set(0); // reset global tint
      setIndex((prev: number) => prev + 1);
      setIsFlipped(false); // Reset flip state for the next card
    }
  };

  const posColors = {
    der: "#8B9EA8",
    die: "#C49FA2",
    das: "#A8B5A0",
    verb: "#B5AFA8",
    adj: "#A899B5"
  };

  const cardBg = isFlipped ? posColors[feature.pos] : "#FAFAFA";
  const textColor = isFlipped ? "#FFFFFF" : "#2D2926";
  const mutedColor = isFlipped ? "rgba(255,255,255,0.8)" : "rgba(45,41,38,0.6)";

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={() => { if (isTop && Math.abs(x.get()) < 10) setIsFlipped(!isFlipped); }}
      style={{
        x,
        rotateZ,
        opacity: isTop ? opacity : 1,
        zIndex: 10 - index,
        transformStyle: "preserve-3d"
      }}
      initial={{ 
        scale: 0.95, 
        y: 30,
        opacity: 0 
      }}
      animate={{ 
        scale: 1 - index * 0.05, 
        y: index * 20,
        opacity: 1 - index * 0.2
      }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0, 
        rotateZ: x.get() > 0 ? 20 : -20,
        transition: { duration: 0.4 } 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute inset-0 rounded-[24px] ${isTop ? "cursor-pointer active:cursor-grabbing" : ""}`}
    >
      <motion.div
        className="w-full h-full rounded-[24px] absolute inset-0 flex flex-col justify-center items-center p-8 text-center"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          backgroundColor: cardBg,
          color: textColor,
          transformStyle: "preserve-3d",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
          boxShadow: isTop ? "0 20px 40px -10px rgba(45,41,38,0.15), inset 0 1px 1px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.05)" : "none",
          border: isFlipped ? "none" : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        
        {/* Front of Card */}
        <div 
          className="absolute inset-0 w-full h-full p-8 flex flex-col justify-center items-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-8 left-8 flex items-center gap-2 opacity-60">
            <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 bg-foreground/5 rounded-sm">
              {feature.pos}
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight mb-2">
            {feature.word}
          </h2>
          <p className="font-mono text-sm tracking-widest uppercase mt-4" style={{ color: mutedColor }}>
            Feature: {lang === "en" ? feature.titleEn : feature.titleZh}
          </p>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 w-full h-full p-8 flex flex-col justify-center items-center backface-hidden"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          <h3 className="font-serif text-3xl mb-4 text-white">
            {lang === "en" ? feature.titleEn : feature.titleZh}
          </h3>
          <p className="leading-relaxed text-[15px] md:text-[16px] text-white/90">
            {lang === "en" ? feature.descEn : feature.descZh}
          </p>
          
          {feature.component && (
            <div className="mt-8 pointer-events-auto">
              {feature.component}
            </div>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}
