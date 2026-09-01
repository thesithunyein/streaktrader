"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface Wave {
  amplitude: number;
  frequency: number;
  speed: number;
  offset: number;
  y: number;
  opacity: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 40 + 200, // 200-240 = blue range
      });
    }

    // Waves
    const waves: Wave[] = [
      { amplitude: 30, frequency: 0.003, speed: 0.008, offset: 0, y: height * 0.65, opacity: 0.06, color: "#2563eb" },
      { amplitude: 20, frequency: 0.005, speed: 0.012, offset: 2, y: height * 0.7, opacity: 0.04, color: "#60a5fa" },
      { amplitude: 40, frequency: 0.002, speed: 0.006, offset: 4, y: height * 0.75, opacity: 0.03, color: "#1d4ed8" },
    ];

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.5, "#eff6ff");
      grad.addColorStop(1, "#f0f4ff");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle radial glow
      const radialGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.3, 0,
        width * 0.5, height * 0.3, width * 0.5
      );
      radialGrad.addColorStop(0, "rgba(37, 99, 235, 0.08)");
      radialGrad.addColorStop(0.5, "rgba(37, 99, 235, 0.03)");
      radialGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw waves
      for (const wave of waves) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 2) {
          const y =
            wave.y +
            Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 1.3) * wave.amplitude * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = wave.color.replace(")", `, ${wave.opacity})`).replace("rgb", "rgba").replace("#", "");
        // Convert hex to rgba
        const r = parseInt(wave.color.slice(1, 3), 16);
        const g = parseInt(wave.color.slice(3, 5), 16);
        const b = parseInt(wave.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${wave.opacity})`;
        ctx.fill();
      }

      // Draw and update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Pulsing opacity
        const pulse = Math.sin(time * 0.02 + p.x * 0.01) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${p.opacity + pulse})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${(p.opacity + pulse) * 0.15})`;
        ctx.fill();
      }

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Floating orbs — large soft blobs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const orbX = width * (0.2 + i * 0.3) + Math.sin(time * 0.005 + i * 2) * 80;
        const orbY = height * (0.3 + i * 0.15) + Math.cos(time * 0.007 + i * 1.5) * 60;
        const orbSize = 120 + Math.sin(time * 0.01 + i) * 30;

        const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize);
        orbGrad.addColorStop(0, `rgba(37, 99, 235, ${0.06 + Math.sin(time * 0.008 + i) * 0.02})`);
        orbGrad.addColorStop(0.5, "rgba(37, 99, 235, 0.02)");
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.fillRect(orbX - orbSize, orbY - orbSize, orbSize * 2, orbSize * 2);
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
