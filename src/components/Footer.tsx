"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden relative">
              <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
            </div>
            <span className="text-sm text-white/40">StreakTrader</span>
          </div>
          <div className="text-xs text-white/25 text-center">
            Powered by{" "}
            <span className="text-accent font-semibold">DreamDEX</span>{" "}
            Event Contracts on{" "}
            <span className="text-accent font-semibold">Somnia</span>
          </div>
          <div className="text-xs text-white/25">
            Shannon Testnet
          </div>
        </div>
      </div>
    </footer>
  );
}
