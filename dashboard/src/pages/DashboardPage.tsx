import { useEffect, useMemo, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { logout } from "../auth";
import DashboardLayout from "../components/DashboardLayout";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { DEMO_SERVER_WALLET } from "../config/chain";
import { useAirBalance } from "../hooks/useAirBalance";

export default function DashboardPage() {
  const nav = useNavigate();
  // connecting은 연결 중이지만 아직 완료되지 않은 상태. connected가 true면 더 이상 connecting이 아님.
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  // 시뮬레이션용 보상 더하기 (RewardsTab의 onReward 핸들러에서 사용)
  const [simulatedReward, setSimulatedReward] = useState(0);

  useEffect(() => {
    console.log("[WalletDebug] Connection status:", { connected, connecting, hasPublicKey: !!publicKey });
    if (wallet) console.log("[WalletDebug] Active wallet:", wallet.adapter.name);
  }, [connected, connecting, publicKey, wallet]);

  // 사용자가 Phantom 연결했으면 그 지갑 잔액, 아니면 데모 서버 지갑 잔액을 표시.
  // (연결된 사용자의 잔액을 보여주는 게 원래 의도이고, 미연결 시엔 데모용으로 fallback)
  const balanceOwner = useMemo(
    () => (publicKey ? publicKey : DEMO_SERVER_WALLET),
    [publicKey]
  );
  const { balance: onchainBalance } = useAirBalance({ owner: balanceOwner });
  const balance = (onchainBalance ?? 0) + simulatedReward;

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
    // 데모용으로 누적 (실제 온체인 잔액은 useAirBalance가 자동 폴링)
    setSimulatedReward((r) => Math.round((r + amt) * 100) / 100);
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
