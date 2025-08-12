import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animationId: number;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create subtle stars
    const stars: Star[] = [];
    const numStars = 120; // Much fewer stars
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 1 + 0.5, // Smaller stars
        speed: 0.02, // Much slower movement
        color: '#ffffff', // Just white stars
        opacity: Math.random() * 0.3 + 0.1 // Much more subtle
      });
    }

    let time = 0;

    const animate = () => {
      // Clear with a solid dark background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.001; // Much slower time progression

      // Draw subtle static stars with gentle twinkling
      stars.forEach((star, index) => {
        // Very gentle twinkling effect
        const twinkle = Math.sin(time * 2 + index * 0.5) * 0.1 + 0.9;
        const opacity = star.opacity * twinkle;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #000000 100%)' }}
      />
      
      {/* Additional gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/5 via-transparent to-purple-900/5" />
    </div>
  );
}