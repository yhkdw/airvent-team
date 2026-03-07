import { AirPoint } from "../types/air";
import { THRESHOLDS } from "../config/thresholds";
import { fmtTime } from "../utils/format";
import Badge from "./Badge";

type AlertItem = { ts: string; level: "WARN" | "HIGH"; message: string };

export default function Alerts({ recent }: { recent: AirPoint[] }) {
  const alerts: AlertItem[] = [];

  for (const p of recent.slice().reverse()) {
    if (p.co2 > THRESHOLDS.co2) {
      alerts.push({
        ts: p.ts,
        level: p.co2 > THRESHOLDS.co2 * 1.2 ? "HIGH" : "WARN",
        message: `CO2 ${p.co2}ppm 초과 (환기 권고)`,
      });
    }
    if (p.pm25 > THRESHOLDS.pm25) {
      alerts.push({
        ts: p.ts,
        level: p.pm25 > THRESHOLDS.pm25 * 1.3 ? "HIGH" : "WARN",
        message: `PM2.5 ${p.pm25}µg/m³ 초과 (필터/환기 확인)`,
      });
    }
    if (p.voc > THRESHOLDS.voc) {
      alerts.push({
        ts: p.ts,
        level: p.voc > THRESHOLDS.voc * 1.3 ? "HIGH" : "WARN",
        message: `VOC ${p.voc}ppb 상승 (환기/원인 점검)`,
      });
    }
    if (alerts.length >= 6) break;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400">LAST 60MIN</div>
          <div className="text-lg font-semibold">Alerts</div>
        </div>
        <div className="text-xs text-slate-500">threshold-based</div>
      </div>

      <div className="mt-3 space-y-2">
        {alerts.length === 0 ? (
          <div className="text-sm text-slate-400 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
            현재 경고 알림이 없습니다.
          </div>
        ) : (
          alerts.map((a, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <div className="text-sm text-slate-200">
                <span className="text-slate-400 mr-2">{fmtTime(a.ts)}</span>
                {a.message}
              </div>
              <Badge tone={a.level === "HIGH" ? "warn" : "info"}>{a.level}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
