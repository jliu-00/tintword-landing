import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

// Enhanced Morandi Colors & Genders
const wordsData = [
  { text: "der Baum", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "der Tisch", color: "#6B7F8C", gender: "der", w: 120, h: 48 },
  { text: "die Frau", color: "#AD8A8D", gender: "die", w: 110, h: 48 },
  { text: "die Tür", color: "#AD8A8D", gender: "die", w: 100, h: 48 },
  { text: "das Kind", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "das Auto", color: "#8B9C89", gender: "das", w: 110, h: 48 },
  { text: "abfahren", color: "#9B929A", gender: "none", w: 130, h: 48 },
  { text: "schnell", color: "#9C928A", gender: "none", w: 110, h: 48 },
];

export function PhysicsPool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [score, setScore] = useState(0);

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

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    const width = containerRef.current.clientWidth;
    const height = 400;

    // Boundaries
    const ground = Bodies.rectangle(width / 2, height + 30, width * 2, 60, { isStatic: true });
    const wallLeft = Bodies.rectangle(-30, height / 2, 60, height * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(width + 30, height / 2, 60, height * 2, { isStatic: true });

    World.add(world, [ground, wallLeft, wallRight]);

    // Create Magnetic Sensor Buckets (Der, Die, Das)
    const bucketWidth = width / 3;
    const bucketY = height - 20;
    
    const bucketDer = Bodies.rectangle(bucketWidth / 2, bucketY, bucketWidth, 60, { 
      isStatic: true, isSensor: true, label: "bucket_der" 
    });
    const bucketDie = Bodies.rectangle(bucketWidth * 1.5, bucketY, bucketWidth, 60, { 
      isStatic: true, isSensor: true, label: "bucket_die" 
    });
    const bucketDas = Bodies.rectangle(bucketWidth * 2.5, bucketY, bucketWidth, 60, { 
      isStatic: true, isSensor: true, label: "bucket_das" 
    });

    World.add(world, [bucketDer, bucketDie, bucketDas]);

    // Create word bodies
    const wordBodies = wordsData.map((w) => {
      const x = Math.random() * (width - 200) + 100;
      const y = -Math.random() * 500 - 100; // drop from top
      
      const body = Bodies.rectangle(x, y, w.w, w.h, {
        restitution: 0.6,
        friction: 0.1,
        frictionAir: 0.02,
        density: 0.05,
      });

      // Attach custom properties for game logic
      (body as any).gender = w.gender;
      (body as any).isAbsorbed = false;
      return body;
    });

    World.add(world, wordBodies);

    // Mouse control
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });

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

    // --- QUANTUM REPULSION ENGINE ---
    Events.on(engine, "beforeUpdate", () => {
      const bodies = Composite.allBodies(world).filter(b => (b as any).gender);

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const bodyA = bodies[i];
          const bodyB = bodies[j];
          
          const genA = (bodyA as any).gender;
          const genB = (bodyB as any).gender;

          // Only repel if they are valid genders and different
          if (genA !== "none" && genB !== "none" && genA !== genB) {
            const dx = bodyB.position.x - bodyA.position.x;
            const dy = bodyB.position.y - bodyA.position.y;
            const distSq = dx * dx + dy * dy;

            // Repel if closer than 150px
            if (distSq < 22500 && distSq > 100) {
              const forceMagnitude = 0.00004 * (22500 - distSq) / 22500;
              const fx = (dx / Math.sqrt(distSq)) * forceMagnitude;
              const fy = (dy / Math.sqrt(distSq)) * forceMagnitude;
              
              Matter.Body.applyForce(bodyA, bodyA.position, { x: -fx, y: -fy });
              Matter.Body.applyForce(bodyB, bodyB.position, { x: fx, y: fy });
            }
          }
        }
      }
    });

    // --- MAGNETIC SORTING ABSORPTION ---
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const checkAbsorption = (sensor: Matter.Body, item: Matter.Body) => {
          if (!sensor.label.startsWith("bucket_")) return;
          const targetGender = sensor.label.replace("bucket_", "");
          
          if ((item as any).gender === targetGender && !(item as any).isAbsorbed) {
            (item as any).isAbsorbed = true;
            // Pop the body out of physical interaction instantly
            Matter.Composite.remove(world, item);
            setScore((s) => s + 1);
          }
        };

        checkAbsorption(pair.bodyA, pair.bodyB);
        checkAbsorption(pair.bodyB, pair.bodyA);
      });
    });

    // Run engine
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Sync DOM
    let animationFrameId: number;
    const updateDOM = () => {
      wordBodies.forEach((body, index) => {
        const el = elementsRef.current[index];
        if (el) {
          if ((body as any).isAbsorbed) {
            // Shrink and fade out absorbed items
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
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: height + 30 });
      Matter.Body.setPosition(wallRight, { x: newWidth + 30, y: height / 2 });
      
      const newBW = newWidth / 3;
      Matter.Body.setPosition(bucketDer, { x: newBW / 2, y: bucketY });
      Matter.Body.setPosition(bucketDie, { x: newBW * 1.5, y: bucketY });
      Matter.Body.setPosition(bucketDas, { x: newBW * 2.5, y: bucketY });
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
    <div className="w-full h-[400px] relative overflow-hidden mt-32 rounded-[32px] border border-foreground/5 bg-foreground/[0.02] shadow-inner" ref={containerRef}>
      
      {/* Background UI & Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
        <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">Magnetic Sorting</h2>
        {score > 0 && (
          <p className="text-3xl font-mono text-accent">Score: {score}</p>
        )}
      </div>

      {/* Bucket Visuals */}
      <div className="absolute bottom-0 w-full h-[60px] flex text-white/40 font-mono text-xl uppercase tracking-widest pointer-events-none z-0">
        <div className="flex-1 border-t-2 border-r-2 border-[#6B7F8C]/30 bg-[#6B7F8C]/10 flex items-center justify-center">Der</div>
        <div className="flex-1 border-t-2 border-r-2 border-[#AD8A8D]/30 bg-[#AD8A8D]/10 flex items-center justify-center">Die</div>
        <div className="flex-1 border-t-2 border-[#8B9C89]/30 bg-[#8B9C89]/10 flex items-center justify-center">Das</div>
      </div>

      {/* DOM Nodes representing the rigid bodies */}
      {wordsData.map((w, i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className="absolute top-0 left-0 flex items-center justify-center text-white font-serif text-xl rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none hover:brightness-110 transition-[transform,opacity] duration-300 ease-out z-10"
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
