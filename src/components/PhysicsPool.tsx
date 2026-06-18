import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

// Enhanced Morandi Colors & Genders
const wordsData = [
  { text: "der Baum", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "der Tisch", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "der Hund", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "der Apfel", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "die Frau", color: "#AD8A8D", gender: "die", w: 110, h: 48 },
  { text: "die Tür", color: "#AD8A8D", gender: "die", w: 100, h: 48 },
  { text: "die Katze", color: "#AD8A8D", gender: "die", w: 120, h: 48 },
  { text: "die Blume", color: "#AD8A8D", gender: "die", w: 120, h: 48 },
  { text: "das Kind", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "das Auto", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "das Haus", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "das Buch", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "abfahren", color: "#9B929A", gender: "none", w: 130, h: 48 },
  { text: "schnell", color: "#9C928A", gender: "none", w: 110, h: 48 },
];

export function PhysicsPool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // React state for HUD
  const [score, setScore] = useState(0);
  const [vortexPositions, setVortexPositions] = useState({
    der: { x: 0, y: 0 },
    die: { x: 0, y: 0 },
    das: { x: 0, y: 0 }
  });

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

    // Invisible Boundaries
    const ground = Bodies.rectangle(width / 2, physicsHeight + 30, width * 2, 60, { isStatic: true, render: { visible: false } });
    const wallLeft = Bodies.rectangle(-30, physicsHeight / 2, 60, physicsHeight * 2, { isStatic: true, render: { visible: false } });
    const wallRight = Bodies.rectangle(width + 30, physicsHeight / 2, 60, physicsHeight * 2, { isStatic: true, render: { visible: false } });

    World.add(world, [ground, wallLeft, wallRight]);

    // Create Wandering Gravity Vortexes (Sensors)
    // We make them circular sensors that move around
    const vortexDer = Bodies.circle(width * 0.2, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_der" });
    const vortexDie = Bodies.circle(width * 0.5, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_die" });
    const vortexDas = Bodies.circle(width * 0.8, physicsHeight * 0.5, 60, { isStatic: true, isSensor: true, label: "vortex_das" });

    World.add(world, [vortexDer, vortexDie, vortexDas]);

    // Create word bodies
    const wordBodies = wordsData.map((w) => {
      const x = Math.random() * (width - 200) + 100;
      const y = -Math.random() * 500 - 100; 
      
      const body = Bodies.rectangle(x, y, w.w, w.h, {
        restitution: 0.6,
        friction: 0.1,
        frictionAir: 0.05, // more air friction so they float a bit
        density: 0.05,
      });

      (body as any).gender = w.gender;
      (body as any).isAbsorbed = false;
      return body;
    });

    World.add(world, wordBodies);

    // Mouse control
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.9, render: { visible: false } }
    });

    // FIX: prevent Matter.js from capturing scroll events so the page is still scrollable
    mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);

    World.add(world, mouseConstraint);

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
        
        // 1. Vortex Gravity & Repulsion
        if (genA !== "none") {
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
                  Matter.Composite.remove(world, bodyA);
                  setScore(s => s + 1);
                }
              } else {
                // EXPLOSIVE repulsion from wrong vortex
                if (distSq < 30000) {
                  // Force drop if user is holding it
                  if (mouseConstraint.body === bodyA) {
                    (mouseConstraint as any).body = null;
                    mouseConstraint.mouse.button = -1;
                  }
                  
                  // Use setVelocity for a violent, guaranteed blast
                  const speed = 50 * (30000 - distSq) / 30000;
                  Matter.Body.setVelocity(bodyA, { 
                    x: -(dx / Math.sqrt(distSq)) * speed, 
                    y: -(dy / Math.sqrt(distSq)) * speed 
                  });
                }
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
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let animationFrameId: number;
    const updateDOM = () => {
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
          }
        }
      });
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
        {score > 0 && (
          <p className="text-2xl font-mono text-accent mt-2 tracking-widest opacity-40">Score: {score}</p>
        )}
      </div>

      {/* Wandering Vortex Visuals */}
      {/* Deepened colors and opacity to make them clearly visible */}
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, rgba(107,127,140,0.8) 0%, rgba(107,127,140,0) 70%)",
          transform: `translate(${vortexPositions.der.x - 80}px, ${vortexPositions.der.y - 80}px)`
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, rgba(173,138,141,0.8) 0%, rgba(173,138,141,0) 70%)",
          transform: `translate(${vortexPositions.die.x - 80}px, ${vortexPositions.die.y - 80}px)`
        }}
      />
      <div 
        className="absolute rounded-full pointer-events-none transition-transform duration-[50ms]"
        style={{
          width: 160, height: 160,
          background: "radial-gradient(circle, rgba(139,156,137,0.8) 0%, rgba(139,156,137,0) 70%)",
          transform: `translate(${vortexPositions.das.x - 80}px, ${vortexPositions.das.y - 80}px)`
        }}
      />

      {/* DOM Nodes representing the rigid bodies */}
      {wordsData.map((w, i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className="absolute top-0 left-0 flex items-center justify-center text-white font-serif text-xl rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none hover:brightness-110 transition-opacity duration-300 ease-out z-10"
          style={{
            width: w.w,
            height: w.h,
            backgroundColor: w.color,
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.15)"
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}
