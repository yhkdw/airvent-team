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

// 브리지 서버(airvent-db) 와 브라우저 시계가 NTP 동기화 없이 운영될 수 있으므로
// 약간의 미래 시각도 정상 수용. 5분 정도면 일반적인 클럭 드리프트를 모두 흡수.
const CLOCK_DRIFT_GRACE_MS = 5 * 60 * 1000;

function normalizeLast60Minutes(points: AirPoint[]): AirPoint[] {
    const now = Date.now();
    const min = now - 60 * 60 * 1000;
    const futureCap = now + CLOCK_DRIFT_GRACE_MS;

    const unique = new Map<string, AirPoint>();

    for (const point of points) {
        const time = pointTime(point);
        if (!Number.isFinite(time)) continue;
        if (time > futureCap) continue; // grace 초과 미래만 제외 (서버 클럭 드리프트 허용)
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

        // [패치 1] try/finally — data 가 null 이거나 fetch 가 예외를 던져도
        // setLoading(false) 가 반드시 호출되도록 보장. "Loading Live Data..." 가
        // 무한 표시되는 케이스 차단.
        const fetchHistorical = async () => {
            const now = new Date();
            // 서버(airvent-db) 시계가 브라우저보다 약간 앞설 수 있으므로 grace 만큼 미래도 허용.
            // 그렇지 않으면 최신 row 가 lte 필터에서 잘려나가 historical 이 비어보이는 현상 발생.
            const maxCreatedAt = new Date(now.getTime() + CLOCK_DRIFT_GRACE_MS).toISOString();
            // SQL 쿼리는 약간 더 넓게 (65분) 가져온 뒤 normalizeLast60Minutes 에서 60분으로 자름.
            const minCreatedAt = new Date(now.getTime() - 65 * 60 * 1000).toISOString();

            try {
                const { data, error } = await supabase
                    .from("sensor_readings")
                    .select("*")
                    .eq("device_id", DEMO_DEVICE_ID)
                    .gte("created_at", minCreatedAt)
                    .lte("created_at", maxCreatedAt)
                    .order("created_at", { ascending: false })
                    .limit(60);

                if (error) throw error;

                if (isMounted) {
                    const rows = data ?? [];
                    const formatted = normalizeLast60Minutes(rows.map(rowToAirPoint));
                    setSeries(formatted);
                }
            } catch (e) {
                console.error("Error fetching historical data:", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchHistorical();

        // [패치 2] 60초마다 자동 재페치 — Realtime 구독이 끊기거나 브리지가
        // 잠시 멈췄다 복구돼도 1분 안에 화면이 자동 복원됨.
        const refetchInterval = window.setInterval(fetchHistorical, 60_000);

        // [패치 3] 탭이 다시 visible 되면 즉시 재페치 — Mac sleep/wake,
        // 다른 탭에서 돌아오기 등의 시나리오에서 즉시 최신 데이터 확보.
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchHistorical();
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

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
                    if (time > now + CLOCK_DRIFT_GRACE_MS) return; // grace 초과 미래만 차단
                    if (time < now - 60 * 60 * 1000) return;

                    setSeries((prev) => normalizeLast60Minutes([...prev, point]));
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            window.clearInterval(refetchInterval);
            document.removeEventListener("visibilitychange", onVisibilityChange);
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
