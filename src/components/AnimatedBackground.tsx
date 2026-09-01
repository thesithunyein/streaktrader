"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let W = 0;
    let H = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = Math.max(window.innerHeight, 900);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX / W;
      mouseY = e.clientY / H;
    };
    window.addEventListener("mousemove", handleMouse);

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; hue: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2.5 + 0.8,
        a: Math.random() * 0.4 + 0.1,
        hue: 210 + Math.random() * 30,
      });
    }

    let t = 0;

    const hex2rgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const draw = () => {
      // ── Base gradient ──
      const base = ctx.createLinearGradient(0, 0, W, H);
      base.addColorStop(0, "#f0f5ff");
      base.addColorStop(0.35, "#e8f0fe");
      base.addColorStop(0.65, "#f5f8ff");
      base.addColorStop(1, "#eaf0ff");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      // ── Subtle grid ──
      ctx.strokeStyle = "rgba(37, 99, 235, 0.04)";
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Mesh gradient blobs ──
      const blobs = [
        { cx: W * 0.15, cy: H * 0.2, r: 350, color: "#2563eb", opacity: 0.07 },
        { cx: W * 0.85, cy: H * 0.15, r: 300, color: "#60a5fa", opacity: 0.06 },
        { cx: W * 0.5, cy: H * 0.6, r: 400, color: "#3b82f6", opacity: 0.05 },
        { cx: W * 0.2, cy: H * 0.8, r: 280, color: "#818cf8", opacity: 0.04 },
        { cx: W * 0.75, cy: H * 0.75, r: 320, color: "#1d4ed8", opacity: 0.05 },
      ];

      for (const blob of blobs) {
        const bx = blob.cx + Math.sin(t * 0.004 + blob.cx * 0.001) * 60 + (mouseX - 0.5) * 40;
        const by = blob.cy + Math.cos(t * 0.003 + blob.cy * 0.001) * 50 + (mouseY - 0.5) * 30;
        const br = blob.r + Math.sin(t * 0.006 + blob.cx) * 40;

        const { r, g, b } = hex2rgb(blob.color);
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${blob.opacity + Math.sin(t * 0.005) * 0.015})`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${blob.opacity * 0.5})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }

      // ── Aurora / wave bands ──
      const waveData = [
        { y: H * 0.55, amp: 50, freq: 0.002, spd: 0.01, color: "#2563eb", opacity: 0.06 },
        { y: H * 0.65, amp: 35, freq: 0.003, spd: 0.015, color: "#60a5fa", opacity: 0.04 },
        { y: H * 0.72, amp: 60, freq: 0.0015, spd: 0.008, color: "#3b82f6", opacity: 0.03 },
        { y: H * 0.8, amp: 25, freq: 0.004, spd: 0.02, color: "#818cf8", opacity: 0.025 },
      ];

      for (const w of waveData) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const y =
            w.y +
            Math.sin(x * w.freq + t * w.spd) * w.amp +
            Math.sin(x * w.freq * 1.7 + t * w.spd * 0.7) * w.amp * 0.4 +
            Math.cos(x * w.freq * 0.5 + t * w.spd * 1.5) * w.amp * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        const { r, g, b } = hex2rgb(w.color);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${w.opacity})`;
        ctx.fill();
      }

      // ── Grid dots (intersection glow) ──
      for (let x = gridSize; x < W; x += gridSize) {
        for (let y = gridSize; y < H; y += gridSize) {
          const distToMouse = Math.sqrt((x / W - mouseX) ** 2 + (y / H - mouseY) ** 2);
          const glow = Math.max(0, 1 - distToMouse * 3) * 0.3;
          const pulse = Math.sin(t * 0.02 + x * 0.01 + y * 0.01) * 0.05;
          const alpha = 0.06 + glow + pulse;

          ctx.beginPath();
          ctx.arc(x, y, 1.5 + glow * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.fill();
        }
      }

      // ── Particles ──
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const pulse = Math.sin(t * 0.015 + p.x * 0.005) * 0.12;
        const alpha = p.a + pulse;

        // Glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 70%, 55%, ${alpha * 0.3})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${alpha + 0.1})`;
        ctx.fill();
      }

      // ── Connecting lines ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // ── Top-center hero glow (mouse-reactive) ──
      const heroGlowX = W * 0.5 + (mouseX - 0.5) * 30;
      const heroGlowY = H * 0.25 + (mouseY - 0.5) * 20;
      const heroGrad = ctx.createRadialGradient(heroGlowX, heroGlowY, 0, heroGlowX, heroGlowY, 250);
      heroGrad.addColorStop(0, "rgba(37, 99, 235, 0.08)");
      heroGrad.addColorStop(0.5, "rgba(37, 99, 235, 0.03)");
      heroGrad.addColorStop(1, "transparent");
      ctx.fillStyle = heroGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Vignette ──
      const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.8);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(240, 245, 255, 0.4)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      t++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
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
