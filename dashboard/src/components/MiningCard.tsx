import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "./Badge";

export default function MiningCard() {
    const { t } = useTranslation();
    const [points, setPoints] = useState(1250);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"MINING" | "VALIDATING" | "SOLANA_CONFIRMED">("MINING");
    const [blockHash, setBlockHash] = useState("Waiting...");
    const [solanaTx, setSolanaTx] = useState("");

    // Mining loop - 60 seconds for a full cycle
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 0;
                }
                // Finish exactly in ~60 seconds (100 / 60 steps)
                return prev + (100 / 60);
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Status state machine based on progress
    useEffect(() => {
        if (progress < 80) {
            setStatus("MINING");
        } else if (progress < 100) {
            setStatus("VALIDATING");
        } else {
            // Just hit 100 (or reset)
            if (status !== "SOLANA_CONFIRMED") {
                setStatus("SOLANA_CONFIRMED");
                // Mint points!
                const reward = Math.floor(Math.random() * 5) + 5;
                setPoints(p => p + reward);
                setBlockHash("0x" + Math.random().toString(16).substr(2, 8));
                // Simulate Solana TxID
                const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                let tx = "";
                for (let i = 0; i < 8; i++) tx += chars.charAt(Math.floor(Math.random() * chars.length));
                setSolanaTx(tx + "...");
            }
        }
    }, [progress, status]);


    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-emerald-500">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider underline decoration-emerald-500/30">{t("rewards.mining_title")}</div>
                        <div className="text-lg font-semibold text-slate-100">{t("rewards.token_name")}</div>
                    </div>
                    <Badge tone={status === "MINING" ? "info" : status === "VALIDATING" ? "warn" : "solana"}>
                        {status === "SOLANA_CONFIRMED" ? t("rewards.verified") : status}
                    </Badge>
                </div>

                <div className="flex items-baseline gap-2 mb-8 mt-2">
                    <span className="text-4xl font-bold text-emerald-400">{points.toLocaleString()}</span>
                    <span className="text-sm text-slate-400 font-medium">AIVT</span>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("rewards.mining_stats")}</div>
                    </div>
                    {/* Log */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                        <div className="flex justify-between">
                            <span>{t("rewards.proof_hash")}:</span>
                            <span className="text-emerald-500">{blockHash}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span>{t("rewards.solana_tx")}:</span>
                            <span className="text-purple-400 font-mono tracking-tight">{solanaTx || t("rewards.broadcasting")}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span>{t("rewards.ai_auditor")}:</span>
                            <span className="text-cyan-400">Airvent-AI v2.1</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between opacity-60">
                            <span>{t("rewards.next_epoch")}:</span>
                            <span>~14m 20s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
