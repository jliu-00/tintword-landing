import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, MotionValue } from "motion/react";
import { MorphingText } from "./MorphingText";

interface Feature {
  id: number;
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
    titleEn: "Intuitive Swipe Learning",
    titleZh: "直觉化滑动记忆",
    descEn: "Powered by the advanced FSRS algorithm. Simply swipe to indicate your retention level, making every review session naturally fluid and highly efficient.",
    descZh: "基于先进的 FSRS 记忆算法，通过简单的划动操作即可标记词汇的掌握程度，让每一次复习都如行云流水般自然高效。",
    pos: "adj",
  },
  {
    id: 1,
    titleEn: "Visual Gender Coding",
    titleZh: "词性色彩编码",
    descEn: "Card backgrounds automatically adapt to the noun's gender, utilizing visual memory to help you master Der, Die, and Das.",
    descZh: "背景色自动响应单词词性，视觉潜意识助你不再混淆 Der, Die, Das。",
    pos: "die",
    component: (
      <div className="flex gap-3 mt-4">
        <span className="w-3 h-3 rounded-full bg-[#8B9EA8] shadow-[0_0_8px_rgba(139,158,168,0.5)]" title="Der"></span>
        <span className="w-3 h-3 rounded-full bg-[#C49FA2] shadow-[0_0_8px_rgba(196,159,162,0.5)]" title="Die"></span>
        <span className="w-3 h-3 rounded-full bg-[#A8B5A0] shadow-[0_0_8px_rgba(168,181,160,0.5)]" title="Das"></span>
        <span className="w-3 h-3 rounded-full bg-[#B5AFA8]" title="Verb"></span>
        <span className="w-3 h-3 rounded-full bg-[#A899B5]" title="Adj"></span>
      </div>
    )
  },
  {
    id: 2,
    titleEn: "Comprehensive Morphology",
    titleZh: "详尽的词形变化",
    descEn: "Includes complete verb conjugations and noun plurals to help you conquer German grammar. Hover below to see the flow.",
    descZh: "内置完整的动词变位以及名词复数形式，全面攻克语法难关。悬停下方体验词形流动。",
    pos: "verb",
    component: <MorphingText />
  },
  {
    id: 3,
    titleEn: "Multilingual Vocabulary",
    titleZh: "全阶段多语种词库",
    descEn: "Master 7,000 core words from A1 to C1 levels. Seamlessly switch between English, Chinese, Romanian, and Turkish translations.",
    descZh: "涵盖 A1 至 C1 级别的 7000 个核心词汇。支持英语、中文、罗马尼亚语和土耳其语四种语言的无缝切换。",
    pos: "der",
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
        {lang === "en" ? "Swipe cards to explore features" : "滑动卡片以探索核心特性"}
      </motion.p>

      <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center perspective-[1000px]">
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
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
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
    }
  };

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity: isTop ? opacity : 1,
        zIndex: 10 - index,
        backgroundColor: "#FAFAFA",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
        boxShadow: "0 20px 40px -10px rgba(45,41,38,0.15), inset 0 1px 1px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
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
        rotate: x.get() > 0 ? 20 : -20,
        transition: { duration: 0.4 } 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute inset-0 flex flex-col justify-between p-8 rounded-2xl ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div>
        <div className="flex items-center gap-2 mb-6 opacity-60">
          <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 bg-foreground/5 rounded-sm">
            {feature.pos}
          </span>
        </div>
        <h3 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight mb-4 text-foreground">
          {lang === "en" ? feature.titleEn : feature.titleZh}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-[15px] md:text-[16px]">
          {lang === "en" ? feature.descEn : feature.descZh}
        </p>
      </div>

      {feature.component && (
        <div className="mt-6 pointer-events-auto">
          {feature.component}
        </div>
      )}
    </motion.div>
  );
}
