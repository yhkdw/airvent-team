import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";

/* ─────────────── types ─────────────── */
type Lang = "ko" | "en";
type ProductKey = "pro" | "titan";

/* ─────────────── product data ─────────────── */
const products: Record<ProductKey, {
    name: string; tagline: Record<Lang, string>; image: string;
    earlyBird: number; standard: number; set3: number; list: number;
    specs: { label: string; value: string; highlight?: boolean }[];
}> = {
    pro: {
        name: "Airvent Pro",
        tagline: { ko: "개인·가정용 하이퍼로컬 센서", en: "Personal & Home Hyperlocal Sensor" },
        image: "/airvent_pro.png",
        earlyBird: 349, standard: 399, set3: 299, list: 499,
        specs: [
            { label: "PM1.0", value: "0–500 µg/m³", highlight: true },
            { label: "PM2.5", value: "0–999 µg/m³", highlight: true },
            { label: "PM10", value: "0–999 µg/m³", highlight: true },
            { label: "CO₂", value: "400–5000 ppm", highlight: true },
            { label: "TVOC", value: "Level 1–5" },
            { label: "온도 / Temp", value: "0–50 °C ±0.5" },
            { label: "습도 / Humi", value: "0–99% RH ±3" },
            { label: "디스플레이", value: "4.3\" 컬러 LCD" },
            { label: "연결", value: "Wi-Fi 2.4GHz" },
            { label: "전원", value: "USB-C 5V/2A" },
            { label: "크기", value: "120 × 75 × 25 mm" },
            { label: "인증", value: "CE / KC" },
        ],
    },
    titan: {
        name: "Airvent Titan",
        tagline: { ko: "상업·옥외용 프리미엄 센서", en: "Commercial & Outdoor Premium Sensor" },
        image: "/airvent_titan.png",
        earlyBird: 599, standard: 699, set3: 549, list: 799,
        specs: [
            { label: "PM1.0", value: "0–1000 µg/m³", highlight: true },
            { label: "PM2.5", value: "0–1000 µg/m³", highlight: true },
            { label: "PM10", value: "0–1000 µg/m³", highlight: true },
            { label: "CO₂", value: "400–10000 ppm", highlight: true },
            { label: "TVOC", value: "Level 1–5 (고감도)" },
            { label: "온도 / Temp", value: "-20–60 °C ±0.3" },
            { label: "습도 / Humi", value: "0–99% RH ±2" },
            { label: "디스플레이", value: "5.0\" 컬러 IPS LCD" },
            { label: "연결", value: "Wi-Fi 2.4/5GHz + LTE (옵션)" },
            { label: "전원", value: "USB-C + DC 12V 방수 지원" },
            { label: "크기", value: "150 × 90 × 30 mm (IP54)" },
            { label: "인증", value: "CE / KC / FCC" },
        ],
    },
};

/* ─────────────── FAQ data ─────────────── */
const faqs: { q: Record<Lang, string>; a: Record<Lang, string> }[] = [
    {
        q: { ko: "설치가 어렵진 않나요?", en: "Is the installation difficult?" },
        a: { ko: "전원과 Wi-Fi만 있으면 됩니다. 앱 가이드를 따라 30분 이내 완료할 수 있습니다.", en: "You only need power and Wi-Fi. Follow the in-app guide and setup takes under 30 minutes." },
    },
    {
        q: { ko: "AIVT 토큰은 어디서 사용하나요?", en: "Where can I use AIVT tokens?" },
        a: { ko: "Solana 기반 DEX에서 거래 가능하며, 추후 노드 구매 할인권 등으로 사용 범위가 확대됩니다.", en: "AIVT is tradeable on Solana-based DEXes and will expand to node purchase discounts and more." },
    },
    {
        q: { ko: "보상 지급은 얼마나 자주 이루어지나요?", en: "How often are rewards distributed?" },
        a: { ko: "데이터 검증 완료 즉시(약 1시간 주기) Solana 체인에서 자동 지급됩니다.", en: "Rewards are automatically distributed on-chain approximately every hour after data validation." },
    },
    {
        q: { ko: "구독 크레딧으로 얼마나 할인받을 수 있나요?", en: "How much discount can I get with subscription credits?" },
        a: { ko: "Pro 구독(월 $19)부터 크레딧이 적립되며, 노드 구매 시 결제 소계의 최대 60%까지 크레딧으로 결제 가능합니다.", en: "Credits accrue from Pro subscription ($19/mo) and can cover up to 60% of your node purchase subtotal." },
    },
    {
        q: { ko: "여러 노드를 한 계정에서 관리할 수 있나요?", en: "Can I manage multiple nodes in one account?" },
        a: { ko: "네, Ops 플랜에서는 멀티사이트 운영 및 CSV 내보내기 등 대량 관리 기능을 제공합니다.", en: "Yes. The Ops plan supports multi-site management, bulk CSV exports, and org credit banking." },
    },
];

