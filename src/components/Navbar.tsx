"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Flame, Zap, History } from "lucide-react";

function Animate({
  children,
  delay = 0,
  className = "",
  direction = "down",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
}) {
  const dirMap: Record<string, string> = {
    up: "animate-fade-up",
    down: "animate-fade-down",
    left: "animate-fade-left",
    right: "animate-fade-right",
    scale: "animate-fade-scale",
  };
  return (
    <div
      className={`opacity-0 ${dirMap[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("streaktrader_address");
    if (saved) setAddress(saved);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts[0]) {
        setAddress(accounts[0]);
        localStorage.setItem("streaktrader_address", accounts[0]);
      }
    } catch {}
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("streaktrader_address");
  };

  const truncateAddr = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <nav className="w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-[82px] pt-[20px] sm:pt-[30px] flex items-center justify-between relative z-50">
        {/* Logo */}
        <Animate delay={0} direction="down">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-[8px] overflow-hidden relative">
              <Image src="/logo.png" alt="StreakTrader" fill className="object-cover" />
            </div>
            <span className="text-white text-[22px] sm:text-[26px] font-[450] leading-none tracking-[-0.02em]">
              StreakTrader
            </span>
          </Link>
        </Animate>

        {/* Center nav pill (desktop) */}
        <Animate delay={100} direction="down" className="hidden lg:block">
          <div className="h-[52px] px-6 flex items-center gap-[30px] glass-pill rounded-[11px]">
            {[
              { label: "Trade", href: "/app", icon: Zap },
              { label: "Leaderboard", href: "/leaderboard", icon: Flame },
              { label: "History", href: "/history", icon: History },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-[5px] text-white/80 text-[14px] font-[450] leading-[14px] hover:text-white transition-colors"
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            ))}
          </div>
        </Animate>

        {/* Right auth pill (desktop) */}
        <Animate delay={200} direction="down" className="hidden lg:block">
          <div className="h-[52px] p-[3px] bg-[rgba(0,0,0,0.35)] rounded-[13px] backdrop-blur-[17px] flex items-center gap-[5px]">
            {address ? (
              <>
                <span className="px-6 h-[46px] flex items-center rounded-[11px] text-white/80 text-[14px] font-[450]">
                  {truncateAddr(address)}
                </span>
                <button
                  onClick={disconnect}
                  className="h-[46px] px-6 rounded-[11px] bg-[#E9E9E9] text-[#0A0707] text-[14px] font-[450] hover:bg-white transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="h-[46px] px-6 rounded-[11px] bg-[#E9E9E9] text-[#0A0707] text-[14px] font-[450] hover:bg-white transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </Animate>

        {/* Mobile hamburger */}
        <Animate delay={100} direction="down" className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[11px] glass-pill transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`w-5 h-5 text-white absolute inset-0 transition-all duration-300 ease-out ${
                  isOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`w-5 h-5 text-white absolute inset-0 transition-all duration-300 ease-out ${
                  isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                }`}
              />
            </div>
          </button>
        </Animate>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#080A19]/90 backdrop-blur-[24px] transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-[76px] sm:top-[86px] left-4 right-4 sm:left-6 sm:right-6 glass-strong rounded-[20px] border border-white/[0.06] p-6 sm:p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top ${
            isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-[0.97]"
          }`}
        >
          <div className="flex flex-col gap-1">
            {["Trade", "Leaderboard", "History"].map((label, i) => (
              <Link
                key={label}
                href={`/${label === "Trade" ? "app" : label.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-[12px] text-white/90 text-[18px] font-[450] hover:bg-white/[0.06] transition-all duration-300 ${
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                }`}
                style={{ transitionDelay: isOpen ? `${100 + i * 50}ms` : "0ms" }}
              >
                {label}
                {label === "Trade" && <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />}
              </Link>
            ))}
          </div>
          <div className="h-px bg-white/10 my-5" />
          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}
          >
            {address ? (
              <>
                <span className="w-full h-[50px] flex items-center justify-center rounded-[12px] text-white/80 text-[15px] font-[450]">
                  {truncateAddr(address)}
                </span>
                <button
                  onClick={() => { disconnect(); setIsOpen(false); }}
                  className="w-full h-[50px] rounded-[12px] bg-[#E9E9E9] text-[#0A0707] text-[15px] font-[450] transition-colors hover:bg-white"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => { connectWallet(); setIsOpen(false); }}
                className="w-full h-[50px] rounded-[12px] bg-[#E9E9E9] text-[#0A0707] text-[15px] font-[450] transition-colors hover:bg-white"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
