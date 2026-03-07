import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { AirPoint } from "../types/air";
import { fmtTime } from "../utils/format";

function tip(val: unknown) {
  if (typeof val === "number") return val;
  return val as string;
}

export function PmChart({ data }: { data: AirPoint[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400">LAST 24H</div>
          <div className="text-lg font-semibold">PM2.5 / PM10 Trend</div>
        </div>
        <div className="text-xs text-slate-500">downsampled (5min)</div>
      </div>

      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} minTickGap={24} />
            <YAxis />
            <Tooltip
              formatter={(v) => tip(v)}
              labelFormatter={(l) => fmtTime(String(l))}
            />
            <Legend />
            <Line type="monotone" dataKey="pm25" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="pm10" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GasChart({ data }: { data: AirPoint[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400">LAST 24H</div>
          <div className="text-lg font-semibold">CO2 / VOC Trend</div>
        </div>
        <div className="text-xs text-slate-500">downsampled (5min)</div>
      </div>

      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="ts" tickFormatter={fmtTime} minTickGap={24} />
            <YAxis />
            <Tooltip
              formatter={(v) => tip(v)}
              labelFormatter={(l) => fmtTime(String(l))}
            />
            <Legend />
            <Line type="monotone" dataKey="co2" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="voc" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
