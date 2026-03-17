import { useState, useEffect } from "react";
import i18n from "../i18n/config";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { isAuthed, logout } from "../auth";

/* ─────────────── types ─────────────── */
type Lang = "ko" | "en" | "ja" | "zh-TW";
type ProductKey = "pro" | "titan";

/* ─────────────── product data ─────────────── */
const products: Record<ProductKey, {
    name: string; tagline: Record<Lang, string>; image: string;
    earlyBird: number; standard: number; set3: number; list: number;
    specs: { label: Record<Lang, string>; value: Record<Lang, string>; highlight?: boolean }[];
}> = {
    pro: {
        name: "Airvent Pro",
        tagline: { ko: "개인·가정용 하이퍼로컬 센서", en: "Personal & Home Hyperlocal Sensor", ja: "個人・家庭用ハイパーローカルセンサー", "zh-TW": "個人・家庭用區域感測器" },
        image: "/airvent_pro.png",
        earlyBird: 349, standard: 399, set3: 999, list: 499,
        specs: [
            { label: { ko: "색상", en: "Color", ja: "カラー", "zh-TW": "顏色" }, value: { ko: "Black+Gray, White+Rosegold", en: "Black+Gray, White+Rosegold", ja: "Black+Gray, White+Rosegold", "zh-TW": "Black+Gray, White+Rosegold" } },
            { label: { ko: "전원 / 공급 방식", en: "Power Supply", ja: "電源供給", "zh-TW": "電源供應" }, value: { ko: "USB-C (5V/1.5A), Terminal(24V)", en: "USB-C (5V/1.5A), Terminal(24V)", ja: "USB-C (5V/1.5A), Terminal(24V)", "zh-TW": "USB-C (5V/1.5A), Terminal(24V)" } },
            { label: { ko: "극초미세먼지 (PM1.0)", en: "PM1.0", ja: "超微小粒子 (PM1.0)", "zh-TW": "超細懸浮微粒 (PM1.0)" }, value: { ko: "0–5000 μg/m³ (±10%)", en: "0–5000 μg/m³ (±10%)", ja: "0–5000 μg/m³ (±10%)", "zh-TW": "0–5000 μg/m³ (±10%)" }, highlight: true },
            { label: { ko: "초미세먼지 (PM2.5)", en: "PM2.5", ja: "微小粒子 (PM2.5)", "zh-TW": "細懸浮微粒 (PM2.5)" }, value: { ko: "0–5000 μg/m³ (±10%)", en: "0–5000 μg/m³ (±10%)", ja: "0–5000 μg/m³ (±10%)", "zh-TW": "0–5000 μg/m³ (±10%)" }, highlight: true },
            { label: { ko: "미세먼지 (PM10)", en: "PM10", ja: "粒子状物質 (PM10)", "zh-TW": "懸浮微粒 (PM10)" }, value: { ko: "0–5000 μg/m³ (±25%)", en: "0–5000 μg/m³ (±25%)", ja: "0–5000 μg/m³ (±25%)", "zh-TW": "0–5000 μg/m³ (±25%)" }, highlight: true },
            { label: { ko: "이산화탄소 (CO₂)", en: "CO2", ja: "二酸化炭素 (CO₂)", "zh-TW": "二氧化碳 (CO₂)" }, value: { ko: "±(50ppm + 5%)", en: "±(50ppm + 5%)", ja: "±(50ppm + 5%)", "zh-TW": "±(50ppm + 5%)" }, highlight: true },
            { label: { ko: "휘발성유기화합물(TVOC)", en: "TVOC", ja: "揮発性有機化合物(TVOC)", "zh-TW": "總揮發性有機化合物(TVOC)" }, value: { ko: "0-100 Level (±15%)", en: "0-100 Level (±15%)", ja: "0-100 Level (±15%)", "zh-TW": "0-100 Level (±15%)" }, highlight: true },
            { label: { ko: "온도", en: "Temperature", ja: "温度", "zh-TW": "溫度" }, value: { ko: "-10℃ ~ 60℃ (±2℃)", en: "-10℃ ~ 60℃ (±2℃)", ja: "-10℃ ~ 60℃ (±2℃)", "zh-TW": "-10℃ ~ 60℃ (±2℃)" }, highlight: true },
            { label: { ko: "습도", en: "Humidity", ja: "湿度", "zh-TW": "濕度" }, value: { ko: "0~99%RH (±5%)", en: "0~99%RH (±5%)", ja: "0~99%RH (±5%)", "zh-TW": "0~99%RH (±5%)" }, highlight: true },
            { label: { ko: "동작 환경", en: "Operating Env.", ja: "動作環境", "zh-TW": "運作環境" }, value: { ko: "-10℃~60℃, 0~95%RH", en: "-10℃~60℃, 0~95%RH", ja: "-10℃~60℃, 0~95%RH", "zh-TW": "-10℃~60℃, 0~95%RH" } },
            { label: { ko: "통신 방식", en: "Communication", ja: "通信方式", "zh-TW": "通訊方式" }, value: { ko: "Wi-Fi(2.4/5G), RS485, BLE", en: "Wi-Fi(2.4/5G), RS485, BLE", ja: "Wi-Fi(2.4/5G), RS485, BLE", "zh-TW": "Wi-Fi(2.4/5G), RS485, BLE" } },
            { label: { ko: "무게", en: "Weight", ja: "重量", "zh-TW": "重量" }, value: { ko: "204g", en: "204g", ja: "204g", "zh-TW": "204g" } },
            { label: { ko: "크기", en: "Dimensions", ja: "사이즈", "zh-TW": "尺寸" }, value: { ko: "133 x 80 x 24 mm", en: "133 x 80 x 24 mm", ja: "133 x 80 x 24 mm", "zh-TW": "133 x 80 x 24 mm" } },
            { label: { ko: "인증", en: "Certification", ja: "認証", "zh-TW": "認證" }, value: { ko: "KC / 1등급 미세먼지 성능인증", en: "KC / Grade 1 Performance", ja: "KC / 性能認証1等級", "zh-TW": "KC / 1級性能認證" } },
            { label: { ko: "제조 및 판매", en: "Manufacturer", ja: "製造・販売", "zh-TW": "製造與銷售" }, value: { ko: "(주)에어벤트", en: "Airvent Co., Ltd.", ja: "Airvent Co., Ltd.", "zh-TW": "Airvent Co., Ltd." } },
            { label: { ko: "제조국", en: "Origin", ja: "製造国", "zh-TW": "製造國" }, value: { ko: "대한민국", en: "Republic of Korea", ja: "大韓民国", "zh-TW": "大韓民國" } },
            { label: { ko: "구성품", en: "Components", ja: "同梱品", "zh-TW": "內容物" }, value: { ko: "본체, 매뉴얼, 브라켓, 케이블", en: "Product, Manual, Case, Cable", ja: "本体, マニュアル, ブラケット, ケーブル", "zh-TW": "本體, 說明書, 支架, 數據線" } },
        ],
    },
    titan: {
        name: "Airvent Titan",
        tagline: { ko: "상업·옥외용 프리미엄 센서", en: "Commercial & Outdoor Premium Sensor", ja: "商用・屋外用プレミアムセンサー", "zh-TW": "商用・戶外用頂級感測器" },
        image: "/airvent_titan.png",
        earlyBird: 599, standard: 699, set3: 1647, list: 799,
        specs: [
            { label: { ko: "색상", en: "Color", ja: "カラー", "zh-TW": "顏色" }, value: { ko: "Black+Gray, White+Rosegold", en: "Black+Gray, White+Rosegold", ja: "Black+Gray, White+Rosegold", "zh-TW": "Black+Gray, White+Rosegold" } },
            { label: { ko: "전원 / 공급 방식", en: "Power Supply", ja: "電源供給", "zh-TW": "電源供應" }, value: { ko: "USB-C (5V/1A), Terminal(24V)", en: "USB-C (5V/1A), Terminal(24V)", ja: "USB-C (5V/1A), Terminal(24V)", "zh-TW": "USB-C (5V/1A), Terminal(24V)" } },
            { label: { ko: "극초미세먼지 (PM1.0)", en: "PM1.0", ja: "超微小粒子 (PM1.0)", "zh-TW": "超細懸浮微粒 (PM1.0)" }, value: { ko: "0–5000 μg/m³ (±10%)", en: "0–5000 μg/m³ (±10%)", ja: "0–5000 μg/m³ (±10%)", "zh-TW": "0–5000 μg/m³ (±10%)" }, highlight: true },
            { label: { ko: "초미세먼지 (PM2.5)", en: "PM2.5", ja: "微小粒子 (PM2.5)", "zh-TW": "細懸浮微粒 (PM2.5)" }, value: { ko: "0–5000 μg/m³ (±10%)", en: "0–5000 μg/m³ (±10%)", ja: "0–5000 μg/m³ (±10%)", "zh-TW": "0–5000 μg/m³ (±10%)" }, highlight: true },
            { label: { ko: "미세먼지 (PM10)", en: "PM10", ja: "粒子状物質 (PM10)", "zh-TW": "懸浮微粒 (PM10)" }, value: { ko: "0–5000 μg/m³ (±25%)", en: "0–5000 μg/m³ (±25%)", ja: "0–5000 μg/m³ (±25%)", "zh-TW": "0–5000 μg/m³ (±25%)" }, highlight: true },
            { label: { ko: "이산화탄소 (CO₂)", en: "CO2", ja: "二酸化炭素 (CO₂)", "zh-TW": "二氧化碳 (CO₂)" }, value: { ko: "±(50ppm + 5%)", en: "±(50ppm + 5%)", ja: "±(50ppm + 5%)", "zh-TW": "±(50ppm + 5%)" }, highlight: true },
            { label: { ko: "휘발성유기화합물(TVOC)", en: "TVOC", ja: "揮発性有機化合物(TVOC)", "zh-TW": "總揮發性有機化合物(TVOC)" }, value: { ko: "0-100 Level (±15%)", en: "0-100 Level (±15%)", ja: "0-100 Level (±15%)", "zh-TW": "0-100 Level (±15%)" }, highlight: true },
            { label: { ko: "온도", en: "Temperature", ja: "温度", "zh-TW": "溫度" }, value: { ko: "-10℃ ~ 60℃ (±2℃)", en: "-10℃ ~ 60℃ (±2℃)", ja: "-10℃ ~ 60℃ (±2℃)", "zh-TW": "-10℃ ~ 60℃ (±2℃)" }, highlight: true },
            { label: { ko: "습도", en: "Humidity", ja: "湿度", "zh-TW": "濕度" }, value: { ko: "0~99%RH (±5%)", en: "0~99%RH (±5%)", ja: "0~99%RH (±5%)", "zh-TW": "0~99%RH (±5%)" }, highlight: true },
            { label: { ko: "동작 환경", en: "Operating Env.", ja: "動作環境", "zh-TW": "運作環境" }, value: { ko: "-10℃~60℃, 0~95%RH", en: "-10℃~60℃, 0~95%RH", ja: "-10℃~60℃, 0~95%RH", "zh-TW": "-10℃~60℃, 0~95%RH" } },
            { label: { ko: "통신 방식", en: "Communication", ja: "通信方式", "zh-TW": "通訊方式" }, value: { ko: "Wi-Fi(2.4/5G), RS485, BLE", en: "Wi-Fi(2.4/5G), RS485, BLE", ja: "Wi-Fi(2.4/5G), RS485, BLE", "zh-TW": "Wi-Fi(2.4/5G), RS485, BLE" } },
            { label: { ko: "무게", en: "Weight", ja: "重量", "zh-TW": "重量" }, value: { ko: "464g", en: "464g", ja: "464g", "zh-TW": "464g" } },
            { label: { ko: "크기", en: "Dimensions", ja: "サイズ", "zh-TW": "尺寸" }, value: { ko: "202 x 116 x 36 mm", en: "202 x 116 x 36 mm", ja: "202 x 116 x 36 mm", "zh-TW": "202 x 116 x 36 mm" } },
            { label: { ko: "인증", en: "Certification", ja: "認証", "zh-TW": "認證" }, value: { ko: "KC / 1등급 미세먼지 성능인증", en: "KC / Grade 1 Performance", ja: "KC / 性能認証1等級", "zh-TW": "KC / 1級性能認證" } },
            { label: { ko: "제조 및 판매", en: "Manufacturer", ja: "製造・販売", "zh-TW": "製造與銷售" }, value: { ko: "(주)에어벤트", en: "Airvent Co., Ltd.", ja: "Airvent Co., Ltd.", "zh-TW": "Airvent Co., Ltd." } },
            { label: { ko: "제조국", en: "Origin", ja: "製造国", "zh-TW": "製造國" }, value: { ko: "대한민국", en: "Republic of Korea", ja: "大韓民国", "zh-TW": "大韓民國" } },
            { label: { ko: "구성품", en: "Components", ja: "同梱品", "zh-TW": "內容物" }, value: { ko: "본체, 매뉴얼, 브라켓, 케이블", en: "Product, Manual, Case, Cable", ja: "本体, マニュアル, ブラケット, ケーブル", "zh-TW": "本體, 說明書, 支架, 數據線" } },
        ],
    },
};

