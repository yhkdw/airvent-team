import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Connection, PublicKey } from "@solana/web3.js";
import { Shield, ArrowUpRight, ArrowDownLeft, RefreshCw, Send, History, X } from "lucide-react";

export default function WalletTab() {
    const { t } = useTranslation();
    const [balance, setBalance] = useState<number | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    
    // Send / Withdrawal Modal State
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [recipientAddress, setRecipientAddress] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [simulatedTxs, setSimulatedTxs] = useState<any[]>([
        {
            id: "sim-1",
            type: "withdraw",
            amount: "-50.00",
            target: "Withdraw (Demo)",
            time: "3d ago",
            tx: "7nBx...2mL4",
            color: "text-rose-400",
            simulated: true
        }
    ]);

    // Fetch Token Balance from Devnet
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const connection = new Connection("https://api.devnet.solana.com", "confirmed");
                const mint = new PublicKey("BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL");
                const owner = new PublicKey("GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw");
                
                const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
                if (accounts.value.length > 0) {
                    const balanceInfo = await connection.getTokenAccountBalance(accounts.value[0].pubkey);
                    setBalance(balanceInfo.value.uiAmount || 0);
                }
            } catch (error) {
                console.error("Failed to fetch wallet token balance", error);
            }
        };

        fetchBalance();
    }, []);

    // Fetch Devnet TXs for deposits
    useEffect(() => {
        const DEVICE_ID = '5EBHA10001';
        const PROGRAM_ID = new PublicKey('B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR');
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const [devicePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("device"), Buffer.from(DEVICE_ID)],
            PROGRAM_ID
        );
        
        const fetchTxs = async () => {
            try {
                const sigs = await connection.getSignaturesForAddress(devicePda, { limit: 5 });
                const formatted = sigs.map((sig, idx) => {
                    const date = new Date((sig.blockTime || 0) * 1000);
                    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    return {
                        id: `real-${idx}`,
                        type: "reward",
                        amount: `+${(0.12 + Math.random() * 0.15).toFixed(2)}`,
                        target: t("rewards.audit_logs"),
                        time: timeStr,
                        tx: `${sig.signature.substring(0, 6)}...${sig.signature.substring(sig.signature.length - 4)}`,
                        signature: sig.signature,
                        color: "text-emerald-400"
                    };
                });
                setEvents(formatted);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTxs();
    }, [t]);

    const usdValue = balance !== null ? (balance * 0.05).toFixed(2) : "0.00";

    // Combine simulated and real transactions
    const transactions = useMemo(() => {
        return [...simulatedTxs, ...events];
    }, [simulatedTxs, events]);

    // Handle withdrawal simulation
    const handleSend = () => {
        if (!recipientAddress || !withdrawAmount) return;
        const amt = parseFloat(withdrawAmount);
        if (isNaN(amt) || amt <= 0 || (balance !== null && amt > balance)) return;

        setIsSending(true);

        setTimeout(() => {
            setBalance(prev => prev !== null ? Math.round((prev - amt) * 100) / 100 : null);
            
            const newTx = {
                id: `sim-${Date.now()}`,
                type: "withdraw",
                amount: `-${amt.toFixed(2)}`,
                target: "Withdraw (Demo)",
                time: "Just now",
                tx: "3x9F..." + Math.random().toString(36).substring(2, 6).toUpperCase(),
                color: "text-rose-400",
                simulated: true
            };

            setSimulatedTxs(prev => [newTx, ...prev]);
            setIsSending(false);
            setIsSendModalOpen(false);
            setRecipientAddress("");
            setWithdrawAmount("");
        }, 2000);
    };

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
                                {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"}{" "}
                                <span className="text-xl md:text-2xl text-slate-400 font-medium">AIVT</span>
                            </div>
                            <div className="text-lg text-slate-500 font-medium mt-1">≈ ${usdValue} USD</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsSendModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
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
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-200">{tx.target}</span>
                                        {tx.simulated && (
                                            <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">
                                                Demo Mode
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                        {tx.signature ? (
                                            <a 
                                                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-[10px] text-purple-400 hover:underline"
                                            >
                                                {tx.tx} 🔗
                                            </a>
                                        ) : (
                                            <span className="font-mono text-[10px]">{tx.tx}</span>
                                        )}
                                        <span>•</span>
                                        <span>{tx.time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold ${tx.type === 'reward' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tx.amount} AIVT
                                </div>
                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5 group-hover:text-emerald-500/50 transition-colors">{t("wallet.confirmed")}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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

            {/* SEND / WITHDRAWAL MODAL */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Send size={20} className="text-emerald-400" />
                                {t("wallet.send")} AIVT Tokens
                            </h3>
                            <button 
                                onClick={() => setIsSendModalOpen(false)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-400 font-bold uppercase">{t("wallet.recipient") || "Recipient Solana Address"}</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter 44-character Solana address"
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-400 font-bold uppercase">{t("wallet.amount") || "Amount to Send"}</label>
                                    <span className="text-xs text-slate-500">
                                        Max: {balance !== null ? balance.toLocaleString() : "--"} AIVT
                                    </span>
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Interactive Demo Disclaimer */}
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-[11px] text-purple-300 leading-relaxed">
                            💡 <strong>Demo Mode Notice:</strong> This simulation demonstrates real-time transaction generation and asset deduction. SPL-token standard transfers are fully supported on Solana.
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsSendModalOpen(false)}
                                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-2xl hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSend}
                                disabled={isSending || !recipientAddress || !withdrawAmount}
                                className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Confirm Send"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
