import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { logout } from "../auth";
import DashboardLayout from "../components/DashboardLayout";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey } from "@solana/web3.js";

export default function DashboardPage() {
  const nav = useNavigate();
  // connecting은 연결 중이지만 아직 완료되지 않은 상태. connected가 true면 더 이상 connecting이 아님.
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    console.log("[WalletDebug] Connection status:", { connected, connecting, hasPublicKey: !!publicKey });
    if (wallet) console.log("[WalletDebug] Active wallet:", wallet.adapter.name);
  }, [connected, connecting, publicKey, wallet]);

  useEffect(() => {
    let isMounted = true;
    const fetchBalance = async () => {
      try {
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const mint = new PublicKey("BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL");
        const owner = new PublicKey("GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw");
        
        const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
        if (accounts.value.length > 0 && isMounted) {
          const balanceInfo = await connection.getTokenAccountBalance(accounts.value[0].pubkey);
          if (isMounted) {
            setBalance(balanceInfo.value.uiAmount || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard wallet token balance", error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const walletAddress = publicKey ? publicKey.toString() : null;

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/login");
    }
  };

  const handleReward = (amt: number) => {
    setBalance((b: number) => Math.round((b + amt) * 100) / 100);
  };

  return (
    <DashboardLayout
      balance={balance}
      walletAddress={walletAddress}
      isConnecting={connecting && !connected}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onLogout={handleLogout}
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet context={{ onReward: handleReward }} />
      </div>
    </DashboardLayout>
  );
}
