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

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AiVerificationPanel({
  onReward,
  onLogGenerated,
}: {
  onReward: (amount: number) => void;
  onLogGenerated?: (event: AiEvent) => void;
}) {
  const { t } = useTranslation();
  const steps: Step[] = useMemo(
    () => [
      { badge: "INFO", messageKey: "Real-time Node data ingestion...", insightKey: "rewards.insight_initial" },
      { badge: "INFO", messageKey: "Airvent-AI auditing data patterns...", insightKey: "rewards.insight_analyzing" },
      { badge: "WARN", messageKey: "Scanning for heuristic anomalies...", insightKey: "rewards.insight_analyzing" },
      { badge: "INFO", messageKey: "Hashing integrity layer to Solana...", insightKey: "rewards.insight_verified" },
      { badge: "SOLANA", messageKey: "On-chain ZK-Proof recorded: Tamper-proof", insightKey: "rewards.insight_verified" },
    ],
    [],
  );

  const [idx, setIdx] = useState(0);
  const [confidence, setConfidence] = useState(92);
  const [anomaly, setAnomaly] = useState(7);

  useEffect(() => {
    const tInterval = setInterval(() => {
      const next = (idx + 1) % steps.length;
      setIdx(next);

      const c = 94 + Math.floor(Math.random() * 5.8);
      const a = Math.floor(Math.random() * 5);
      setConfidence(c);
      setAnomaly(a);

      const step = { ...steps[next] };

      if (step.badge === "SOLANA") {
        const amt = Math.round((0.12 + Math.random() * 0.15) * 100) / 100;
        onReward(amt);
        const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let tx = "";
        for (let i = 0; i < 8; i++) tx += chars.charAt(Math.floor(Math.random() * chars.length));
        step.messageKey = `ZK-Proof Finalized (Tx: ${tx}...)`;
      }

      if (onLogGenerated) {
        onLogGenerated({ ts: nowTime(), badge: step.badge, message: step.messageKey });
      }
    }, 60000); // Trigger every 1 minute

    return () => clearInterval(tInterval);
  }, [idx, steps, onReward, onLogGenerated]);

  const cur = steps[idx];
  const badgeTone = cur.badge === "SOLANA" ? "solana" : cur.badge === "PASS" ? "ok" : cur.badge === "WARN" ? "warn" : "info";

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

        <div className="text-sm text-slate-200 mb-4 h-10 line-clamp-2">{cur.messageKey}</div>

        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-6">
          <div className="h-full w-1/2 bg-emerald-500/40 animate-pulse" />
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
