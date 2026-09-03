"use client";

import { useState, useCallback, useEffect } from "react";
import {
  createWalletClient,
  custom,
  type WalletClient,
  type Address,
  type PublicClient,
  createPublicClient,
  webSocket,
} from "viem";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";

interface WalletState {
  address: Address | null;
  chainId: number | null;
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  connecting: boolean;
  error: string | null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    walletClient: null,
    publicClient: null,
    connecting: false,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          const wc = createWalletClient({
            account: accounts[0] as Address,
            chain: somniaShannon,
            transport: custom(window.ethereum),
          });
          const pc = createPublicClient({
            chain: somniaShannon,
            transport: webSocket("wss://api.infra.testnet.somnia.network/ws"),
          });
          setState({
            address: accounts[0] as Address,
            chainId: somniaShannon.id,
            walletClient: wc,
            publicClient: pc,
            connecting: false,
            error: null,
          });
        }
      } catch {
        // Not connected
      }
    };
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((s) => ({
          ...s,
          address: null,
          walletClient: null,
          publicClient: null,
        }));
      } else if (accounts[0] !== state.address) {
        const wc = createWalletClient({
          account: accounts[0] as Address,
          chain: somniaShannon,
          transport: custom(window.ethereum),
        });
        const pc = createPublicClient({
          chain: somniaShannon,
          transport: webSocket("wss://api.infra.testnet.somnia.network/ws"),
        });
        setState({
          address: accounts[0] as Address,
          chainId: somniaShannon.id,
          walletClient: wc,
          publicClient: pc,
          connecting: false,
          error: null,
        });
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [state.address]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((s) => ({ ...s, error: "No wallet found. Install MetaMask." }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Switch to Shannon testnet if needed
      if (parseInt(chainId, 16) !== somniaShannon.id) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${somniaShannon.id.toString(16)}` }],
          });
        } catch {
          // Chain not added, try adding it
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${somniaShannon.id.toString(16)}`,
                chainName: "Somnia Shannon Testnet",
                nativeCurrency: {
                  name: "STT",
                  symbol: "STT",
                  decimals: 18,
                },
                rpcUrls: ["https://50312.rpc.thirdweb.com", "https://rpc.infra.testnet.somnia.network"],
                blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
              },
            ],
          });
        }
      }

      const wc = createWalletClient({
        account: accounts[0] as Address,
        chain: somniaShannon,
        transport: custom(window.ethereum),
      });
      const pc = createPublicClient({
        chain: somniaShannon,
        transport: webSocket("wss://api.infra.testnet.somnia.network/ws"),
      });

      setState({
        address: accounts[0] as Address,
        chainId: somniaShannon.id,
        walletClient: wc,
        publicClient: pc,
        connecting: false,
        error: null,
      });
    } catch (e: any) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: e.message || "Failed to connect",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      walletClient: null,
      publicClient: null,
      connecting: false,
      error: null,
    });
  }, []);

  return { ...state, connect, disconnect };
}
