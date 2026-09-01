import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StreakTrader — Build Your Streak. Ride the Wave.",
  description:
    "The prediction market trading app where every win builds your streak and multiplies your earnings. Built on DreamDEX Event Contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <div className="fixed inset-0 bg-bg pointer-events-none" />
        {/* Ambient gradient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[300px] bg-fire-1/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
