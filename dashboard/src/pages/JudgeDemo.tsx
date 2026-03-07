import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wind, Activity, BrainCircuit, ShieldCheck, Zap, LayoutDashboard, LogOut, Wallet, ChevronRight } from 'lucide-react';
import { loginWithEmail } from '../auth';

// --- 1. 로그인 페이지 ---
const LoginPage = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Use the centralized login function
        const { error: loginErr } = await loginWithEmail(email, password);
        if (!loginErr) {
            onLogin();
        } else {
            setError(loginErr.message || '계정 정보가 일치하지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Wind className="text-emerald-400" size={32} />
                    <span className="text-2xl font-bold text-white">Airvent DePIN</span>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Email" required />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">비밀번호</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Password" required />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                        대시보드 접속하기
                    </button>
                </form>
                <button onClick={onBack} className="w-full text-slate-500 hover:text-white mt-4 text-sm transition-colors">
                    뒤로 가기
                </button>
            </div>
        </div>
    );
};

// --- 2. 대시보드 화면 (AI 검증 패널 추가) ---
const DashboardView = ({ onLogout }: { onLogout: () => void }) => {
    const [tokenBalance, setTokenBalance] = useState(1240.50);
    const [aiStatus, setAiStatus] = useState(0);

    const aiLogs = [
        { text: "센서 데이터 스트리밍 중...", icon: <Activity size={16} className="text-blue-400" /> },
        { text: "OpenAI 패턴 분석: 어뷰징 징후 탐색...", icon: <BrainCircuit size={16} className="text-purple-400 animate-pulse" /> },
        { text: "데이터 무결성 검증 완료 (신뢰도 99.8%)", icon: <ShieldCheck size={16} className="text-emerald-400" /> },
        { text: "+0.05 AiVT 보상 지급 승인", icon: <Zap size={16} className="text-yellow-400" /> },
    ];

    // AI 로그 및 채굴 시뮬레이션
    useEffect(() => {
        const aiInterval = setInterval(() => {
            setAiStatus((prev) => (prev + 1) % aiLogs.length);
        }, 2500); // 2.5초마다 상태 변경

        const tokenInterval = setInterval(() => {
            setTokenBalance(prev => prev + 0.05);
        }, 10000); // 10초마다 채굴

        return () => { clearInterval(aiInterval); clearInterval(tokenInterval); };
    }, [aiLogs.length]);

    const data = Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, pm25: Math.floor(Math.random() * 30) + 15 }));

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            <aside className="w-64 bg-slate-800 hidden md:flex flex-col border-r border-slate-700">
                <div className="p-6 text-2xl font-bold flex items-center gap-2">
                    <Wind className="text-emerald-400" /> Airvent <span className="text-xs bg-emerald-600 px-2 rounded">DePIN</span>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    <div className="p-3 rounded-lg bg-slate-700 text-emerald-400 flex items-center gap-3"><LayoutDashboard size={20} /> 대시보드</div>
                    {['내 기기 관리', 'AI 데이터 마켓', '지갑 / 보상', '설정'].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg cursor-pointer text-slate-400 hover:bg-slate-700 transition-colors">{item}</div>
                    ))}
                </nav>
                <button onClick={onLogout} className="m-4 p-3 flex items-center gap-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"><LogOut size={18} /> 로그아웃</button>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
                    <h1 className="text-lg font-semibold">실시간 마이닝 & 검증</h1>
                    <button className="px-4 py-2 bg-emerald-600 rounded-lg font-medium text-sm flex items-center gap-2 transition-all">
                        <Wallet size={16} /> {tokenBalance.toFixed(2)} AiVT
                    </button>
                </header>

                <div className="p-6 space-y-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <p className="text-slate-400 text-sm">실내 공기질 (AQI)</p>
                            <h3 className="text-3xl font-bold mt-2">좋음 <span className="text-emerald-400 text-lg">(21)</span></h3>
                        </div>

                        {/* 해커톤 핵심: AI 검증 패널 */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden md:col-span-2">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={64} /></div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-purple-400 text-sm font-bold flex items-center gap-2">
                                    <BrainCircuit size={16} /> OpenAI 기반 실시간 검증
                                </p>
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full animate-pulse">Live</span>
                            </div>
                            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-700 h-16 flex items-center transition-all duration-300">
                                <div className="flex items-center gap-3 w-full">
                                    {aiLogs[aiStatus].icon}
                                    <span className="text-slate-300 transition-opacity duration-300">{aiLogs[aiStatus].text}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-6">시간대별 데이터 수집 차트</h3>
                        <div className="h-64"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="time" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} /><Line type="monotone" dataKey="pm25" stroke="#34d399" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- 3. 랜딩 페이지 (시작 화면) ---
const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    const [billingMode, setBillingMode] = useState('rental');

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 z-50 bg-slate-950/80 backdrop-blur">
                <div className="flex items-center gap-2 font-bold text-xl"><Wind className="text-emerald-400" /> Airvent <span className="text-sm font-light text-slate-400">DePIN</span></div>
                <button onClick={() => onNavigate('login')} className="px-5 py-2 text-sm font-bold bg-white/10 hover:bg-white/20 rounded-full transition-all">
                    로그인
                </button>
            </nav>

            <header className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    초기 비용 0원으로 시작하는<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">데이터 자산 수익화</span>
                </h1>
            </header>

            <section className="px-6 pb-24 max-w-5xl mx-auto">
                <div className="flex justify-center mb-12">
                    <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex relative cursor-pointer">
                        <button onClick={() => setBillingMode('rental')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all ${billingMode === 'rental' ? 'text-white' : 'text-slate-400'}`}>구독형 (Zero-Start)</button>
                        <button onClick={() => setBillingMode('purchase')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all ${billingMode === 'purchase' ? 'text-white' : 'text-slate-400'}`}>소유형 (구매)</button>
                        <div className={`absolute top-1 bottom-1 w-[50%] bg-emerald-600 rounded-full transition-all duration-300 ${billingMode === 'rental' ? 'left-1' : 'left-[49%]'}`}></div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Airvent Node V1</h3>
                        <p className="text-slate-400 mb-6">AI가 검증하는 100% 신뢰도 데이터</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold mb-2">{billingMode === 'rental' ? '₩ 0' : '₩ 299,000'}</div>
                        <p className="text-slate-500 text-sm mb-6">{billingMode === 'rental' ? '초기 비용 없음 / 월 1.9만 원' : '일시불 / 월 비용 없음'}</p>
                        <button onClick={() => onNavigate('login')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group">
                            대시보드 접속 <ChevronRight size={20} className="group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- 메인 라우터 ---
export default function JudgeDemo() {
    const [currentPage, setCurrentPage] = useState('landing'); // landing, login, dashboard

    if (currentPage === 'login') return <LoginPage onLogin={() => setCurrentPage('dashboard')} onBack={() => setCurrentPage('landing')} />;
    if (currentPage === 'dashboard') return <DashboardView onLogout={() => setCurrentPage('landing')} />;
    // LandingPage's props are typed inline now
    return <LandingPage onNavigate={setCurrentPage} />;
}
