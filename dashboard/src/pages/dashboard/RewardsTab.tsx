import { useState, useCallback, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useTranslation } from "react-i18next";
import MiningCard from "../../components/MiningCard";
import AiVerificationPanel, { AiEvent } from "../../components/AiVerificationPanel";
import { TrendingUp, Award, Clock, Terminal } from "lucide-react";

interface RewardsTabProps {
    onReward: (amt: number) => void;
}

export default function RewardsTab({ onReward }: RewardsTabProps) {
    const { t } = useTranslation();
    const [events, setEvents] = useState<(AiEvent & { signature?: string })[]>([
        { ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), badge: "INFO", message: "AI Verification Pipeline Ready" },
    ]);

    const handleLog = useCallback((event: AiEvent) => {
        setEvents((prev) => [event, ...prev].slice(0, 15));
    }, []);

    useEffect(() => {
        const DEVICE_ID = '5EBHA10001';
        const PROGRAM_ID = new PublicKey('B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR');
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const [devicePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("device"), Buffer.from(DEVICE_ID)],
            PROGRAM_ID
        );

        let isMounted = true;
        const fetchSigs = async () => {
            try {
                const sigs = await connection.getSignaturesForAddress(devicePda, { limit: 10 });
                if (!isMounted) return;
                
                const formattedEvents = sigs.map(sig => {
                    const date = new Date((sig.blockTime || 0) * 1000);
                    return {
                        ts: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                        badge: "SOLANA" as "SOLANA",
                        message: `Data Submitted. TX: ${sig.signature.substring(0, 6)}...${sig.signature.substring(sig.signature.length - 4)}`,
                        signature: sig.signature
                    };
                });
                
                setEvents((prev) => {
                    const nonSolana = prev.filter(e => e.badge !== "SOLANA");
                    return [...formattedEvents, ...nonSolana].slice(0, 15);
                });
            } catch (e) {
                console.error("Failed to fetch signatures", e);
            }
        };

        fetchSigs();
        const interval = setInterval(fetchSigs, 10000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="h-full">
                    <MiningCard />
                </div>
                <div className="h-full">
                    <AiVerificationPanel onReward={onReward} onLogGenerated={handleLog} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp size={20} />
                        </div>
                        <div className="text-sm font-semibold text-slate-300">{t("rewards.efficiency")}</div>
                    </div>
                    <div className="text-2xl font-bold">94.2%</div>
                    <div className="text-xs text-slate-500 mt-1">+2.1% {t("rewards.last_epoch")}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                            <Award size={20} />
                        </div>
                        <div className="text-sm font-semibold text-slate-300">{t("rewards.epoch_rank")}</div>
                    </div>
                    <div className="text-2xl font-bold">#1,402</div>
                    <div className="text-xs text-slate-500 mt-1">{t("rewards.top_nodes")}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Clock size={20} />
                        </div>
                        <div className="text-sm font-semibold text-slate-300">{t("rewards.uptime")}</div>
                    </div>
                    <div className="text-2xl font-bold">99.98%</div>
                    <div className="text-xs text-slate-500 mt-1">{t("rewards.status_ok")}</div>
                </div>
            </div>

            {/* Audit Logs Section - Full Width at Bottom */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal size={18} className="text-emerald-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">{t("rewards.audit_logs") || "LIVE ON-CHAIN RECORDS"}</h3>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-xs opacity-50">{t("rewards.realtime_stream")}</div>
                </div>
                <div className="p-4 space-y-2 max-h-[250px] overflow-y-auto font-mono">
                    {events.map((e, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between gap-4 py-1 border-b border-slate-800/50 last:border-0"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <span className="text-slate-500 text-[10px] w-16 whitespace-nowrap">{e.ts}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${e.badge === 'SOLANA' ? 'bg-purple-500/10 text-purple-400' :
                                    e.badge === 'WARN' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-slate-800 text-slate-400'
                                    }`}>
                                    {e.badge}
                                </span>
                                <span className="text-xs text-slate-300 flex-1">{e.message}</span>
                                {e.signature && (
                                    <a 
                                        href={`https://explorer.solana.com/tx/${e.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hidden sm:flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded transition-colors"
                                    >
                                        Explorer 🔗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
