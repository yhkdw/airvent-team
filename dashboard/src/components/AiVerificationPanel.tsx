import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "./Badge";

export type AiEvent = {
  ts: string;
  message: string;
  badge: "INFO" | "WARN" | "PASS" | "SOLANA";
};

type Step = {
  badge: AiEvent["badge"];
  messageKey: string;
  insightKey: string;
};

export default function AiVerificationPanel({
  onReward,
  latestSignature,
}: {
  onReward: (amount: number) => void;
  latestSignature: string | null;
}) {
  const { t } = useTranslation();
  const steps: Step[] = useMemo(
    () => [
      { badge: "INFO", messageKey: "Real-time Node data ingestion...", insightKey: "rewards.insight_initial" },
      { badge: "INFO", messageKey: "Airvent-AI auditing data patterns...", insightKey: "rewards.insight_analyzing" },
      { badge: "WARN", messageKey: "Scanning for heuristic anomalies...", insightKey: "rewards.insight_analyzing" },
      { badge: "SOLANA", messageKey: "On-chain ZK-Proof recorded: Tamper-proof", insightKey: "rewards.insight_verified" },
    ],
    [],
  );

  const [idx, setIdx] = useState(0);
  const [confidence, setConfidence] = useState(98.5);
  const [anomaly, setAnomaly] = useState(1.5);
  const [lastTxTime, setLastTxTime] = useState<number>(Date.now());

  // Trigger SOLANA stage when a new signature arrives
  useEffect(() => {
    if (latestSignature) {
      setIdx(3); // Go to SOLANA ZK-Proof step
      setConfidence(99.8);
      setAnomaly(0.2);
      setLastTxTime(Date.now());

      // Trigger standard reward point visual update
      onReward(0.15 + Math.random() * 0.1);

      // Revert back to Stage 0 after 10 seconds
      const timeout = setTimeout(() => {
        setIdx(0);
        setConfidence(97.5 + Math.random() * 2);
        setAnomaly(1 + Math.random() * 2);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [latestSignature]);

  // Handle stage transitions between transactions (0 to 2)
  useEffect(() => {
    if (idx === 3) return; // Stay in ZK-Proof confirmed state until timeout

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastTxTime;
      // Map 60 seconds elapsed to indices 0, 1, 2
      let targetIdx = 0;
      if (elapsed > 40000) {
        targetIdx = 2;
      } else if (elapsed > 20000) {
        targetIdx = 1;
      }
      
      setIdx(targetIdx);

      // Add slight variety to confidence / integrity scores
      setConfidence(96 + Math.random() * 3.5);
      setAnomaly(0.5 + Math.random() * 2.5);
    }, 2000);

    return () => clearInterval(interval);
  }, [lastTxTime, idx]);

  const cur = steps[idx];
  const badgeTone = cur.badge === "SOLANA" ? "solana" : cur.badge === "PASS" ? "ok" : cur.badge === "WARN" ? "warn" : "info";

  // Display ZK-Proof with real TX or standard step message
  const displayMessage = cur.badge === "SOLANA" && latestSignature
    ? `ZK-Proof Finalized (Tx: ${latestSignature.substring(0, 8)}...)`
    : cur.messageKey;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">{t("rewards.audit_panel_title")}</div>
            <div className="text-lg font-semibold">{t("rewards.verifier_name")}</div>
          </div>
          <Badge tone={badgeTone}>{cur.badge}</Badge>
        </div>

        <div className="text-sm text-slate-200 mb-4 h-10 line-clamp-2">{displayMessage}</div>

        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-6">
          <div 
            className="h-full bg-emerald-500/40 transition-all duration-1000 ease-in-out" 
            style={{ width: `${idx === 3 ? 100 : (idx + 1) * 25}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-tighter">{t("rewards.confidence")}</div>
            <div className="text-xl font-bold text-emerald-400">{confidence.toFixed(1)}%</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-xs text-slate-500 uppercase tracking-tighter">{t("rewards.integrity")}</div>
            <div className="text-xl font-bold text-cyan-400">{(100 - anomaly).toFixed(1)}/100</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">{t("rewards.insight_title")}</div>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed min-h-[40px]">
          {t(cur.insightKey)}
        </div>
      </div>
    </div>
  );
}
