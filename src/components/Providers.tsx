"use client";

import TradeProvider from "@/components/TradeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TradeProvider>{children}</TradeProvider>;
}