/* ─────────────── Component ─────────────── */
export default function NodeDetailPage() {
    const [lang, setLang] = useState<Lang>("ko");
    const [selected, setSelected] = useState<ProductKey>("titan");
    const [uptime, setUptime] = useState(20); // hours/day
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const product = products[selected];
    // Estimated daily AIVT: ~0.8 AIVT/hr at 100% uptime (mock formula)
    const dailyAIVT = (uptime * 0.8).toFixed(1);
    const monthlyAIVT = (Number(dailyAIVT) * 30).toFixed(0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
                <Container>
                    <div className="py-3 flex items-center justify-between gap-4">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/airvent-logo-v3.png" alt="Airvent" className="h-10 w-auto object-contain" />
                            <span className="hidden sm:block text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                                Airvent DePIN
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                                {(["ko", "en"] as Lang[]).map((l) => (
                                    <button key={l} onClick={() => setLang(l)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>
                                        {l.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <Link to="/login" className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition">
                                {lang === "ko" ? "로그인" : "Login"}
                            </Link>
                        </div>
                    </div>
                </Container>
            </header>

            <main>
                {/* ── Breadcrumb ── */}
                <div className="border-b border-slate-800/60 bg-slate-900/30">
                    <Container>
                        <div className="py-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Link to="/" className="hover:text-emerald-400 transition-colors">
                                {lang === "ko" ? "홈" : "Home"}
                            </Link>
                            <span>›</span>
                            <span className="text-slate-300">{lang === "ko" ? "노드 구매" : "Buy Node"}</span>
                        </div>
                    </Container>
                </div>

                {/* ── Product Hero ── */}
                <section className="py-16 border-b border-slate-800/60">
                    <Container>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Image */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/8 rounded-3xl blur-2xl scale-110" />
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="relative w-full max-w-xs md:max-w-sm object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                {/* Product selector */}
                                <div className="flex gap-3 mb-8">
                                    {(Object.keys(products) as ProductKey[]).map((key) => (
                                        <button key={key} onClick={() => setSelected(key)}
                                            className={`flex-1 rounded-xl border py-3 px-4 text-sm font-bold transition-all ${selected === key ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                                            {products[key].name}
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-2 text-xs font-bold text-emerald-400 tracking-widest uppercase">
                                    {lang === "ko" ? "AIRVENT 노드" : "AIRVENT NODE"}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{product.name}</h1>
                                <p className="text-slate-400 mb-8">{product.tagline[lang]}</p>

                                {/* Key stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[
                                        { label: lang === "ko" ? "센서 항목" : "Sensors", val: "7종" },
                                        { label: "PM2.5 정확도", val: "±10%" },
                                        { label: lang === "ko" ? "업데이트 주기" : "Update Rate", val: "1min" },
                                    ].map((s, i) => (
                                        <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-center">
                                            <div className="text-xl font-black text-emerald-400">{s.val}</div>
                                            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing */}
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 mb-6">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                        {lang === "ko" ? "가격 옵션" : "Pricing Options"}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: lang === "ko" ? "얼리버드" : "Early Bird", val: product.earlyBird, highlight: true },
                                            { label: lang === "ko" ? "스탠다드" : "Standard", val: product.standard, highlight: false },
                                            { label: lang === "ko" ? "3대 세트 (개당)" : "Set of 3 (each)", val: product.set3, highlight: false },
                                            { label: lang === "ko" ? "정가" : "List Price", val: product.list, highlight: false },
                                        ].map((p, i) => (
                                            <div key={i} className={`rounded-xl p-3 flex justify-between items-center ${p.highlight ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/50"}`}>
                                                <span className={`text-xs font-semibold ${p.highlight ? "text-emerald-400" : "text-slate-400"}`}>{p.label}</span>
                                                <span className={`text-base font-black ${p.highlight ? "text-emerald-400" : "text-white"}`}>${p.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-xs text-slate-500 text-center">
                                        {lang === "ko" ? "구독 크레딧으로 최대 60% 추가 할인" : "Up to 60% off with subscription credits"}
                                    </div>
                                </div>

                                <Link to="/login"
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-slate-950 font-bold py-4 text-lg hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transform">
                                    {lang === "ko" ? "지금 구매하기" : "Buy Now"} →
                                </Link>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ── Spec Table ── */}
                <section className="py-20 border-b border-slate-800/60">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-2">SPECIFICATIONS</div>
                                <h2 className="text-3xl font-bold text-white">
                                    {lang === "ko" ? "상세 스펙" : "Detailed Specifications"}
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                                    <div className="text-sm font-bold text-white">{product.name}</div>
                                    <div className="text-xs text-slate-500">{lang === "ko" ? "전체 항목" : "All Specs"}</div>
                                </div>
                                <div className="divide-y divide-slate-800/60">
                                    {product.specs.map((spec, i) => (
                                        <div key={i} className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/30 ${spec.highlight ? "bg-emerald-500/3" : ""}`}>
                                            <span className={`text-sm font-semibold ${spec.highlight ? "text-emerald-400" : "text-slate-300"}`}>
                                                {spec.label}
                                            </span>
                                            <span className="text-sm text-slate-400 font-mono">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ── Earnings Simulator ── */}
                <section className="py-20 border-b border-slate-800/60 bg-slate-900/30">
                    <Container>
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="text-xs text-sky-400 font-bold tracking-widest uppercase mb-2">
                                    {lang === "ko" ? "수익 시뮬레이터" : "EARNINGS SIMULATOR"}
                                </div>
                                <h2 className="text-3xl font-bold text-white">
                                    {lang === "ko" ? "예상 리워드 계산해보기" : "Estimate Your Rewards"}
                                </h2>
                                <p className="text-slate-400 mt-3 text-sm">
                                    {lang === "ko"
                                        ? "일일 운영 시간을 조절하여 예상 AIVT 리워드를 확인하세요. (예시 수치)"
                                        : "Adjust your daily uptime to see estimated AIVT rewards. (Illustrative figures)"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-semibold text-slate-300">
                                            {lang === "ko" ? "일일 운영 시간" : "Daily Uptime"}
                                        </label>
                                        <span className="text-lg font-black text-emerald-400">{uptime}{lang === "ko" ? "시간" : "h"} / {lang === "ko" ? "일" : "day"}</span>
                                    </div>
                                    <input
                                        type="range" min={1} max={24} value={uptime}
                                        onChange={(e) => setUptime(Number(e.target.value))}
                                        className="w-full accent-emerald-500 h-2 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                                        <span>1h</span>
                                        <span>24h</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 text-center">
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                            {lang === "ko" ? "일 예상 리워드" : "Est. Daily Reward"}
                                        </div>
                                        <div className="text-3xl font-black text-emerald-400">{dailyAIVT}</div>
                                        <div className="text-xs text-slate-500 mt-1">AIVT / {lang === "ko" ? "일" : "day"}</div>
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                            {lang === "ko" ? "월 예상 리워드" : "Est. Monthly Reward"}
                                        </div>
                                        <div className="text-3xl font-black text-emerald-400">{monthlyAIVT}</div>
                                        <div className="text-xs text-slate-500 mt-1">AIVT / {lang === "ko" ? "월" : "mo"}</div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl bg-slate-800/40 border border-slate-700/50 px-5 py-3 text-xs text-slate-500 text-center leading-relaxed">
                                    {lang === "ko"
                                        ? "* 실제 리워드는 네트워크 상태, 데이터 품질, 토큰 가격에 따라 달라질 수 있습니다."
                                        : "* Actual rewards may vary based on network conditions, data quality, and token price."}
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ── Subscription Discount Info ── */}
                <section className="py-20 border-b border-slate-800/60">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 p-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                                <div className="text-center mb-8">
                                    <div className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-2">
                                        {lang === "ko" ? "구독 할인 시스템" : "SUBSCRIPTION DISCOUNT"}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white">
                                        {lang === "ko" ? "구독으로 노드를 더 저렴하게" : "Get Your Node for Less with Subscription"}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {[
                                        { plan: "Free", price: "$0", credit: "+$8", color: "text-slate-400" },
                                        { plan: "Pro", price: "$19/mo", credit: "+$28", color: "text-indigo-400" },
                                        { plan: "Ops", price: "$49/mo", credit: "+$80", color: "text-purple-400" },
                                    ].map((p, i) => (
                                        <div key={i} className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 text-center hover:border-indigo-500/30 transition-all">
                                            <div className={`text-sm font-bold ${p.color} mb-1`}>{p.plan}</div>
                                            <div className="text-2xl font-black text-white">{p.price}</div>
                                            <div className="text-sm text-emerald-400 font-bold mt-2">{p.credit} {lang === "ko" ? "크레딧/월" : "credits/mo"}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-sm text-slate-400 mt-6">
                                    {lang === "ko"
                                        ? "크레딧은 노드 결제 소계의 최대 60%까지 사용 가능합니다."
                                        : "Credits can be applied to up to 60% of your node purchase subtotal."}
                                </p>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ── FAQ ── */}
                <section className="py-20">
                    <Container>
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-2">FAQ</div>
                                <h2 className="text-3xl font-bold text-white">
                                    {lang === "ko" ? "자주 묻는 질문" : "Frequently Asked Questions"}
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="border border-slate-800 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-slate-800/30 transition-colors">
                                            <span className="text-sm font-semibold text-slate-100 pr-4">{faq.q[lang]}</span>
                                            <span className={`text-emerald-400 text-xl font-bold flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                                                +
                                            </span>
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                                                {faq.a[lang]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </section>

                {/* ── Final CTA ── */}
                <section className="py-16 border-t border-slate-800/60 bg-slate-900/30">
                    <Container>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                                {lang === "ko" ? "지금 바로 시작하세요" : "Ready to Deploy?"}
                            </h2>
                            <p className="text-slate-400 mb-8">
                                {lang === "ko"
                                    ? "얼리버드 물량이 한정되어 있습니다. 지금 구매하고 제네시스 혜택을 받으세요."
                                    : "Early Bird stock is limited. Secure yours now and lock in Genesis pricing."}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/login"
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-slate-950 font-bold px-8 py-4 text-base hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transform">
                                    {lang === "ko" ? "구매하기" : "Buy Now"} →
                                </Link>
                                <Link to="/"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 text-slate-300 font-semibold px-8 py-4 text-base hover:border-slate-500 hover:text-white transition">
                                    {lang === "ko" ? "← 홈으로" : "← Back to Home"}
                                </Link>
                            </div>
                        </div>
                    </Container>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-800 bg-slate-950 py-8">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            © {new Date().getFullYear()} Airvent-AI. All rights reserved.
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                            <Link to="/login" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
                            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
                        </div>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
