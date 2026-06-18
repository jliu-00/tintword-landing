import { useEffect, useRef } from "react";
import Matter from "matter-js";

const words = [
  { text: "der Baum", color: "#8B9EA8", w: 120, h: 48 },
  { text: "die Frau", color: "#C49FA2", w: 110, h: 48 },
  { text: "das Kind", color: "#A8B5A0", w: 110, h: 48 },
  { text: "abfahren", color: "#B5AFA8", w: 130, h: 48 },
  { text: "schön", color: "#A899B5", w: 90, h: 48 },
  { text: "wischen", color: "#B5AFA8", w: 120, h: 48 },
  { text: "die Sprache", color: "#C49FA2", w: 140, h: 48 },
  { text: "schnell", color: "#A899B5", w: 110, h: 48 },
];

export function PhysicsPool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Module aliases
    const Engine = Matter.Engine,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    const width = containerRef.current.clientWidth;
    const height = 400; // Fixed height for the pool

    // Create boundaries
    const ground = Bodies.rectangle(width / 2, height + 30, width * 2, 60, { isStatic: true });
    const wallLeft = Bodies.rectangle(-30, height / 2, 60, height * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(width + 30, height / 2, 60, height * 2, { isStatic: true });

    World.add(world, [ground, wallLeft, wallRight]);

    // Create word bodies
    const wordBodies = words.map((w) => {
      // random initial position
      const x = Math.random() * (width - 200) + 100;
      const y = -Math.random() * 500 - 100; // drop from top
      
      return Bodies.rectangle(x, y, w.w, w.h, {
        restitution: 0.6, // Bounciness
        friction: 0.1,
        frictionAir: 0.02,
        density: 0.05,
        render: { visible: false } // We use DOM nodes, not Canvas
      });
    });

    World.add(world, wordBodies);

    // Add mouse control
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(world, mouseConstraint);

    // Keep the mouse in sync with rendering
    // Usually only needed if using canvas rendering, but good to have
    
    // Run the engine
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Sync DOM elements with Physics Bodies
    let animationFrameId: number;
    const updateDOM = () => {
      wordBodies.forEach((body, index) => {
        const el = elementsRef.current[index];
        if (el) {
          const { x, y } = body.position;
          // Apply position and rotation
          el.style.transform = `translate(${x - words[index].w / 2}px, ${y - words[index].h / 2}px) rotate(${body.angle}rad)`;
        }
      });
      animationFrameId = requestAnimationFrame(updateDOM);
    };

    updateDOM();

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || window.innerWidth;
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: height + 30 });
      Matter.Body.setPosition(wallRight, { x: newWidth + 30, y: height / 2 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div className="w-full h-[400px] relative overflow-hidden mt-32 rounded-[32px] border border-foreground/5 bg-foreground/[0.02] shadow-inner" ref={containerRef}>
      
      {/* Background hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Vocabulary Pool</h2>
      </div>

      {/* DOM Nodes representing the rigid bodies */}
      {words.map((w, i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className="absolute top-0 left-0 flex items-center justify-center text-white font-serif text-xl rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none hover:brightness-110 transition-[filter]"
          style={{
            width: w.w,
            height: w.h,
            backgroundColor: w.color,
            willChange: "transform",
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 16px rgba(0,0,0,0.15)"
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}
