import { motion, useTransform, useMotionTemplate, MotionValue } from "motion/react";
import { MagneticPill } from "./MagneticPill";

interface TintWordCTAProps {
  lang: "en" | "zh";
  globalDragX: MotionValue<number>;
}

export function TintWordCTA({ lang, globalDragX }: TintWordCTAProps) {
  // Rotate the word slightly as it's dragged (like a physical flashcard)
  const rotate = useTransform(globalDragX, [-250, 0, 250], [-10, 0, 10]);
  
  // Tint the word based on swipe direction: 
  // Left (Forget/Die) = Rose Red, Center = Transparent, Right (Remember/Das) = Emerald Green
  const auraColor = useTransform(
    globalDragX,
    [-200, 0, 200],
    ["rgba(225, 29, 72, 0.8)", "rgba(0, 0, 0, 0)", "rgba(16, 185, 129, 0.8)"]
  );
  
  const textShadow = useMotionTemplate`0px 10px 80px ${auraColor}, 0px 2px 20px ${auraColor}`;

  const subtitleEn = "An intuitive German vocabulary app that paints language as colour. Powered by the FSRS algorithm, it leverages visual memory for noun genders (Der, Die, Das)—turning grammar into a fluid palette you can feel.";
  const subtitleZh = "一款直觉化的德语背单词应用。基于强大的 FSRS 记忆算法，用色彩潜移默化地帮您掌握词汇，彻底告别枯燥的 Der, Die, Das 死记硬背。";

  return (
    <section className="relative w-full max-w-[800px] pt-[15vh] pb-12 md:pt-[20vh] md:ml-[5%]">
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 font-mono uppercase tracking-[0.32em] text-accent"
        style={{ fontSize: 12 }}
      >
        (Now live)
      </motion.p>

      {/* Interactive Swipeable Title */}
      <motion.div
        style={{ x: globalDragX, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 20 }}
        className="inline-block cursor-grab active:cursor-grabbing relative"
      >
        <motion.h1
          whileHover={{ scale: 1.02, rotate: -1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex font-serif leading-[0.92] tracking-[-0.02em] origin-bottom"
          style={{ fontSize: "clamp(4rem, 12vw, 9rem)", fontWeight: 300, textShadow }}
        >
          {"TintWord".split("").map((c, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 80, rotate: 6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              {c}
            </motion.span>
          ))}
        </motion.h1>
      </motion.div>

      <motion.p
        key={lang} // Re-animate when lang changes
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
        className="mt-8 max-w-[500px] text-muted-foreground"
        style={{ fontSize: "1.1rem", lineHeight: 1.6 }}
      >
        {lang === "en" ? subtitleEn : subtitleZh}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-12 flex items-center"
      >
        {/* Elastic Download Pill */}
        <MagneticPill href="https://play.google.com/store/apps/details?id=eu.jliu.tintword" />
      </motion.div>
    </section>
  );
}
