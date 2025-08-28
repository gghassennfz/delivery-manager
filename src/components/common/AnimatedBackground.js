import React, { useEffect, useRef, useState } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Create observer for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize particles
    const initParticles = () => {
      const particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: isDarkMode 
            ? `hsl(${200 + Math.random() * 60}, ${70 + Math.random() * 30}%, ${60 + Math.random() * 30}%)`
            : `hsl(${210 + Math.random() * 40}, ${60 + Math.random() * 40}%, ${50 + Math.random() * 30}%)`
        });
      }
      particlesRef.current = particles;
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Draw floating orbs
    const drawOrbs = () => {
      const orbs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, size: 150, opacity: 0.1 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7, size: 200, opacity: 0.08 },
        { x: canvas.width * 0.6, y: canvas.height * 0.2, size: 120, opacity: 0.12 },
        { x: canvas.width * 0.3, y: canvas.height * 0.8, size: 180, opacity: 0.09 }
      ];

      orbs.forEach((orb, index) => {
        const time = Date.now() * 0.0003;
        const x = orb.x + Math.sin(time + index) * 15;
        const y = orb.y + Math.cos(time + index * 0.5) * 10;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.size);
        if (isDarkMode) {
          gradient.addColorStop(0, `rgba(96, 165, 250, ${orb.opacity * 0.8})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${orb.opacity * 0.4})`);
        } else {
          gradient.addColorStop(0, `rgba(59, 130, 246, ${orb.opacity})`);
          gradient.addColorStop(0.5, `rgba(147, 197, 253, ${orb.opacity * 0.5})`);
        }
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw animated waves
    const drawWaves = () => {
      const time = Date.now() * 0.0008;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height - 100 - i * 50 + 
                   Math.sin((x * 0.01) + (time * (1 + i * 0.5))) * (30 + i * 10) +
                   Math.sin((x * 0.02) + (time * 2)) * 15;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isDarkMode) {
          gradient.addColorStop(0, `rgba(96, 165, 250, ${0.08 - i * 0.015})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${0.04 - i * 0.008})`);
        } else {
          gradient.addColorStop(0, `rgba(59, 130, 246, ${0.1 - i * 0.02})`);
          gradient.addColorStop(1, `rgba(29, 78, 216, ${0.05 - i * 0.01})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Draw particles with mouse interaction
    const drawParticles = () => {
      particlesRef.current.forEach((particle) => {
        // Mouse attraction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.x += dx * force * 0.02;
          particle.y += dy * force * 0.02;
        }

        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('hsl', 'hsla');
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = isDarkMode 
              ? `rgba(96, 165, 250, ${0.12 * (1 - distance / 100)})`
              : `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
    };

    // Draw geometric shapes
    const drawGeometricShapes = () => {
      const time = Date.now() * 0.0004;
      
      // Floating hexagons
      for (let i = 0; i < 4; i++) {
        ctx.save();
        const x = (canvas.width / 5) * (i + 1) + Math.sin(time * 0.3 + i) * 30;
        const y = canvas.height * 0.15 + Math.cos(time * 0.2 + i) * 20;
        const rotation = time * (0.08 + i * 0.01);
        const scale = 0.6 + Math.sin(time * 0.5 + i) * 0.15;
        
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j * Math.PI) / 3;
          const hx = Math.cos(angle) * 15;
          const hy = Math.sin(angle) * 15;
          if (j === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        
        ctx.fillStyle = isDarkMode 
          ? `rgba(125, 211, 252, ${0.1 + Math.cos(time + i) * 0.04})`
          : `rgba(147, 197, 253, ${0.08 + Math.cos(time + i) * 0.03})`;
        ctx.fill();
        ctx.restore();
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawWaves();
      drawOrbs();
      drawGeometricShapes();
      drawParticles();
      
      animationId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ 
        background: document.documentElement.classList.contains('dark')
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
      }}
    />
  );
};

export default AnimatedBackground;
