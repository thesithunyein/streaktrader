"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";

// Wraps children with mouse-tracking parallax
export function MouseParallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = (e: ReactMouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - cx) / rect.width * 8,
      y: (e.clientY - cy) / rect.height * 5,
    });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Interactive heading — letters respond to mouse proximity
export function InteractiveText({
  text,
  className = "",
  gradient = false,
}: {
  text: string;
  className?: string;
  gradient?: boolean;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: ReactMouseEvent<HTMLSpanElement>) => {
    if (!containerRef.current) return;
    const letters = containerRef.current.querySelectorAll(".letter");
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    letters.forEach((letter) => {
      const el = letter as HTMLElement;
      const lRect = el.getBoundingClientRect();
      const lx = lRect.left - rect.left + lRect.width / 2;
      const ly = lRect.top - rect.top + lRect.height / 2;
      const dist = Math.sqrt((mx - lx) ** 2 + (my - ly) ** 2);
      const maxDist = 80;

      if (dist < maxDist) {
        const strength = 1 - dist / maxDist;
        const scale = 1 + strength * 0.15;
        const translateY = -strength * 3;
        el.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        el.style.filter = `brightness(${1 + strength * 0.15})`;
        el.style.textShadow = `0 0 ${strength * 20}px rgba(37, 99, 235, ${strength * 0.3})`;
      } else {
        el.style.transform = "scale(1) translateY(0)";
        el.style.filter = "none";
        el.style.textShadow = "none";
      }
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll(".letter").forEach((el) => {
      const h = el as HTMLElement;
      h.style.transform = "scale(1) translateY(0)";
      h.style.filter = "none";
      h.style.textShadow = "none";
    });
  };

  return (
    <span
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block cursor-default ${className}`}
      style={{ lineHeight: 1.1 }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="letter inline-block"
          style={{
            transition: "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.25s ease, text-shadow 0.25s ease",
            transformOrigin: "center bottom",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// Glow cursor follower
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener("mousemove", handle);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    return () => {
      window.removeEventListener("mousemove", handle);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [visible]);

  return (
    <div
      className="pointer-events-none fixed z-[100]"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
        width: 300,
        height: 300,
        background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