/* ─────────────── FAQ data ─────────────── */
const faqs: { q: Record<Lang, string>; a: Record<Lang, string> }[] = [
    {
        q: { ko: "설치가 어렵진 않나요?", en: "Is the installation difficult?", ja: "設置は難しいですか？", "zh-TW": "安裝困難嗎？" },
        a: { ko: "전원과 Wi-Fi만 있으면 됩니다. 앱 가이드를 따라 30분 이내 완료할 수 있습니다.", en: "You only need power and Wi-Fi. Follow the in-app guide and setup takes under 30 minutes.", ja: "電源とWi-Fiがあれば十分です。アプリのガイドに従えば30分以内に完了できます。", "zh-TW": "只需要電源和Wi-Fi。按照應用程序指南操作，30分鐘內即可完成。" },
    },
    {
        q: { ko: "AIVT 토큰은 어디서 사용하나요?", en: "Where can I use AIVT tokens?", ja: "AIVTトークンはどこで使用できますか？", "zh-TW": "AIVT代幣可以在哪裡使用？" },
        a: { ko: "Solana 기반 DEX에서 거래 가능하며, 추후 노드 구매 할인권 등으로 사용 범위가 확대됩니다.", en: "AIVT is tradeable on Solana-based DEXes and will expand to node purchase discounts and more.", ja: "SolanaベースのDEXで取引可能であり、今後ノード購入の割引券などに利用範囲が拡大されます。", "zh-TW": "可在基於Solana의 DEX上進行交易，未來將擴展至節點購買折扣券等用途。" },
    },
    {
        q: { ko: "보상 지급은 얼마나 자주 이루어지나요?", en: "How often are rewards distributed?", ja: "リワードはどれくらいの頻度で支給されますか？", "zh-TW": "獎勵發放的頻率是多少？" },
        a: { ko: "데이터 검증 완료 즉시(약 1시간 주기) Solana 체인에서 자동 지급됩니다.", en: "Rewards are automatically distributed on-chain approximately every hour after data validation.", ja: "データ検証完了後、直ちに（約1時間周期）Solanaチェーンで自動支給されます。", "zh-TW": "數據驗證完成後（約1小時週期），將在Solana鏈上自動發放。" },
    },
    {
        q: { ko: "구독 크레딧으로 얼마나 할인받을 수 있나요?", en: "How much discount can I get with subscription credits?", ja: "サブスクリプションクレジットでどれくらいの割引を受けられますか？", "zh-TW": "使用訂閱積分可以獲得多少折扣？" },
        a: { ko: "Pro 구독(월 )부터 크레딧이 적립되며, 노드 구매 시 결제 소계의 최대 60%까지 크레딧으로 결제 가능합니다.", en: "Credits accrue from Pro subscription (/mo) and can cover up to 60% of your node purchase subtotal.", ja: "Proサブスクリプション(月)からクレジットが蓄積され、ノード購入時に小計の最大60%までクレジットで決済可能です。", "zh-TW": "從 Pro 訂閱（每月 19 美元）開始累積積分，購買節點時最多可以使用積分支付小計的 60%。" },
    },
    {
        q: { ko: "여러 노드를 한 계정에서 관리할 수 있나요?", en: "Can I manage multiple nodes in one account?", ja: "1つのアカウントで複数のノードを管理できますか？", "zh-TW": "可以在一個帳戶中管理多個節點嗎？" },
        a: { ko: "네, Ops 플랜에서는 멀티사이트 운영 및 CSV 내보내기 등 대량 관리 기능을 제공합니다.", en: "Yes. The Ops plan supports multi-site management, bulk CSV exports, and org credit banking.", ja: "はい、Opsプランではマルチサイト運営やCSVエクスポートなどの大量管理機能を提供しています。", "zh-TW": "是的，Ops計劃提供多站點運營和CSV導出等批量管理功能。" },
    },
];

