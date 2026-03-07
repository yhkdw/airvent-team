import { AirPoint } from "../types/air";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function randn(): number {
  // simple gaussian-ish noise
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

let cached: AirPoint[] | null = null;

export function getMockAirQualitySeries(): AirPoint[] {
  if (cached) return cached;

  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const points: AirPoint[] = [];

  // Baselines
  let co2Base = 650;
  let pm25Base = 12;
  let vocBase = 220;

  for (let i = 0; i < 24 * 60; i++) {
    const t = new Date(start.getTime() + i * 60 * 1000);
    const hour = t.getHours() + t.getMinutes() / 60;

    // daily patterns
    const busy = Math.sin((2 * Math.PI * (hour - 12)) / 24); // peak around noon
    const evening = Math.sin((2 * Math.PI * (hour - 19)) / 24);

    co2Base = clamp(700 + 450 * Math.max(0, busy) + 250 * Math.max(0, evening), 450, 1800);
    pm25Base = clamp(10 + 18 * Math.max(0, evening) + 6 * Math.max(0, busy), 3, 80);
    vocBase = clamp(200 + 180 * Math.max(0, busy) + 120 * Math.max(0, evening), 80, 900);

    // occasional spikes (simulate events)
    const spike = Math.random() < 0.015 ? (0.8 + Math.random() * 1.8) : 0;

    const co2 = clamp(co2Base + randn() * 40 + spike * 400, 420, 2200);
    const pm25 = clamp(pm25Base + randn() * 3 + spike * 20, 1, 200);
    const pm10 = clamp(pm25 * (1.4 + Math.random() * 0.4) + randn() * 2, 2, 260);
    const pm1 = clamp(pm25 * (0.55 + Math.random() * 0.2) + randn() * 1.5, 1, 180);
    const voc = clamp(vocBase + randn() * 30 + spike * 150, 50, 1400);

    const temp = clamp(23 + Math.sin((2 * Math.PI * (hour - 15)) / 24) * 2 + randn() * 0.3, 18, 30);
    const hum = clamp(42 + Math.sin((2 * Math.PI * (hour - 6)) / 24) * 10 + randn() * 1.2, 25, 70);

    points.push({
      ts: t.toISOString(),
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      pm1: Math.round(pm1),
      co2: Math.round(co2),
      voc: Math.round(voc),
      temp: Math.round(temp * 10) / 10,
      hum: Math.round(hum),
    });
  }

  cached = points;
  return points;
}

export function downsampleByMinutes(series: AirPoint[], bucketMinutes: number): AirPoint[] {
  if (bucketMinutes <= 1) return series;
  const out: AirPoint[] = [];
  let bucket: AirPoint[] = [];
  for (let i = 0; i < series.length; i++) {
    bucket.push(series[i]);
    if (bucket.length === bucketMinutes || i === series.length - 1) {
      const avg = (key: keyof AirPoint) => {
        const nums = bucket.map((p) => p[key]).filter((v) => typeof v === "number") as number[];
        const s = nums.reduce((a, b) => a + b, 0);
        return s / Math.max(1, nums.length);
      };
      const last = bucket[bucket.length - 1];
      out.push({
        ts: last.ts,
        pm25: Math.round(avg("pm25")),
        pm10: Math.round(avg("pm10")),
        pm1: Math.round(avg("pm1")),
        co2: Math.round(avg("co2")),
        voc: Math.round(avg("voc")),
        temp: Math.round(avg("temp") * 10) / 10,
        hum: Math.round(avg("hum")),
      });
      bucket = [];
    }
  }
  return out;
}
