import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

// Enhanced Morandi Colors & Genders
const wordsData = [
  { text: "der Baum", color: "var(--der-color)", gender: "der", w: 120, h: 48 },
  { text: "der Tisch", color: "var(--der-color)", gender: "der", w: 120, h: 48 },
  { text: "der Hund", color: "var(--der-color)", gender: "der", w: 120, h: 48 },
  { text: "der Apfel", color: "var(--der-color)", gender: "der", w: 120, h: 48 },
  { text: "die Frau", color: "var(--die-color)", gender: "die", w: 110, h: 48 },
  { text: "die Tür", color: "var(--die-color)", gender: "die", w: 100, h: 48 },
  { text: "die Katze", color: "var(--die-color)", gender: "die", w: 120, h: 48 },
  { text: "die Blume", color: "var(--die-color)", gender: "die", w: 120, h: 48 },
  { text: "das Kind", color: "var(--das-color)", gender: "das", w: 110, h: 48 },
  { text: "das Auto", color: "var(--das-color)", gender: "das", w: 110, h: 48 },
  { text: "das Haus", color: "var(--das-color)", gender: "das", w: 110, h: 48 },
  { text: "das Buch", color: "var(--das-color)", gender: "das", w: 110, h: 48 },
];

export function PhysicsPool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // React state for HUD
  const [score, setScore] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<HTMLParagraphElement>(null);
  
  const [vortexPositions, setVortexPositions] = useState({
    der: { x: 0, y: 0 },
    die: { x: 0, y: 0 },
    das: { x: 0, y: 0 }
  });

  useEffect(() => {
    const savedBest = localStorage.getItem("tintword_best_time");
    if (savedBest) setBestTime(Number(savedBest));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Module aliases
    const Engine = Matter.Engine,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Events = Matter.Events,
      Composite = Matter.Composite;

    const engine = Engine.create();
    const world = engine.world;
    engine.gravity.y = 0.5; // Slightly lower gravity for "floating" effect

    const width = containerRef.current.clientWidth;
    // Set fixed height for the physics area so it overlays naturally over the bottom half
    const physicsHeight = 600; 

    // Collision Categories
    const CAT_WORD = 0x0001;
    const CAT_BOUNDARY = 0x0002;

    // Invisible Boundaries
    const ground = Bodies.rectangle(width / 2, physicsHeight + 30, width * 2, 60, { isStatic: true, render: { visible: false }, collisionFilter: { category: CAT_BOUNDARY } });
    const wallLeft = Bodies.rectangle(-30, physicsHeight / 2, 60, physicsHeight * 2, { isStatic: true, render: { visible: false }, collisionFilter: { category: CAT_BOUNDARY } });
    const wallRight = Bodies.rectangle(width + 30, physicsHeight / 2, 60, physicsHeight * 2, { isStatic: true, render: { visible: false }, collisionFilter: { category: CAT_BOUNDARY } });

    World.add(world, [ground, wallLeft, wallRight]);

    // Create Wandering Gravity Vortexes (Sensors)
    // We make them circular sensors that move around
    const vortexDer = Bodies.circle(width * 0.2, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_der", collisionFilter: { category: CAT_BOUNDARY } });
    const vortexDie = Bodies.circle(width * 0.5, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_die", collisionFilter: { category: CAT_BOUNDARY } });
    const vortexDas = Bodies.circle(width * 0.8, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_das", collisionFilter: { category: CAT_BOUNDARY } });

    World.add(world, [vortexDer, vortexDie, vortexDas]);

    // Create word bodies
    // Pre-calculate and shuffle the drop heights so the drop sequence is random,
    // but the mapping index remains correctly tied to the React DOM nodes.
    const dropHeights = wordsData.map((_, i) => -100 - (i * 250) - Math.random() * 100).sort(() => Math.random() - 0.5);
    
    const wordBodies = wordsData.map((w, index) => {
      // Spread across the full width, keeping a 60px padding from edges
      const x = Math.random() * (width - 120) + 60;
      const y = dropHeights[index];
      
      const body = Bodies.rectangle(x, y, w.w, w.h, {
        restitution: 0.6,
        friction: 0.1,
        frictionAir: 0.05, // more air friction so they float a bit
        density: 0.05,
        collisionFilter: { category: CAT_WORD, mask: 0xFFFFFFFF }
      });

      // Give them a slight random toss and spin so they don't fall in a rigid straight line
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: 0 });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

      (body as any).gender = w.gender;
      (body as any).isAbsorbed = false;
      return body;
    });

    World.add(world, wordBodies);

    // Mouse control
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.9, render: { visible: false } },
      collisionFilter: { mask: CAT_WORD } // FIX: Only grab words, ignore invisible ground, walls, and vortexes
    });

    // FIX: prevent Matter.js from capturing scroll events so the page is still scrollable
    // Matter.js aggressively sets touch-action: none and binds global preventDefault handlers
    mouse.element.style.touchAction = "auto";
    (mouse.element.style as any).webkitUserSelect = "auto";
    
    // Remove Matter's default aggressive wheel and touch handlers
    mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);
    
    mouse.element.removeEventListener("touchstart", (mouse as any).mousedown);
    mouse.element.removeEventListener("touchmove", (mouse as any).mousemove);
    mouse.element.removeEventListener("touchend", (mouse as any).mouseup);

    let isDragging = false;
    const handleTouchStart = (e: any) => {
      if ((e.target as HTMLElement).closest('.word-block')) {
        isDragging = true;
        (mouse as any).mousedown(e);
      }
    };
    const handleTouchMove = (e: any) => {
      if (isDragging) {
        (mouse as any).mousemove(e);
      }
    };
    const handleTouchEnd = (e: any) => {
      if (isDragging) {
        isDragging = false;
        (mouse as any).mouseup(e);
      }
    };

    mouse.element.addEventListener("touchstart", handleTouchStart, { passive: false });
    mouse.element.addEventListener("touchmove", handleTouchMove, { passive: false });
    mouse.element.addEventListener("touchend", handleTouchEnd, { passive: false });


    World.add(world, mouseConstraint);

    // Game state tracking
    let gameState: "idle" | "playing" | "finished" = "idle";
    let startTime = 0;

    Events.on(mouseConstraint, "startdrag", () => {
      if (gameState === "idle") {
        gameState = "playing";
        startTime = Date.now();
      }
    });

    // FIX: Force drop body if mouse is released outside the container
    const handleGlobalMouseUp = () => {
      if (mouseConstraint.body) {
        (mouseConstraint as any).body = null;
        mouseConstraint.mouse.button = -1;
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mouseleave", handleGlobalMouseUp);

    // Time tracker for wandering vortexes
    let time = 0;

    // --- QUANTUM REPULSION & VORTEX GRAVITY ENGINE ---
    Events.on(engine, "beforeUpdate", () => {
      time += 0.01;
      
      // Update Vortex Positions (Lissajous curves for smooth wandering)
      const moveVortex = (vortex: Matter.Body, baseX: number, phase: number) => {
        const newX = baseX + Math.sin(time + phase) * (width * 0.15);
        const newY = physicsHeight * 0.6 + Math.cos(time * 0.8 + phase) * (physicsHeight * 0.2);
        Matter.Body.setPosition(vortex, { x: newX, y: newY });
      };

      moveVortex(vortexDer, width * 0.2, 0);
      moveVortex(vortexDie, width * 0.5, 2);
      moveVortex(vortexDas, width * 0.8, 4);

      // Sync React state for vortex visual rendering
      setVortexPositions({
        der: { x: vortexDer.position.x, y: vortexDer.position.y },
        die: { x: vortexDie.position.x, y: vortexDie.position.y },
        das: { x: vortexDas.position.x, y: vortexDas.position.y }
      });

      const bodies = Composite.allBodies(world).filter(b => (b as any).gender && !(b as any).isAbsorbed);
      const vortexes = [vortexDer, vortexDie, vortexDas];

      for (let i = 0; i < bodies.length; i++) {
        const bodyA = bodies[i];
        const genA = (bodyA as any).gender;
        
        // 1. Vortex Gravity & Repulsion (Only active when playing)
        if (genA !== "none" && gameState === "playing") {
          vortexes.forEach(vortex => {
            const dx = vortex.position.x - bodyA.position.x;
            const dy = vortex.position.y - bodyA.position.y;
            const distSq = dx * dx + dy * dy;
            
            const targetGender = vortex.label.replace("vortex_", "");

            if (distSq < 40000) { // Interaction radius (~200px)
              if (genA === targetGender) {
                // Attractive pull into the correct vortex
                const pullForce = 0.00008;
                Matter.Body.applyForce(bodyA, bodyA.position, { 
                  x: dx * pullForce, 
                  y: dy * pullForce 
                });
                
                // If it reaches the exact center (very close), absorb it!
                if (distSq < 2500) {
                  (bodyA as any).isAbsorbed = true;
                  (bodyA as any).absorbedBy = targetGender;
                  Matter.Composite.remove(world, bodyA);
                  setScore(s => s + 1);
                }
              } else {
                // Wrong vortex interaction
                if (distSq < 2500) {
                  // EXPLOSION: User dragged wrong word into vortex!
                  if (mouseConstraint.body === bodyA) {
                    (mouseConstraint as any).body = null;
                    mouseConstraint.mouse.button = -1;
                  }
                  
                  // Violent blast for the offending word
                  Matter.Body.setVelocity(bodyA, { 
                    x: -(dx / Math.sqrt(distSq)) * 15, 
                    y: -(dy / Math.sqrt(distSq)) * 15 
                  });

                  // Spit out all previously eaten words by THIS vortex
                  let lostScore = 0;
                  wordBodies.forEach(wBody => {
                    if ((wBody as any).isAbsorbed && (wBody as any).absorbedBy === targetGender) {
                      (wBody as any).isAbsorbed = false;
                      (wBody as any).absorbedBy = null;
                      lostScore++;
                      
                      Matter.World.add(world, wBody);
                      Matter.Body.setPosition(wBody, { x: vortex.position.x, y: vortex.position.y });
                      
                      const angle = Math.random() * Math.PI * 2;
                      const spd = 5 + Math.random() * 10;
                      Matter.Body.setVelocity(wBody, { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd });
                    }
                  });

                  if (lostScore > 0) {
                    setScore(s => Math.max(0, s - lostScore));
                  }
                }
                // No mild repulsion anymore. Just normal interaction.
              }
            }
          });
        }

        // 2. Quantum Word Repulsion (between words)
        for (let j = i + 1; j < bodies.length; j++) {
          const bodyB = bodies[j];
          const genB = (bodyB as any).gender;

          if (genA !== "none" && genB !== "none" && genA !== genB) {
            const dx = bodyB.position.x - bodyA.position.x;
            const dy = bodyB.position.y - bodyA.position.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 22500 && distSq > 100) {
              const forceMagnitude = 0.00003 * (22500 - distSq) / 22500;
              const fx = (dx / Math.sqrt(distSq)) * forceMagnitude;
              const fy = (dy / Math.sqrt(distSq)) * forceMagnitude;
              
              Matter.Body.applyForce(bodyA, bodyA.position, { x: -fx, y: -fy });
              Matter.Body.applyForce(bodyB, bodyB.position, { x: fx, y: fy });
            }
          }
        }

        // 3. Keep words in bounds if they get blasted out
        if (bodyA.position.y > physicsHeight + 300 || bodyA.position.y < -300 || bodyA.position.x < -300 || bodyA.position.x > width + 300) {
          Matter.Body.setPosition(bodyA, { x: width / 2, y: physicsHeight / 4 });
          Matter.Body.setVelocity(bodyA, { x: 0, y: 0 });
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let animationFrameId: number;
    const updateDOM = () => {
      // Sync React state for vortex visual rendering (limit updates via timeout or just let it run)
      // Actually setVortexPositions is heavy in requestAnimationFrame, but it's done via React state previously.

      const genderedBodies = Composite.allBodies(world).filter(b => (b as any).gender && (b as any).gender !== "none" && !(b as any).isAbsorbed);
      if (gameState === "playing" && genderedBodies.length === 0) {
        gameState = "finished";
        const finalTime = Date.now() - startTime;
        if (timerRef.current) {
          timerRef.current.innerText = (finalTime / 1000).toFixed(2) + "s";
        }
        const currentBest = localStorage.getItem("tintword_best_time");
        if (!currentBest || finalTime < Number(currentBest)) {
          localStorage.setItem("tintword_best_time", finalTime.toString());
          setBestTime(finalTime);
        }
      }

      wordBodies.forEach((body, index) => {
        const el = elementsRef.current[index];
        if (el) {
          if ((body as any).isAbsorbed) {
            el.style.transform = `translate(${body.position.x - wordsData[index].w / 2}px, ${body.position.y - wordsData[index].h / 2}px) scale(0)`;
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          } else {
            const { x, y } = body.position;
            el.style.transform = `translate(${x - wordsData[index].w / 2}px, ${y - wordsData[index].h / 2}px) rotate(${body.angle}rad)`;
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
          }
        }
      });
      
      if (gameState === "playing" && timerRef.current) {
        timerRef.current.innerText = ((Date.now() - startTime) / 1000).toFixed(2) + "s";
      }

      animationFrameId = requestAnimationFrame(updateDOM);
    };

    updateDOM();

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || window.innerWidth;
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: physicsHeight + 30 });
      Matter.Body.setPosition(wallRight, { x: newWidth + 30, y: physicsHeight / 2 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mouseleave", handleGlobalMouseUp);
      window.removeEventListener("resize", handleResize);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  return (
    // Removed border, background, and shadow to blend seamlessly into the page
    // Using overflow-visible so blocks don't get abruptly cut off at the container edges
    <div className="w-full h-[600px] relative overflow-visible pointer-events-auto" ref={containerRef}>
      
      {/* Background UI & Score */}
      <div className="absolute top-10 w-full flex flex-col items-center justify-center pointer-events-none z-0">
        <p ref={timerRef} className="text-4xl font-mono text-accent opacity-80 mt-4 tracking-widest">
          0.00s
        </p>
        {bestTime && (
          <p className="text-lg font-mono text-foreground/50 tracking-widest mt-1">
            Best: {(bestTime / 1000).toFixed(2)}s
          </p>
        )}
        <p className="text-xl font-mono text-accent mt-4 tracking-widest opacity-40">Score: {score}</p>
      </div>

      {/* Wandering Vortex Visuals */}
      {/* Subtle, elegant Morandi gradient vortexes */}
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, color-mix(in srgb, var(--der-color) 25%, transparent) 0%, transparent 70%)",
          transform: `translate(${vortexPositions.der.x - 80}px, ${vortexPositions.der.y - 80}px)`
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, color-mix(in srgb, var(--die-color) 25%, transparent) 0%, transparent 70%)",
          transform: `translate(${vortexPositions.die.x - 80}px, ${vortexPositions.die.y - 80}px)`
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, color-mix(in srgb, var(--das-color) 25%, transparent) 0%, transparent 70%)",
          transform: `translate(${vortexPositions.das.x - 80}px, ${vortexPositions.das.y - 80}px)`
        }}
      />

      {/* DOM Nodes representing the rigid bodies */}
      {wordsData.map((w, i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className="word-block absolute top-0 left-0 flex items-center justify-center text-white font-serif text-xl rounded-xl cursor-grab active:cursor-grabbing select-none hover:brightness-110 transition-all duration-300 ease-out z-10 border border-white/10 backdrop-blur-md"
          style={{
            width: w.w,
            height: w.h,
            backgroundColor: `color-mix(in srgb, ${w.color} 75%, transparent)`,
            boxShadow: `0 4px 12px 0 color-mix(in srgb, ${w.color} 10%, transparent), inset 0 2px 4px rgba(255,255,255,0.2)`
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}