/* ─────────────── Component ─────────────── */
export default function NodeDetailPage() {
        const initialLang = (() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get("lang");
        if (urlLang && ["ko", "en", "ja", "zh-TW"].includes(urlLang)) return urlLang as Lang;
        
        const i18nLang = i18n.language || "en";
        if (i18nLang.startsWith("ko")) return "ko";
        if (i18nLang.startsWith("ja")) return "ja";
        if (i18nLang.startsWith("zh")) return "zh-TW";
        return "en";
    })() as Lang;

    const [lang, setLang] = useState<Lang>(initialLang);
    const [selected, setSelected] = useState<ProductKey>("pro");
    const [uptime, setUptime] = useState(20); // hours/day
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [selectedTier, setSelectedTier] = useState<number>(0); // 0: Early Bird, 1: Standard, 2: 3-Set, 3: List
    const [authenticated, setAuthenticated] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        isAuthed().then(setAuthenticated);
    }, []);

    const handleLogout = async () => {
        await logout();
        setAuthenticated(false);
        setMenuOpen(false);
        navigate("/");
    };

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
                                {(["en", "ko", "ja", "zh-TW"] as Lang[]).map((l) => (
                                    <button key={l} onClick={() => { setLang(l); i18n.changeLanguage(l); }}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>
                                        {l.toUpperCase() === "ZH-TW" ? "ZH" : l.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            {authenticated ? (
                                <div className="relative">
                                    <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition flex items-center gap-1">
                                        {lang === "ko" ? "내 계정" : lang === "ja" ? "マイアカウント" : lang === "zh-TW" ? "我的帳戶" : "Account"} <span className="text-xs">{menuOpen ? "▲" : "▼"}</span>
                                    </button>
                                    {menuOpen && (
                                        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 overflow-hidden">
                                            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors">
                                                🏠 {lang === "ko" ? "대시보드" : lang === "ja" ? "ダッシュボード" : lang === "zh-TW" ? "控制面板" : "Dashboard"}
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
                                                🚪 {lang === "ko" ? "로그아웃" : lang === "ja" ? "ログアウト" : lang === "zh-TW" ? "登出" : "Logout"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition">
                                    {lang === "ko" ? "로그인" : lang === "ja" ? "ログイン" : lang === "zh-TW" ? "登錄" : "Login"}
                                </Link>
                            )}
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
                                {lang === "ko" ? "홈" : lang === "ja" ? "ホーム" : lang === "zh-TW" ? "首頁" : "Home"}
                            </Link>
                            <span>›</span>
                            <span className="text-slate-300">{lang === "ko" ? "노드 구매" : lang === "ja" ? "ノード購入" : lang === "zh-TW" ? "購買節點" : "Buy Node"}</span>
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
                                            { label: lang === "ko" ? "얼리버드" : "Early Bird", val: product.earlyBird },
                                            { label: lang === "ko" ? "스탠다드" : "Standard", val: product.standard },
                                            { label: lang === "ko" ? "3대 세트" : "Set of 3", val: product.set3 },
                                            { label: lang === "ko" ? "정가" : "List Price", val: product.list },
                                        ].map((p, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setSelectedTier(i)}
                                                className={`rounded-xl p-3 flex justify-between items-center transition-all border ${selectedTier === i ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-800/50 border-transparent hover:border-slate-700"}`}
                                            >
                                                <span className={`text-xs font-semibold ${selectedTier === i ? "text-emerald-400" : "text-slate-400"}`}>{p.label}</span>
                                                <span className={`text-base font-black ${selectedTier === i ? "text-emerald-400" : "text-white"}`}>${p.val}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-xs text-slate-500 text-center">
                                        {lang === "ko" ? "구독 크레딧으로 최대 60% 추가 할인" : "Up to 60% off with subscription credits"}
                                    </div>
                                </div>

                                <Link to={`/login?next=/node?product=${selected}&tier=${selectedTier}`}
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
                                                {spec.label[lang]}
                                            </span>
                                            <span className="text-sm text-slate-400 font-mono">{spec.value[lang]}</span>
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
                                <Link to={`/login?next=/node?product=${selected}&tier=${selectedTier}`}
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
