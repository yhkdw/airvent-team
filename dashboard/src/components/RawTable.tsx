import { AirPoint } from "../types/air";
import { fmtTime } from "../utils/format";

export default function RawTable({ recent }: { recent: AirPoint[] }) {
  const rows = recent.slice(-60).reverse();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 overflow-hidden">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400">RAW DATA</div>
          <div className="text-lg font-semibold">Last 60 minutes</div>
        </div>
        <div className="text-xs text-slate-500">1-min resolution</div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="text-left py-2 pr-3">Time</th>
              <th className="text-right py-2 px-3">PM2.5</th>
              <th className="text-right py-2 px-3">PM10</th>
              <th className="text-right py-2 px-3">CO2</th>
              <th className="text-right py-2 px-3">VOC</th>
              <th className="text-right py-2 px-3">Temp</th>
              <th className="text-right py-2 pl-3">Hum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ts} className="border-b border-slate-900/80">
                <td className="py-2 pr-3 text-slate-300">{fmtTime(r.ts)}</td>
                <td className="py-2 px-3 text-right">{r.pm25}</td>
                <td className="py-2 px-3 text-right">{r.pm10}</td>
                <td className="py-2 px-3 text-right">{r.co2}</td>
                <td className="py-2 px-3 text-right">{r.voc}</td>
                <td className="py-2 px-3 text-right">{r.temp}</td>
                <td className="py-2 pl-3 text-right">{r.hum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
