/**
 * SubscriptionCard — 온체인 구독 상태 표시 및 관리 컴포넌트
 *
 * 대시보드에 배치하여 사용자의 Solana 온체인 구독 상태를
 * 실시간으로 조회하고, 프리미엄 업그레이드/다운그레이드를
 * 수행할 수 있습니다.
 *
 * 사용법:
 *   이 파일을 Airvent_Dashboard/src/components/ 폴더에 복사한 뒤,
 *   DashboardPage.tsx에서 <SubscriptionCard /> 를 추가하세요.
 */
import { useEffect, useState, useCallback } from "react";

// ─── Solana import (경로는 대시보드에 맞게 수정) ───
// 아래 import는 app/solana/ 경로 기준입니다.
// 대시보드 프로젝트에 복사할 때 상대 경로를 조정하세요.
import {
    isPhantomInstalled,
    connectPhantom,
    disconnectPhantom,
    getWalletPublicKey,
    getExplorerUrl,
} from "../solana/provider";
import {
    getUserSubscription,
    initializeFreeSubscription,
    upgradeToPremium,
    downgradeFromPremium,
    SubscriptionInfo,
} from "../solana/subscription";

type CardStatus = "disconnected" | "loading" | "no_account" | "active" | "error";

export default function SubscriptionCard() {
    const [status, setStatus] = useState<CardStatus>("disconnected");
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [txPending, setTxPending] = useState(false);
    const [lastTxUrl, setLastTxUrl] = useState<string>("");
    const [serialInput, setSerialInput] = useState("");

    // ── 구독 상태 새로고침 ──
    const refreshSubscription = useCallback(async () => {
        const pubkey = getWalletPublicKey();
        if (!pubkey) return;

        setStatus("loading");
        try {
            const info = await getUserSubscription(pubkey);
            if (info) {
                setSubscription(info);
                setStatus("active");
            } else {
                setSubscription(null);
                setStatus("no_account");
            }
        } catch (err: any) {
            setError(err.message || "구독 상태 조회 실패");
            setStatus("error");
        }
    }, []);

    // ── 지갑 연결 ──
    const handleConnect = async () => {
        try {
            setError("");
            const pubkey = await connectPhantom();
            setWalletAddress(pubkey.toBase58());
            await refreshSubscription();
        } catch (err: any) {
            setError(err.message || "지갑 연결 실패");
        }
    };

    // ── 지갑 해제 ──
    const handleDisconnect = async () => {
        await disconnectPhantom();
        setWalletAddress("");
        setSubscription(null);
        setStatus("disconnected");
    };

    // ── 무료 계정 생성 ──
    const handleInitialize = async () => {
        setTxPending(true);
        setError("");
        try {
            // authority는 일반적으로 서버 지갑이지만, 데모에서는 본인 지갑 사용
            const pubkey = getWalletPublicKey()!;
            const result = await initializeFreeSubscription(pubkey);
            setLastTxUrl(result.explorerUrl);
            await refreshSubscription();
        } catch (err: any) {
            setError(err.message || "계정 생성 실패");
        } finally {
            setTxPending(false);
        }
    };

    // ── 프리미엄 업그레이드 ──
    const handleUpgrade = async () => {
        if (!serialInput.trim()) {
            setError("하드웨어 시리얼 번호를 입력하세요.");
            return;
        }
        setTxPending(true);
        setError("");
        try {
            const result = await upgradeToPremium(serialInput.trim());
            setLastTxUrl(result.explorerUrl);
            setSerialInput("");
            await refreshSubscription();
        } catch (err: any) {
            setError(err.message || "프리미엄 업그레이드 실패");
        } finally {
            setTxPending(false);
        }
    };

    // ── 프리미엄 해제 ──
    const handleDowngrade = async () => {
        setTxPending(true);
        setError("");
        try {
            const result = await downgradeFromPremium();
            setLastTxUrl(result.explorerUrl);
            await refreshSubscription();
        } catch (err: any) {
            setError(err.message || "프리미엄 해제 실패");
        } finally {
            setTxPending(false);
        }
    };

    // ── 자동 연결 시도 (이미 연결된 경우) ──
    useEffect(() => {
        if (isPhantomInstalled() && getWalletPublicKey()) {
            setWalletAddress(getWalletPublicKey()!.toBase58());
            refreshSubscription();
        }
    }, [refreshSubscription]);

    // ── 주소 축약 ──
    const shortenAddress = (addr: string) =>
        addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-purple-500">
                    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.44.44 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10891.58 10891.58 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider">SOLANA ON-CHAIN</div>
                        <div className="text-lg font-semibold text-slate-100">구독 상태</div>
                    </div>

                    {status === "disconnected" ? (
                        <button
                            onClick={handleConnect}
                            disabled={!isPhantomInstalled()}
                            className="rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium transition-all"
                        >
                            {isPhantomInstalled() ? "🔗 지갑 연결" : "⚠ Phantom 필요"}
                        </button>
                    ) : (
                        <button
                            onClick={handleDisconnect}
                            className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs hover:bg-slate-700 transition-all"
                        >
                            {shortenAddress(walletAddress)} ✕
                        </button>
                    )}
                </div>

                {/* 상태별 콘텐츠 */}
                {status === "disconnected" && (
                    <div className="text-center py-6 text-sm text-slate-500">
                        Phantom 지갑을 연결하면 온체인 구독 상태를 확인할 수 있습니다.
                    </div>
                )}

                {status === "loading" && (
                    <div className="text-center py-6">
                        <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-sm text-slate-400 mt-2">온체인 데이터 조회 중...</div>
                    </div>
                )}

                {status === "no_account" && (
                    <div className="space-y-4">
                        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 text-center">
                            <div className="text-sm text-slate-400 mb-3">아직 온체인 구독 계정이 없습니다.</div>
                            <button
                                onClick={handleInitialize}
                                disabled={txPending}
                                className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-400 transition-all"
                            >
                                {txPending ? "처리 중..." : "🚀 무료 계정 생성"}
                            </button>
                        </div>
                    </div>
                )}

                {status === "active" && subscription && (
                    <div className="space-y-4">
                        {/* 구독 티어 */}
                        <div className="flex items-center gap-3">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-bold ${subscription.isPremium
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    }`}
                            >
                                {subscription.isPremium ? "⚡ PREMIUM NODE" : "📡 FREE TIER"}
                            </div>
                        </div>

                        {/* 포인트 표시 */}
                        {!subscription.isPremium && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-emerald-400">
                                    {subscription.offchainPoints.toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-400">AVP (On-Chain)</span>
                            </div>
                        )}

                        {/* 하드웨어 정보 */}
                        {subscription.hasHardware && (
                            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 text-xs font-mono text-slate-400">
                                <div className="flex justify-between">
                                    <span>Hardware ID:</span>
                                    <span className="text-amber-400">{subscription.hardwareId}</span>
                                </div>
                            </div>
                        )}

                        {/* 계정 정보 */}
                        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 text-xs font-mono text-slate-400 space-y-1">
                            <div className="flex justify-between">
                                <span>PDA 주소:</span>
                                <a
                                    href={subscription.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 transition"
                                >
                                    {shortenAddress(subscription.address)}
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span>가입일:</span>
                                <span>{subscription.joinedAt.toLocaleDateString("ko-KR")}</span>
                            </div>
                        </div>

                        {/* 업그레이드/다운그레이드 버튼 */}
                        {!subscription.isPremium ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={serialInput}
                                    onChange={(e) => setSerialInput(e.target.value)}
                                    placeholder="하드웨어 시리얼 번호 입력"
                                    maxLength={64}
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                                />
                                <button
                                    onClick={handleUpgrade}
                                    disabled={txPending}
                                    className="w-full rounded-xl bg-amber-500 text-slate-950 font-bold py-2.5 hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 transition-all"
                                >
                                    {txPending ? "처리 중..." : "⚡ 프리미엄 업그레이드"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDowngrade}
                                disabled={txPending}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-sm hover:bg-slate-700 disabled:opacity-50 transition-all"
                            >
                                {txPending ? "처리 중..." : "무료 구독으로 전환"}
                            </button>
                        )}
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mt-3 text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl px-4 py-3">
                        ⚠ {error}
                    </div>
                )}

                {/* 마지막 트랜잭션 링크 */}
                {lastTxUrl && (
                    <div className="mt-3 text-center">
                        <a
                            href={lastTxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 transition"
                        >
                            🔗 마지막 트랜잭션 확인 →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
