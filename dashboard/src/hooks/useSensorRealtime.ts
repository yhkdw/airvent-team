/**
 * useSensorRealtime — Supabase `sensor_readings` 테이블을 실시간 구독하는 훅.
 *
 * 동작:
 *  1) 최초 마운트 시: 가장 최신 row 1개를 즉시 fetch
 *  2) 그 후: `INSERT` 이벤트를 구독해 새 측정값이 들어오면 자동으로 상태 갱신
 *  3) 언마운트 시: 채널 정리
 *
 * AirPoint 타입은 대시보드 컴포넌트 전반에 쓰이는 표준 형식이므로,
 * Supabase row를 이 형식으로 매핑해 반환합니다.
 *
 * 사용 예:
 *   const { latest, isLoading, error } = useSensorRealtime();
 */
import { useEffect, useState } from "react";
import { supabase, supabaseAnonKey, supabaseUrl } from "../lib/supabaseClient";
import { AirPoint } from "../types/air";

// Supabase sensor_readings row 형식 → 대시보드 AirPoint 매핑
function mapRow(row: any): AirPoint & { source: "supabase" } {
    return {
        // AirPoint.ts 정의: timestamp / pm25 / pm10 / pm1 / temp / hum / co2 / voc
        // OverviewTab의 기존 코드와 정확히 동일한 매핑을 유지합니다.
        ts: row.created_at ?? new Date().toISOString(),
        pm25: Number(row.pm2_5) || 0,
        pm10: Number(row.pm10) || 0,
        pm1: Number(row.pm1_0) || 0,
        temp: Number(row.temperature) || 0,
        hum: Number(row.humidity) || 0,
        co2: Number(row.co2) || 0,
        voc: Number(row.voc) || 0,
        source: "supabase",
    };
}

interface UseSensorRealtimeResult {
    latest: (AirPoint & { source: "supabase" }) | null;
    isLoading: boolean;
    error: string | null;
}

export function useSensorRealtime(deviceId?: string): UseSensorRealtimeResult {
    const [latest, setLatest] = useState<(AirPoint & { source: "supabase" }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // 1) 초기 fetch — 가장 최신 row
        const fetchLatest = async () => {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 8000);
            try {
                const maxCreatedAt = new Date(Date.now() + 60 * 1000).toISOString();
                const params = new URLSearchParams({
                    select: "*",
                    created_at: `lte.${maxCreatedAt}`,
                    order: "created_at.desc",
                    limit: "1",
                });

                if (deviceId) {
                    params.set("device_id", `eq.${deviceId}`);
                }

                const response = await fetch(`${supabaseUrl}/rest/v1/sensor_readings?${params.toString()}`, {
                    headers: {
                        apikey: supabaseAnonKey,
                        Authorization: `Bearer ${supabaseAnonKey}`,
                    },
                    signal: controller.signal,
                });

                if (cancelled) return;

                if (!response.ok) {
                    setError(`HTTP ${response.status}`);
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                if (data && data.length > 0) {
                    setLatest(mapRow(data[0]));
                }
                setIsLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "unknown error");
                setIsLoading(false);
            } finally {
                window.clearTimeout(timeout);
            }
        };

        fetchLatest();

        // 2) Realtime 구독
        const channelName = deviceId
            ? `public:sensor_readings:${deviceId}`
            : "public:sensor_readings";

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "sensor_readings",
                    ...(deviceId ? { filter: `device_id=eq.${deviceId}` } : {}),
                },
                (payload) => {
                    if (cancelled) return;
                    setLatest(mapRow(payload.new));
                }
            )
            .subscribe();

        // 3) cleanup
        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, [deviceId]);

    return { latest, isLoading, error };
}
