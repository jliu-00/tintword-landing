import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function MorphingText() {
  const [stage, setStage] = useState(0);

  const words = [
    "fährt ab",
    "fuhr ab",
    "ist abgefahren"
  ];

  return (
    <div 
      className="inline-flex flex-col items-start cursor-pointer"
      onMouseEnter={() => setStage(1)}
      onMouseLeave={() => setStage(0)}
      onClick={() => setStage((prev) => (prev + 1) % 3)}
    >
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className={stage === 0 ? "text-accent" : ""}>Präsens</span>
        <span className="opacity-30">→</span>
        <span className={stage === 1 ? "text-accent" : ""}>Präteritum</span>
        <span className="opacity-30">→</span>
        <span className={stage === 2 ? "text-accent" : ""}>Perfekt</span>
      </div>
      
      <div className="h-10 relative overflow-hidden flex items-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={stage}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="font-serif text-2xl text-accent font-bold"
          >
            {words[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
