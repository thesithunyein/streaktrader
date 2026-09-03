"use client";

import { useState } from "react";
import { CONTRACT_ADDRESSES, ABIS, SHANNON_CHAIN } from "@/lib/contracts";

/**
 * Records a trade on-chain via MetaMask browser wallet.
 * Falls back to server API if MetaMask fails.
 */
export function useOnChainRecord() {
  const [status, setStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const recordTrade = async (won: boolean): Promise<{ success: boolean; txHash?: string }> => {
    setStatus("Recording on-chain...");
    setTxHash(null);

    // Try MetaMask first (browser wallet)
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;

        // Check we're on the right network
        const chainId = await ethereum.request({ method: "eth_chainId" });
        if (parseInt(chainId, 16) !== SHANNON_CHAIN.chainId) {
          // Try to switch
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${SHANNON_CHAIN.chainId.toString(16)}` }],
            });
          } catch {
            setStatus("Switch to Shannon Testnet in MetaMask");
            return { success: false };
          }
        }

        // Get accounts
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
          setStatus("MetaMask not connected");
          return { success: false };
        }

        // Encode recordTrade(address, bool) call
        const iface = new (await import("ethers")).Interface(ABIS.StreakRegistry);
        const data = iface.encodeFunctionData("recordTrade", [accounts[0], won]);

        // Send transaction via MetaMask
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: accounts[0],
            to: CONTRACT_ADDRESSES.StreakRegistry,
            data,
            gas: "0x7A120", // 500k gas
          }],
        });

        setTxHash(txHash);
        setStatus("Recorded on-chain");
        return { success: true, txHash };
      } catch (e: any) {
        console.log("MetaMask recording failed:", e.message);
        // Fall through to server API
      }
    }

    // Fallback: server-side API
    try {
      const address = localStorage.getItem("streaktrader_address");
      if (!address) {
        setStatus("No wallet address found");
        return { success: false };
      }

      const res = await fetch("/api/record-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, won }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("Recorded on-chain");
        setTxHash(data.streakTxHash);
        return { success: true, txHash: data.streakTxHash };
      } else {
        setStatus("On-chain record pending");
        return { success: false };
      }
    } catch {
      setStatus("On-chain record pending");
      return { success: false };
    }
  };

  return { recordTrade, status, txHash };
}
