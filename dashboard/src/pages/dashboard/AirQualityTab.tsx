import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GasChart, PmChart } from "../../components/Charts";
import RawTable from "../../components/RawTable";
import { AirPoint } from "../../types/air";
import { Info } from "lucide-react";
import { DEMO_DEVICE_ID } from "../../config/chain";

// Setup Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function rowToAirPoint(row: any): AirPoint {
    return {
        ts: new Date(row.created_at).toISOString(),
        timestamp: new Date(row.created_at).getTime(),
        pm25: Number(row.pm2_5) || 0,
        pm10: Number(row.pm10) || 0,
        pm1: Number(row.pm1_0) || 0,
        temp: Number(row.temperature) || 0,
        hum: Number(row.humidity) || 0,
        co2: Number(row.co2) || 0,
        voc: Number(row.voc) || 0,
        source: "supabase",
    } as AirPoint;
}

function pointTime(point: AirPoint): number {
    if (point.ts) return new Date(point.ts).getTime();
    if ((point as any).timestamp) return Number((point as any).timestamp);
    return 0;
}

function normalizeLast60Minutes(points: AirPoint[]): AirPoint[] {
    const now = Date.now();
    const min = now - 60 * 60 * 1000;

    const unique = new Map<string, AirPoint>();

    for (const point of points) {
        const time = pointTime(point);
        if (!Number.isFinite(time)) continue;
        if (time > now) continue; // 미래 데이터 제외
        if (time < min) continue; // 최근 60분만 유지

        const key = point.ts ?? String(time);
        unique.set(key, point);
    }

    return Array.from(unique.values())
        .sort((a, b) => pointTime(a) - pointTime(b)) // 차트는 오래된 시간 → 최신 시간
        .slice(-60);
}

export default function AirQualityTab() {
    const [series, setSeries] = useState<AirPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchHistorical = async () => {
            const now = new Date();
            const maxCreatedAt = now.toISOString();
            const minCreatedAt = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from("sensor_readings")
                .select("*")
                .eq("device_id", DEMO_DEVICE_ID)
                .gte("created_at", minCreatedAt)
                .lte("created_at", maxCreatedAt)
                .order("created_at", { ascending: false })
                .limit(60);

            if (error) {
                console.error("Error fetching historical data:", error);
                if (isMounted) setLoading(false);
                return;
            }

            if (data && isMounted) {
                const formatted = normalizeLast60Minutes(data.map(rowToAirPoint));
                setSeries(formatted);
                setLoading(false);
            }
        };

        fetchHistorical();

        const channel = supabase
            .channel(`public:sensor_readings:airquality:${DEMO_DEVICE_ID}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "sensor_readings",
                    filter: `device_id=eq.${DEMO_DEVICE_ID}`,
                },
                (payload) => {
                    if (!isMounted) return;

                    const row = payload.new;
                    const point = rowToAirPoint(row);
                    const time = pointTime(point);
                    const now = Date.now();

                    if (!Number.isFinite(time)) return;
                    if (time > now) return; // 현재시간보다 미래인 데이터는 화면에 반영하지 않음
                    if (time < now - 60 * 60 * 1000) return;

                    setSeries((prev) => normalizeLast60Minutes([...prev, point]));
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    // 차트는 시간순, RAW DATA는 RawTable 내부에서 최신순으로 정렬합니다.
    const chartData = series;
    const last60 = series;

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading Live Data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Info size={18} />
                </div>
                <div>
                    <div className="text-sm font-semibold">Node Telemetry Tracking</div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        This data is live from your local sensor node. Only the selected device&apos;s last 60 minutes are shown.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
                    <PmChart data={chartData} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
                    <GasChart data={chartData} />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/20">
                    <h3 className="text-sm font-semibold">Raw Telemetry Dump</h3>
                </div>
                <RawTable recent={last60} />
            </div>
        </div>
    );
}
