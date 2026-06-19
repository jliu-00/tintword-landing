import { useEffect, useRef } from "react";

// TintWord Pos colors for ink droplets
const colors = ["#8B9EA8", "#C49FA2", "#A8B5A0", "#B5AFA8", "#A899B5"];

export function LiquidCursor() {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          return;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      mouse.current = { x: clientX, y: clientY };
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });

    // Initial setup of dots
    const dots: { x: number; y: number; el: HTMLDivElement }[] = [];
    dotsRef.current.forEach((el, index) => {
      if (el) {
        dots.push({ x: window.innerWidth / 2, y: window.innerHeight / 2, el });
        // Assign color
        el.style.backgroundColor = colors[index % colors.length];
      }
    });

    let animationFrameId: number;

    const animate = () => {
      let x = mouse.current.x;
      let y = mouse.current.y;

      dots.forEach((dot) => {
        // Calculate physics: each dot follows the one before it, creating a fluid trail
        dot.x += (x - dot.x) * 0.3; // smoothing factor
        dot.y += (y - dot.y) * 0.3;
        
        // Update DOM directly for 60fps
        dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
        
        // The next target for the subsequent dot is the current dot's position
        x = dot.x;
        y = dot.y;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <svg className="fixed pointer-events-none w-0 h-0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 22 -9" 
              result="goo" 
            />
            {/* Optional: Add blend to make it look more opaque */}
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      
      <div 
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden" 
        style={{ filter: 'url(#goo)' }}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="absolute rounded-full opacity-60 mix-blend-multiply"
            style={{
              top: 0,
              left: 0,
              // Make the head larger and tail smaller
              width: `${Math.max(10, 40 - i * 2.5)}px`,
              height: `${Math.max(10, 40 - i * 2.5)}px`,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </>
  );
}
