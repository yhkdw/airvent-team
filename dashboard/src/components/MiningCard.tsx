import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Connection, PublicKey } from "@solana/web3.js";
import Badge from "./Badge";

export default function MiningCard({ latestSignature }: { latestSignature: string | null }) {
    const { t } = useTranslation();
    const [points, setPoints] = useState<number>(0);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"MINING" | "VALIDATING" | "SOLANA_CONFIRMED">("MINING");
    const [blockHash, setBlockHash] = useState("Waiting...");
    const [solanaTx, setSolanaTx] = useState("");
    const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());

    // Fetch Token Balance from Devnet
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const connection = new Connection("https://api.devnet.solana.com", "confirmed");
                const mint = new PublicKey("BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL");
                const owner = new PublicKey("GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw");
                
                const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
                if (accounts.value.length > 0) {
                    const balanceInfo = await connection.getTokenAccountBalance(accounts.value[0].pubkey);
                    setPoints(balanceInfo.value.uiAmount || 0);
                }
            } catch (error) {
                console.error("Failed to fetch token balance", error);
            }
        };

        fetchBalance();
    }, [latestSignature]);

    // Handle new transactions
    useEffect(() => {
        if (latestSignature && latestSignature !== solanaTx) {
            setSolanaTx(latestSignature.substring(0, 8) + "..." + latestSignature.substring(latestSignature.length - 4));
            setBlockHash("0x" + Math.random().toString(16).substr(2, 8)); // Maintain a visual hash
            setStatus("SOLANA_CONFIRMED");
            setLastFetchTime(Date.now());
            setProgress(100);

            // Revert back to mining after 10 seconds to show the next 60s cycle starting
            const timeout = setTimeout(() => {
                setStatus("MINING");
                setProgress(0);
                setLastFetchTime(Date.now());
            }, 10000);

            return () => clearTimeout(timeout);
        }
    }, [latestSignature, solanaTx]);

    // Progress bar visual effect syncing to 60s
    useEffect(() => {
        const timer = setInterval(() => {
            if (status === "SOLANA_CONFIRMED") return;
            
            const elapsed = Date.now() - lastFetchTime;
            const newProgress = Math.min((elapsed / 60000) * 100, 95); // Cap at 95% until real tx comes
            
            setProgress(newProgress);
            
            if (newProgress > 80 && status !== "VALIDATING") {
                setStatus("VALIDATING");
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [lastFetchTime, status]);

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-emerald-500">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
            </div>

            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-linear" 
                    style={{ width: `${progress}%` }} 
                />
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
                    <span className="text-4xl font-bold text-emerald-400">
                        {points > 0 ? points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"}
                    </span>
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
                            <span>{status === "SOLANA_CONFIRMED" ? "Confirmed" : `~${Math.max(0, Math.floor(60 - (Date.now() - lastFetchTime) / 1000))}s`}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
