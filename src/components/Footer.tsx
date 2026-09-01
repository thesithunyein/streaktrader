"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden relative">
              <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
            </div>
            <span className="text-sm text-text-dim">StreakTrader</span>
          </div>
          <div className="text-xs text-text-muted text-center">
            Built on{" "}
            <span className="text-accent font-semibold">DreamDEX</span>{" "}
            Event Contracts · Powered by{" "}
            <span className="text-accent font-semibold">Somnia</span>
          </div>
          <div className="text-xs text-text-muted">
            Shannon Testnet · Chain 50312
          </div>
        </div>
      </div>
    </footer>
  );
}
