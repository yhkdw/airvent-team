import React, { useMemo, useState, cloneElement, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Newspaper, ExternalLink, Home, Briefcase, MapPin, AlertTriangle, Fan, Wind, Coffee, Users } from "lucide-react";
import KpiCards from "../../components/KpiCards";
import { getMockAirQualitySeries } from "../../mock/airquality";
import { AirPoint } from "../../types/air";
import { getMetricStatus, getWorstStatus, AirStatus } from "../../utils/airQuality";

function getFormattedDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
}

type DashboardMode = 'home' | 'office';

// Centralized Status Logic: Worst-case wins
export const getAirStatus = (p: AirPoint): AirStatus => {
    if (!p) return 'good';
    const statuses: AirStatus[] = [
        getMetricStatus('pm25', p.pm25),
        getMetricStatus('pm1', p.pm1),
        getMetricStatus('pm10', p.pm10),
        getMetricStatus('co2', p.co2),
        getMetricStatus('voc', Math.round(p.voc / 10)),
        getMetricStatus('temp', p.temp),
        getMetricStatus('hum', p.hum)
    ];
    return getWorstStatus(statuses);
};

export const getStatusColorCls = (status: string, type: 'bg' | 'border' | 'shadow' | 'text') => {
    if (status === 'best') {
        if (type === 'bg') return 'bg-blue-500';
        if (type === 'border') return 'border-blue-500';
        if (type === 'shadow') return 'shadow-blue-500/50';
        return 'text-blue-400';
    }
    if (status === 'good') {
        if (type === 'bg') return 'bg-emerald-500';
        if (type === 'border') return 'border-emerald-500';
        if (type === 'shadow') return 'shadow-emerald-500/50';
        return 'text-emerald-400';
    }
    if (status === 'warn') {
        if (type === 'bg') return 'bg-amber-500';
        if (type === 'border') return 'border-amber-500';
        if (type === 'shadow') return 'shadow-amber-500/50';
        return 'text-amber-400';
    }
    // bad
    if (type === 'bg') return 'bg-rose-500';
    if (type === 'border') return 'border-rose-500';
    if (type === 'shadow') return 'shadow-rose-500/50';
    return 'text-rose-400';
};

const news = [
    { id: 1, tag: "Update", date: getFormattedDate(), titleKey: "overview.news1_title", descKey: "overview.news1_desc", highlight: true },
    { id: 2, tag: "Tech", date: getFormattedDate(2), titleKey: "overview.news2_title", descKey: "overview.news2_desc" },
    { id: 3, tag: "Event", date: getFormattedDate(5), titleKey: "overview.news3_title", descKey: "overview.news3_desc" },
];

