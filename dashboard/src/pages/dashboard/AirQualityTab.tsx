import { useMemo } from "react";
import { GasChart, PmChart } from "../../components/Charts";
import RawTable from "../../components/RawTable";
import { getMockAirQualitySeries, downsampleByMinutes } from "../../mock/airquality";
import { Info } from "lucide-react";

export default function AirQualityTab() {
    const series = useMemo(() => getMockAirQualitySeries(), []);
    const chartData = useMemo(() => downsampleByMinutes(series, 5), [series]);
    const last60 = series.slice(-60);

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
