import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { GasChart, PmChart } from "../../components/Charts";
import RawTable from "../../components/RawTable";
import { AirPoint } from "../../types/air";
import { Info } from "lucide-react";
import { DEMO_DEVICE_ID } from "../../config/chain";

// Setup Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AirQualityTab() {
    const [series, setSeries] = useState<AirPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchHistorical = async () => {
            const maxCreatedAt = new Date(Date.now() + 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from('sensor_readings')
                .select('*')
                .eq('device_id', DEMO_DEVICE_ID)
                .lte('created_at', maxCreatedAt)
                .order('created_at', { ascending: false })
                .limit(60);
                
            if (error) {
                console.error("Error fetching historical data:", error);
                if (isMounted) setLoading(false);
                return;
            }
            
            if (data && isMounted) {
                const formatted: AirPoint[] = data.map(row => ({
                    ts: new Date(row.created_at).toISOString(),
                    timestamp: new Date(row.created_at).getTime(),
                    pm25: row.pm2_5,
                    pm10: row.pm10,
                    pm1: row.pm1_0,
                    temp: row.temperature,
                    hum: row.humidity,
                    co2: row.co2,
                    voc: row.voc,
                    source: 'supabase'
                }) as AirPoint).reverse();
                
                setSeries(formatted);
                setLoading(false);
            }
        };

        fetchHistorical();

        const channel = supabase
            .channel('public:sensor_readings:airquality')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sensor_readings',
                    filter: `device_id=eq.${DEMO_DEVICE_ID}`,
                },
                (payload) => {
                const row = payload.new;
                const newPoint: AirPoint = {
                    ts: new Date(row.created_at).toISOString(),
                    timestamp: new Date(row.created_at).getTime(),
                    pm25: row.pm2_5,
                    pm10: row.pm10,
                    pm1: row.pm1_0,
                    temp: row.temperature,
                    hum: row.humidity,
                    co2: row.co2,
                    voc: row.voc,
                    source: 'supabase'
                } as AirPoint;
                
                if (isMounted) {
                    setSeries(prev => [...prev, newPoint].slice(-60));
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    const chartData = series; // Realtime data doesn't need heavy downsampling
    const last60 = series.slice().reverse(); // Reverse for table view (newest first)

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
                        This data is live from your local sensor node. AI verification marks on the charts indicate successful audit checkpoints recorded on Solana.
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