export default function OverviewTab() {
    const { t } = useTranslation();
    const [mode, setMode] = useState<DashboardMode>('home');
    const [activeSpace, setActiveSpace] = useState('living-room');

    const series = useMemo(() => getMockAirQualitySeries(), []);
    const rawLatest = series[series.length - 1];

    const getSpaceSpecificData = (base: AirPoint, spaceId: string): AirPoint => {
        if (!base) return {} as AirPoint;
        const factors: Record<string, { pm25: number, co2: number, voc: number }> = {
            'living-room': { pm25: 1.0, co2: 1.0, voc: 1.0 },
            'kitchen': { pm25: 3.2, co2: 1.1, voc: 1.4 }, // Realistic variation (around warn/good)
            'bedroom': { pm25: 0.9, co2: 1.1, voc: 0.9 }, 
            'kids-room': { pm25: 1.1, co2: 1.0, voc: 1.0 },
            'meeting-a': { pm25: 1.2, co2: 1.5, voc: 2.1 }, // Realistic variation (around good/warn)
            'office-area': { pm25: 1.1, co2: 1.2, voc: 1.1 },
            'lounge': { pm25: 1.2, co2: 1.1, voc: 1.4 }
        };
        const f = factors[spaceId] || { pm25: 1.0, co2: 1.0, voc: 1.0 };
        return {
            ...base,
            pm25: Math.round(base.pm25 * f.pm25),
            pm1: Math.round(base.pm1 * f.pm25),
            pm10: Math.round(base.pm10 * f.pm25),
            co2: Math.round(base.co2 * f.co2),
            voc: Math.round(base.voc * f.voc)
        };
    };

    const latest = useMemo(() => getSpaceSpecificData(rawLatest, activeSpace), [rawLatest, activeSpace]);
    const activeStatus = getAirStatus(latest);

    const homeSpaces = [
        { id: 'living-room', nameKey: 'overview.spaces.living-room', icon: <Home size={14} /> },
        { id: 'kitchen', nameKey: 'overview.spaces.kitchen', icon: <Wind size={14} /> },
        { id: 'bedroom', nameKey: 'overview.spaces.bedroom', icon: <Home size={14} /> },
        { id: 'kids-room', nameKey: 'overview.spaces.kids-room', icon: <Home size={14} /> },
    ];

    const officeSpaces = [
        { id: 'meeting-a', nameKey: 'overview.spaces.meeting-a', icon: <Briefcase size={14} /> },
        { id: 'office-area', nameKey: 'overview.spaces.office-area', icon: <Users size={14} /> },
        { id: 'lounge', nameKey: 'overview.spaces.lounge', icon: <Coffee size={14} /> },
    ];

    const currentSpaces = mode === 'home' ? homeSpaces : officeSpaces;
    const activeSpaceInfo = currentSpaces.find(s => s.id === activeSpace) || currentSpaces[0];

    const getSpaceStatus = (spaceId: string) => {
        const data = getSpaceSpecificData(rawLatest, spaceId);
        return getAirStatus(data);
    };

    const alertMessage = useMemo(() => {
        if (!latest) return null;
        if (activeStatus === 'warn' || activeStatus === 'bad') {
            const isCO2Issue = getMetricStatus('co2', latest.co2) === 'bad' || getMetricStatus('co2', latest.co2) === 'warn';
            const isPM25Issue = getMetricStatus('pm25', latest.pm25) === 'bad' || getMetricStatus('pm25', latest.pm25) === 'warn';
            const isVOCIssue = getMetricStatus('voc', Math.round(latest.voc/10)) === 'bad' || getMetricStatus('voc', Math.round(latest.voc/10)) === 'warn';

            if (isCO2Issue) {
                return {
                    title: t("overview.alerts.co2_title", { name: t((activeSpaceInfo as any).nameKey) }),
                    desc: t("overview.alerts.co2_desc", { name: t((activeSpaceInfo as any).nameKey), val: latest.co2 }),
                    action: t("overview.alerts.action_hvac"),
                    icon: <Wind className="text-rose-400" />
                };
            }
            if (isPM25Issue) {
                return {
                    title: t("overview.alerts.pm25_title", { name: t((activeSpaceInfo as any).nameKey) }),
                    desc: t("overview.alerts.pm25_desc", { name: t((activeSpaceInfo as any).nameKey), val: latest.pm25 }),
                    action: mode === "home" && activeSpace === "kitchen" ? t("overview.alerts.action_hood") : t("overview.alerts.action_purifier"),
                    icon: <Fan className="text-amber-400" />
                };
            }
            if (isVOCIssue) {
                return {
                    title: t("overview.alerts.voc_title", { name: t((activeSpaceInfo as any).nameKey) }),
                    desc: t("overview.alerts.voc_desc", { name: t((activeSpaceInfo as any).nameKey), val: latest.voc }),
                    action: t("overview.alerts.action_vent"),
                    icon: <Wind className="text-amber-400" />
                };
            }
        }
        return null;
    }, [mode, activeSpace, latest, activeStatus, activeSpaceInfo, t]);

    if (!rawLatest) return <div className="p-8 text-center text-slate-500">t("overview.loading")</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => { setMode('home'); setActiveSpace('living-room'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'home' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Home size={16} /> {t("overview.mode_home")}
                    </button>
                    <button 
                        onClick={() => { setMode('office'); setActiveSpace('meeting-a'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'office' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Briefcase size={16} /> {t("overview.mode_office")}
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {currentSpaces.map(space => {
                        const status = getSpaceStatus(space.id);
                        return (
                            <button
                                key={space.id}
                                onClick={() => setActiveSpace(space.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all whitespace-nowrap ${activeSpace === space.id ? 'bg-slate-800 border-slate-600 text-slate-100 shadow-[0_0_10px_rgba(0,0,0,0.3)]' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                                {cloneElement(space.icon as ReactElement, { 
                                    className: `transition-colors duration-500 ${getStatusColorCls(status, 'text')}`,
                                    size: 14 
                                })}
                                <span>{t((space as any).nameKey)}</span>
                                <div className={`w-2 h-2 rounded-full ${getStatusColorCls(status, 'bg')} ${getStatusColorCls(status, 'shadow')} animate-pulse`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {alertMessage && (
                <div className="flex items-center justify-between gap-4 bg-slate-900 border border-amber-500/30 p-4 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            {alertMessage.icon}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-amber-500 flex items-center gap-1">
                                <AlertTriangle size={14} /> {alertMessage.title}
                            </div>
                            <div className="text-xs text-slate-400">{alertMessage.desc}</div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/50 rounded-xl text-xs font-bold transition-all">
                        {alertMessage.action}
                    </button>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={16} className={getStatusColorCls(activeStatus, 'text')} />
                            {t("overview.global_status")}
                            <span className="text-xs text-slate-600 font-normal normal-case">/ {t((activeSpaceInfo as any).nameKey)}</span>
                        </h3>
                    </div>
                    <KpiCards latest={latest} spaceId={activeSpace} />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent" />
                    
                    <div className="relative w-full max-w-2xl aspect-[16/9] bg-slate-950/50 rounded-2xl border border-slate-800 p-6 flex items-center justify-center">
                        {mode === 'home' ? (
                            <div className="grid grid-cols-4 grid-rows-3 w-full h-full gap-2 transition-all duration-500">
                                <button onClick={() => setActiveSpace('living-room')} className={`col-span-2 row-span-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'living-room' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('living-room'), 'border')}`}>
                                    <Home size={24} className={getStatusColorCls(getSpaceStatus('living-room'), 'text')} />
                                    <span className={`text-xs mt-2 ${activeSpace === 'living-room' ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{t("overview.spaces.living-room")}</span>
                                </button>
                                <button onClick={() => setActiveSpace('kitchen')} className={`col-span-1 row-span-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'kitchen' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('kitchen'), 'border')}`}>
                                    <Wind size={20} className={getStatusColorCls(getSpaceStatus('kitchen'), 'text')} />
                                    <span className={`text-xs mt-1 ${activeSpace === 'kitchen' ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{t("overview.spaces.kitchen")}</span>
                                </button>
                                <div className="col-span-1 row-span-1 rounded-xl border border-slate-800 bg-slate-900/20 flex items-center justify-center text-[10px] text-slate-700">{t("overview.spaces.entrance")}</div>
                                <div className="col-start-3 row-start-2 rounded-xl border border-slate-800 bg-slate-900/20 flex items-center justify-center text-[10px] text-slate-700">{t("overview.spaces.bathroom")}</div>
                                <button onClick={() => setActiveSpace('bedroom')} className={`col-span-1 row-span-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'bedroom' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('bedroom'), 'border')}`}>
                                    <span className={`text-xs ${activeSpace === 'bedroom' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>{t("overview.spaces.bedroom")}</span>
                                </button>
                                <button onClick={() => setActiveSpace('kids-room')} className={`col-start-1 row-start-3 col-span-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'kids-room' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('kids-room'), 'border')}`}>
                                    <span className={`text-xs ${activeSpace === 'kids-room' ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>{t("overview.spaces.kids-room")}</span>
                                </button>
                                <div className="col-start-2 row-start-3 col-span-3 rounded-xl border border-slate-800 bg-slate-900/10 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest">{t("overview.spaces.veranda")}</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 grid-rows-3 w-full h-full gap-2 transition-all duration-500">
                                <button onClick={() => setActiveSpace('office-area')} className={`col-span-3 row-span-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'office-area' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('office-area'), 'border')}`}>
                                    <Users size={32} className={getStatusColorCls(getSpaceStatus('office-area'), 'text')} />
                                    <span className={`text-sm mt-3 ${activeSpace === 'office-area' ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{t("overview.spaces.office-area")}</span>
                                </button>
                                <button onClick={() => setActiveSpace('meeting-a')} className={`col-span-1 row-span-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'meeting-a' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('meeting-a'), 'border')}`}>
                                    <Briefcase size={20} className={getStatusColorCls(getSpaceStatus('meeting-a'), 'text')} />
                                    <span className={`text-xs mt-1 ${activeSpace === 'meeting-a' ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{t("overview.spaces.meeting-a")}</span>
                                </button>
                                <button onClick={() => setActiveSpace('lounge')} className={`col-start-4 row-start-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${activeSpace === 'lounge' ? 'bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-slate-900/50 hover:bg-slate-800'} ${getStatusColorCls(getSpaceStatus('lounge'), 'border')}`}>
                                    <Coffee size={20} className={getStatusColorCls(getSpaceStatus('lounge'), 'text')} />
                                    <span className={`text-xs mt-1 ${activeSpace === 'lounge' ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>{t("overview.spaces.lounge")}</span>
                                </button>
                                <div className="col-start-1 row-start-3 col-span-4 rounded-xl border border-slate-800 bg-slate-900/10 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest italic">{t("overview.spaces.hallway")}</div>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-full shadow-xl">
                            <div className={`w-2 h-2 rounded-full ${getStatusColorCls(activeStatus, 'bg')} ${getStatusColorCls(activeStatus, 'shadow')} animate-pulse`} />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                {t((activeSpaceInfo as any).nameKey)} : {activeStatus === 'best' ? t('overview.status_labels.perfect') : activeStatus === 'good' ? t('overview.status_labels.good') : activeStatus === 'warn' ? t('overview.status_labels.needs_vent') : t('overview.status_labels.bad')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Newspaper size={16} />
                        {t("overview.news_title")}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <div key={item.id} className={`bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/40 transition-all group ${item.highlight ? 'border-emerald-500/30' : ''}`}>
                            <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-tighter">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">{item.tag}</span>
                                <span className="text-slate-600">{item.date}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{t(item.titleKey)}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{t(item.descKey)}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-all">{t("overview.read_more")} <ExternalLink size={10} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
