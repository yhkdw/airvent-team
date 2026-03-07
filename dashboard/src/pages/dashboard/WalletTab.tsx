import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SubscriptionCard from "../../components/SubscriptionCard";
import { WalletErrorBoundary } from "../../components/WalletErrorBoundary";
import { Shield, ArrowUpRight, ArrowDownLeft, RefreshCw, Send, History } from "lucide-react";

export default function WalletTab() {
    const { t } = useTranslation();
    const transactions = useMemo(() => [
        {
            id: 1,
            type: "reward",
            amount: "+14.50",
            target: t("rewards.audit_logs"),
            time: "2h ago",
            tx: "5gYm...9qZ1",
            color: "text-emerald-400"
        },
        {
            id: 2,
            type: "reward",
            amount: "+12.80",
            target: t("rewards.audit_logs"),
            time: "26h ago",
            tx: "4kPZ...xR2w",
            color: "text-emerald-400"
        },
        {
            id: 3,
            type: "withdraw",
            amount: "-50.00",
            target: "Withdraw",
            time: "3d ago",
            tx: "7nBx...2mL4",
            color: "text-rose-400"
        }
    ], [t]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Main Wallet Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t("wallet.spl_account")}</span>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-3">
                                1,240.50 <span className="text-xl md:text-2xl text-slate-400 font-medium">AIVT</span>
                            </div>
                            <div className="text-lg text-slate-500 font-medium mt-1">≈ $62.03 USD</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95">
                            <Send size={18} />
                            {t("wallet.send")}
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-700 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw size={18} />
                            {t("wallet.swap")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                            <History size={20} />
                        </div>
                        <h3 className="font-bold text-lg">{t("wallet.recent_tx")}</h3>
                    </div>
                    <button className="text-xs font-bold text-emerald-400 hover:underline px-2 py-1">{t("wallet.view_all")}</button>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${tx.type === 'reward' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {tx.type === 'reward' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200">{tx.target}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span className="font-mono text-[10px]">{tx.tx}</span>
                                        <span>•</span>
                                        <span>{tx.time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition-colors`}>{tx.amount} AIVT</div>
                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5 group-hover:text-emerald-500/50 transition-colors">{t("wallet.confirmed")}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <WalletErrorBoundary>
                <SubscriptionCard />
            </WalletErrorBoundary>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield size={20} className="text-emerald-400" />
                        {t("wallet.security")}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold">{t("wallet.protected")}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase mb-1">{t("wallet.backup")}</div>
                        <div className="text-sm font-medium">{t("wallet.secured_by")}</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase mb-1">{t("wallet.network")}</div>
                        <div className="text-sm font-medium">{t("wallet.devnet")}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
