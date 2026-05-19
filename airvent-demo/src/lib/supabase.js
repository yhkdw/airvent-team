/**
 * Supabase 클라이언트 (anon key, 클라이언트 측 사용).
 *
 * 브리지가 sensor_readings 테이블에 INSERT 한 측정값을 읽어옵니다.
 * 페어링한 device_id 가 있으면 그 디바이스의 row 만 가져옵니다.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 주어진 device_id의 최신 측정값을 가져오는 단발성 fetch.
 */
export async function fetchLatestReading(deviceId) {
    let query = supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

    if (deviceId) {
        query = query.eq("device_id", deviceId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("fetchLatestReading error:", error);
        return null;
    }
    return data?.[0] ?? null;
}
