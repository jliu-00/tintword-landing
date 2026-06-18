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
      onClick={(e) => {
        e.stopPropagation();
        setStage((prev) => (prev + 1) % 3);
      }}
      onMouseLeave={() => setStage(0)}
    >
      <div className="text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-2 opacity-80">
        <span 
          className={`transition-colors ${stage === 0 ? "font-bold opacity-100" : "opacity-50 hover:opacity-100"}`}
          onMouseEnter={() => setStage(0)}
        >
          Präsens
        </span>
        <span className="opacity-30">→</span>
        <span 
          className={`transition-colors ${stage === 1 ? "font-bold opacity-100" : "opacity-50 hover:opacity-100"}`}
          onMouseEnter={() => setStage(1)}
        >
          Präteritum
        </span>
        <span className="opacity-30">→</span>
        <span 
          className={`transition-colors ${stage === 2 ? "font-bold opacity-100" : "opacity-50 hover:opacity-100"}`}
          onMouseEnter={() => setStage(2)}
        >
          Perfekt
        </span>
      </div>
      
      <div className="h-10 relative overflow-hidden flex items-center w-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={stage}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="font-serif text-3xl font-bold"
            style={{ color: "currentColor" }}
          >
            {words[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
