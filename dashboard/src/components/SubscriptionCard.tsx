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
import { useEffect, useState, useCallback, useMemo } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { HelioCheckout } from "@heliofi/checkout-react";

import {
    getExplorerUrl,
    getProgram,
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
    const { publicKey, disconnect, connected } = useWallet();
    const { setVisible } = useWalletModal();
    const anchorWallet = useAnchorWallet();

    const [status, setStatus] = useState<CardStatus>("disconnected");
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [error, setError] = useState<string>("");
    const [txPending, setTxPending] = useState(false);
    const [isPolling, setIsPolling] = useState(false); // 브릿지 결제 완료 후 온체인 업데이트 대기 상태
    const [lastTxUrl, setLastTxUrl] = useState<string>("");
    const [serialInput, setSerialInput] = useState("");

    const walletAddress = publicKey ? publicKey.toBase58() : "";

    const program = useMemo(() => {
        if (!anchorWallet) return null;
        try {
            return getProgram(anchorWallet as any);
        } catch (err: any) {
            console.error('[SubscriptionCard] getProgram error:', err?.message);
            return null;
        }
    }, [anchorWallet]);

    // ── 구독 상태 새로고침 ──
    const refreshSubscription = useCallback(async () => {
        if (!program || !publicKey) {
            if (!connected) setStatus("disconnected");
            return;
        }

        setStatus("loading");
        try {
            const info = await getUserSubscription(program, publicKey);
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
    }, [program, publicKey, connected]);

    // ── 지갑 연결 ──
    const handleConnect = () => {
        setVisible(true);
    };

    // ── 지갑 해제 ──
    const handleDisconnect = async () => {
        await disconnect();
        setSubscription(null);
        setStatus("disconnected");
    };

    // ── 무료 계정 생성 ──
    const handleInitialize = async () => {
        if (!program) return;
        setTxPending(true);
        setError("");
        try {
            // authority는 일반적으로 서버 지갑이지만, 데모에서는 본인 지갑 사용
            const pubkey = publicKey!;
            const result = await initializeFreeSubscription(program, pubkey);
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
        if (!program || !serialInput.trim()) {
            if (!serialInput.trim()) setError("하드웨어 시리얼 번호를 입력하세요.");
            return;
        }
        setTxPending(true);
        setError("");
        try {
            const result = await upgradeToPremium(program, serialInput.trim());
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
        if (!program) return;
        setTxPending(true);
        setError("");
        try {
            const result = await downgradeFromPremium(program);
            setLastTxUrl(result.explorerUrl);
            await refreshSubscription();
        } catch (err: any) {
            setError(err.message || "프리미엄 해제 실패");
        } finally {
            setTxPending(false);
        }
    };

    // ── Polar 카드 결제 / 구독 ──
    const handlePolarPayment = () => {
        const polarCheckoutUrl = "https://checkout.polar.sh/";
        alert("Polar.sh 결제 창으로 이동합니다. \n(데모: 링크 입력 필요)");
        // window.location.href = polarCheckoutUrl;
        setIsPolling(true);
    };

    // ── Helio 위젯 설정 ──
    const helioConfig = {
        paylinkId: "679c8d1d86d5267a7a30364e",
        theme: { themeMode: "dark" },
        onSuccess: (event: any) => {
            console.log("Helio Checkout Success:", event);
            alert("Helio 결제가 완료되었습니다! 상태 업데이트를 대기합니다.");
            setIsPolling(true);
        },
        onError: (event: any) => {
            console.error("Helio Checkout Error:", event);
            setError("암호화폐 결제 중 오류가 발생했습니다.");
        },
        onPending: (event: any) => {
            console.log("Helio Checkout Pending:", event);
        }
    };

    // ── 브릿지 결제 후 온체인 상태 폴링 ──
    useEffect(() => {
        let interval: any;
        if (isPolling && program && publicKey) {
            interval = setInterval(async () => {
                try {
                    console.log("Polling for on-chain update...");
                    const info = await getUserSubscription(program, publicKey);
                    if (info && info.isPremium) {
                        setIsPolling(false);
                        await refreshSubscription();
                        alert("축하합니다! 온체인 프리미엄 업그레이드가 완료되었습니다.");
                    }
                } catch (e: any) {
                    console.error("Polling error:", e);
                }
            }, 5000); // 5초마다 확인
        }
        return () => clearInterval(interval);
    }, [isPolling, program, publicKey, refreshSubscription]);

    // ── 연결 상태 변경 감지 및 동기화 ──
    useEffect(() => {
        if (connected) {
            refreshSubscription();
        } else {
            setSubscription(null);
            setStatus("disconnected");
        }
    }, [connected, refreshSubscription]);

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
                            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium transition-all"
                        >
                            🔗 지갑 연결
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
                            <div className="space-y-3">
                                {/* 결제 수단 1: Polar.sh (신용카드/구독) */}
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-200">1. 신용카드 / 구독 (Polar)</span>
                                            <span className="text-[10px] text-slate-400">Merchant of Record</span>
                                        </div>
                                        <span className="text-sm font-bold text-purple-400">$99 / nodes</span>
                                    </div>
                                    <button
                                        onClick={handlePolarPayment}
                                        disabled={txPending || isPolling}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-950 font-bold py-2 hover:bg-white disabled:bg-slate-500 transition-all"
                                    >
                                        {isPolling ? "업데이트 대기 중..." : "💳 카드로 결제하기"}
                                    </button>
                                </div>

                                {/* 결제 수단 2: Helio (Crypto) */}
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 mt-3">
                                    <div className="flex flex-col mb-3">
                                        <span className="text-sm font-medium text-slate-200">2. 암호화폐 결제 (Helio)</span>
                                        <span className="text-[10px] text-slate-400">USDC / SOL 지원</span>
                                    </div>
                                    <div className="flex items-center justify-center bg-transparent rounded-xl">
                                        <HelioCheckout config={helioConfig as any} />
                                    </div>
                                </div>

                                <div className="relative flex items-center py-1">
                                    <div className="flex-grow border-t border-slate-800"></div>
                                    <span className="flex-shrink mx-4 text-xs text-slate-500 font-bold">OR</span>
                                    <div className="flex-grow border-t border-slate-800"></div>
                                </div>

                                {/* 하드웨어 등록 섹션 */}
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

                {status === "error" && (
                    <div className="space-y-4">
                        <div className="bg-rose-950/20 rounded-xl border border-rose-500/30 p-6 text-center">
                            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <div className="text-sm text-rose-200 font-bold mb-2">구독 상태를 불러오는 중 오류가 발생했습니다.</div>
                            <div className="text-xs text-rose-400 font-mono mb-4 bg-black/40 p-3 rounded-lg break-all">
                                {error}
                            </div>
                            <button
                                onClick={refreshSubscription}
                                className="rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-100 font-bold px-6 py-2.5 hover:bg-rose-500/20 transition-all text-sm"
                            >
                                🔄 다시 시도하기
                            </button>
                        </div>
                    </div>
                )}

                {/* 에러 메시지 (하단 작은 알림) */}
                {error && status !== "error" && (
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
