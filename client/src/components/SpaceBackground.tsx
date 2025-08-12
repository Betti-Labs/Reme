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

    // Create stars
    const stars: Star[] = [];
    const numStars = 800;
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        color: ['#ffffff', '#aaccff', '#ffaacc', '#aaffcc'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    // Create galaxy spiral
    const galaxyStars: Star[] = [];
    const numGalaxyStars = 400;
    
    for (let i = 0; i < numGalaxyStars; i++) {
      const angle = (i / numGalaxyStars) * Math.PI * 8; // 4 full rotations
      const radius = (i / numGalaxyStars) * 200 + 50;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      galaxyStars.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.3, // Flatten the spiral
        z: Math.random() * 500,
        size: Math.random() * 1.5,
        speed: 0.02,
        color: ['#4f46e5', '#7c3aed', '#0ea5e9', '#06b6d4'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    // Matrix rain effect
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const matrixColumns = Math.floor(canvas.width / 15);
    const matrixDrops: number[] = Array(matrixColumns).fill(1);

    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      // Draw regular stars
      stars.forEach((star, index) => {
        star.y += star.speed;
        star.z -= 2;
        
        if (star.y > canvas.height) star.y = 0;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
        }

        const x = star.x + Math.sin(time + index * 0.1) * 0.5;
        const y = star.y + Math.cos(time + index * 0.1) * 0.5;
        const size = star.size * (1000 / (1000 - star.z));
        const opacity = star.opacity * (star.z / 1000);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = size * 2;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw galaxy spiral
      galaxyStars.forEach((star, index) => {
        const angle = time * star.speed + (index / galaxyStars.length) * Math.PI * 8;
        const radius = (index / galaxyStars.length) * 200 + 50;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.3;
        
        ctx.save();
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw matrix rain (subtle)
      ctx.fillStyle = '#00ff41';
      ctx.font = '12px monospace';
      
      for (let i = 0; i < matrixColumns; i++) {
        if (Math.random() > 0.98) { // Very sparse
          const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
          const x = i * 15;
          const y = matrixDrops[i] * 15;
          
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.fillText(text, x, y);
          ctx.restore();
          
          if (y > canvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }
      }

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
        style={{ background: 'radial-gradient(ellipse at center, #0f0f1a 0%, #000000 70%)' }}
      />
      
      {/* Additional gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/5 via-transparent to-purple-900/5" />
    </div>
  );
}