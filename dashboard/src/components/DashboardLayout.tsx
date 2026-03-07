import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "./Container";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    Wind,
    Coins,
    Wallet,
    LogOut,
    Menu,
    X,
    Globe
} from "lucide-react";

interface DashboardLayoutProps {
    children: ReactNode;
    balance: number;
    walletAddress: string | null;
    isConnecting: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onLogout: () => void;
}

export default function DashboardLayout({
    children,
    balance,
    walletAddress,
    isConnecting,
    onConnect,
    onDisconnect,
    onLogout
}: DashboardLayoutProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const navItems = [
        { name: t("nav.home"), path: "/dashboard", icon: LayoutDashboard },
        { name: t("nav.air_quality"), path: "/dashboard/air-quality", icon: Wind },
        { name: t("nav.rewards"), path: "/dashboard/rewards", icon: Coins },
        { name: t("nav.wallet"), path: "/dashboard/wallet", icon: Wallet },
    ];

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 text-slate-400 hover:text-white"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-bold text-emerald-500">AirVent</span>
                </div>
                <div className="text-sm font-semibold text-emerald-400">{balance.toFixed(2)} AIVT</div>
            </header>

            {/* Sidebar (Desktop & Mobile Overlay) */}
            <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:inset-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="h-full flex flex-col p-4">
                    <div className="mb-8 px-2 hidden md:block">
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">AirVent AI DePIN</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t("sidebar.operations")}</div>
                    </div>

                    {/* Language Switcher */}
                    <div className="mb-6 px-2 flex items-center gap-2">
                        <Globe size={14} className="text-slate-500" />
                        <div className="flex bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${i18n.language.startsWith('en') ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('ko')}
                                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${i18n.language.startsWith('ko') ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                KO
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl transition-colors
                    ${isActive
                                            ? "bg-emerald-600/10 text-emerald-400 border border-emerald-600/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"}
                                    `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
                        <div className="px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">{t("sidebar.total_balance")}</div>
                            <div className="text-lg font-bold text-emerald-400">{balance.toFixed(2)} AIVT</div>
                        </div>

                        <div className="px-3">
                            {walletAddress ? (
                                <div className="space-y-2">
                                    <div className="text-xs text-slate-500">{t("sidebar.connected_wallet")}</div>
                                    <div className="text-sm font-mono text-emerald-400 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        {truncateAddress(walletAddress)}
                                    </div>
                                    <button
                                        onClick={onDisconnect}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm hover:bg-slate-800 transition-colors"
                                    >
                                        {t("sidebar.disconnect")}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onConnect}
                                    disabled={isConnecting}
                                    className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                                >
                                    {isConnecting ? t("sidebar.connecting") : t("sidebar.connect_wallet")}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 transition-colors"
                        >
                            <LogOut size={16} />
                            {t("nav.logout")}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="py-6 min-h-full">
                    <Container>
                        {children}
                    </Container>
                </div>
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="md:hidden sticky bottom-0 z-20 border-t border-slate-800 bg-slate-950/90 backdrop-blur px-2 py-1 flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex flex-col items-center gap-1 p-2 rounded-lg
                ${isActive ? "text-emerald-400" : "text-slate-500"}
                            `}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
