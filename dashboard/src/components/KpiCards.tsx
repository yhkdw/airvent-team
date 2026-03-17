import { useTranslation } from "react-i18next";
import { AirPoint } from "../types/air";
import { THRESHOLDS } from "../config/thresholds";
import { getMetricStatus, getWorstStatus, AirStatus } from "../utils/airQuality";
import { fmt } from "../utils/format";
import { useMemo } from "react";



function cardToneCls(t: AirStatus): { container: string, value: string } {
  if (t === 'best') return { 
    container: "border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]", 
    value: "text-blue-400" 
  };
  if (t === 'good') return { 
    container: "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]", 
    value: "text-emerald-400" 
  };
  if (t === 'warn') return { 
    container: "border-amber-500/50 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]", 
    value: "text-amber-400" 
  };
  return { 
    container: "border-rose-500/50 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]", 
    value: "text-rose-400" 
  };
}

export default function KpiCards({ latest, spaceId }: { latest: AirPoint, spaceId?: string }) {
  const { t } = useTranslation();

  const items = useMemo(() => {
    // PM 1.0 logic: using PM2.5 threshold as a base or fixed
    

    const vocLevel = Math.round(latest.voc / 10);
    const pm1Status = getMetricStatus('pm1', latest.pm1);
    const pm25Status = getMetricStatus('pm25', latest.pm25);
    const pm10Status = getMetricStatus('pm10', latest.pm10);
    const co2Status = getMetricStatus('co2', latest.co2);
    const vocStatus = getMetricStatus('voc', vocLevel);
    
    // Comfort status based on temp & hum
    const tStat = getMetricStatus('temp', latest.temp);
    const hStat = getMetricStatus('hum', latest.hum);
    const comfortStatus = getWorstStatus([tStat, hStat]);

    const baseItems = [
      { k: "PM2.5", v: latest.pm25, u: "µg/m³", t: pm25Status, desc: t("overview.metrics.pm25"), priority: 1 },
      { k: "PM1.0", v: latest.pm1, u: "µg/m³", t: pm1Status, desc: t("overview.metrics.pm1"), priority: 2 },
      { k: "PM10", v: latest.pm10, u: "µg/m³", t: pm10Status, desc: t("overview.metrics.pm10"), priority: 5 },
      { k: "CO2", v: latest.co2, u: "ppm", t: co2Status, desc: t("overview.metrics.co2"), priority: 10 },
      { k: "TVOC", v: vocLevel, u: "Level", t: vocStatus, desc: t("overview.metrics.voc"), priority: 15 },
      { k: "Temp / Hum", v: 0, u: "", t: comfortStatus, extra: `${fmt(latest.temp, 1)}°C / ${latest.hum}%`, desc: t("overview.metrics.comfort"), priority: 20 },
    ];

    // Contextual Sorting based on spaceId
    if (spaceId === 'kitchen') {
      return [...baseItems].sort((a, b) => {
        if (a.k === 'PM2.5' || a.k === 'PM1.0' || a.k === 'VOC') return -1;
        if (b.k === 'PM2.5' || b.k === 'PM1.0' || b.k === 'VOC') return 1;
        return a.priority - b.priority;
      });
    }

    if (spaceId === 'bedroom' || spaceId === 'meeting-a') {
      return [...baseItems].sort((a, b) => {
        if (a.k === 'CO2' || a.k === 'Temp / Hum') return -1;
        if (b.k === 'CO2' || b.k === 'Temp / Hum') return 1;
        return a.priority - b.priority;
      });
    }

    // Default: PM2.5, PM1.0 First
    return [...baseItems].sort((a, b) => a.priority - b.priority);
  }, [latest, spaceId, t]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {items.map((it) => {
        const styles = cardToneCls(it.t as AirStatus);
        return (
          <div
            key={it.k}
            className={`rounded-2xl border p-4 ${styles.container} transition-all duration-500 hover:scale-[1.02] bg-slate-900/40 opacity-95 hover:opacity-100`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{it.k}</div>
            <div className={`mt-1 text-2xl font-bold ${styles.value} flex items-baseline gap-1 transition-colors duration-500`}>
              {"extra" in it ? it.extra : it.v}
              {!it.extra && <span className="text-[10px] text-slate-500 font-normal">{it.u}</span>}
            </div>
            <div className="mt-1 text-[10px] text-slate-400 font-medium">
              {it.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
