import { useTranslation } from "react-i18next";
import { AirPoint } from "../types/air";
import { THRESHOLDS } from "../config/thresholds";
import { fmt } from "../utils/format";

function tone(val: number, threshold: number): "ok" | "warn" | "bad" {
  if (val <= threshold * 0.85) return "ok";
  if (val <= threshold) return "warn";
  return "bad";
}

function cardToneCls(t: "ok" | "warn" | "bad"): string {
  if (t === "ok") return "border-emerald-900 bg-emerald-500/5";
  if (t === "warn") return "border-amber-900 bg-amber-500/5";
  return "border-rose-900 bg-rose-500/5";
}

export default function KpiCards({ latest }: { latest: AirPoint }) {
  const { t } = useTranslation();
  const items = [
    { k: "PM2.5", v: latest.pm25, u: "µg/m³", t: tone(latest.pm25, THRESHOLDS.pm25) },
    { k: "PM10", v: latest.pm10, u: "µg/m³", t: tone(latest.pm10, THRESHOLDS.pm10) },
    { k: "PM1.0", v: latest.pm1, u: "µg/m³", t: "ok" as const },
    { k: "CO2", v: latest.co2, u: "ppm", t: tone(latest.co2, THRESHOLDS.co2) },
    { k: "VOC", v: latest.voc, u: "ppb", t: tone(latest.voc, THRESHOLDS.voc) },
    { k: "Temp / Hum", v: 0, u: "", t: "ok" as const, extra: `${fmt(latest.temp, 1)}°C / ${latest.hum}%` },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.k}
          className={`rounded-2xl border p-4 ${cardToneCls(it.t)} bg-slate-900/50`}
        >
          <div className="text-xs text-slate-400">{it.k}</div>
          <div className="mt-1 text-2xl font-semibold">
            {"extra" in it ? it.extra : `${it.v} ${it.u}`}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {"extra" in it ? t("overview.indoor_comfort") : t("overview.live_stream")}
          </div>
        </div>
      ))}
    </div>
  );
}
