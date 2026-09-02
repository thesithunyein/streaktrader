"use client";

// Clean, professional background — static gradient, no animation
// Let the product speak, not the background
export default function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8faff 40%, #eef4ff 70%, #dde9ff 100%)",
      }}
    />
  );
}
