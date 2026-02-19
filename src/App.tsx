import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * AirVent Homepage + Dashboard (single-file React app)
 * Version: v1.4.6
 *
 * Key features
 * - Homepage (bilingual KO/EN toggle)
 * - Dashboard: Public Explorer / Operations / Personal
 * - Subscription-to-Own (AirVent Credits voucher): can pay up to 60% of checkout subtotal
 * - Public Explorer: node map + list + leaderboard
 * - Public Air Badge: embeddable widget route (#/badge)
 * - Free plan + Beta Missions/Referrals (UI-first, verification required)
 * - Operations: 24h / 7d range toggle + CSV export
 * - Console Debug API: window.__airvent
 */

const APP_VERSION = "v1.4.6";

// Hero background image
// 운영(빌드/배포) 기준 권장 방식: public 폴더에 파일을 두고, 절대경로로 참조합니다.
// 파일 위치: public/hero-airvent-device.png
// 참조 경로: /hero-airvent-device.png
// (Local-only) Hero background image is served from the repo's /public folder.
// File: public/hero-airvent-device.png
const HERO_BG_LOCAL = "/hero-airvent-device.png";

// 권장(안정적) 방식: 리포지토리 public 폴더에 파일을 두고 절대경로로 참조
// 파일 위치: public/airvent-logo.png
// 참조 경로: /airvent-logo-v3.png
const LOGO_LOCAL = "/airvent-logo-v3.png";

// Brand colors
const BRAND = {
    indigo: "#6366f1",
    blue: "#3b82f6",
    green: "#10b981",
    slate: "#64748b",
} as const;

// Web3 / DePIN config
const WEB3 = {
    chain: "Solana",
    token: "AIVT",
    contract: "Mainnet-Beta",
    disclaimerEN:
        "Rewards and eligibility are subject to terms & policies. Network stats and locations may be privacy-preserved (approximate).",
    disclaimerKO:
        "리워드 및 혜택 제공은 약관/정책에 따릅니다. 네트워크 통계/위치는 프라이버시 보호를 위해 근사치로 표시될 수 있습니다.",
} as const;

// -----------------------------
// Domain types
// -----------------------------

type DashboardMode = "public" | "ops" | "personal";

type OpsRange = "24h" | "7d";

type Metric = "pm25" | "co2" | "tvoc" | "temp" | "humidity";

type CsvNewlineMode = "LF" | "CRLF";

const COMMERCE = {
    creditSymbol: "AVC",
    creditUsdRate: 1.0, // 1 credit = $1 voucher
    earlyBirdCents: 34900, // $349
    standardCents: 39900, // $399
    set3Cents: 89900, // $899 (approx $300/unit)
    listPriceCents: 49900, // $499
};

function formatUsd(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(cents / 100);
}

function rgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function brandGradientCss(deg = 135) {
    return `linear-gradient(${deg}deg, ${BRAND.indigo}, ${BRAND.blue}, ${BRAND.green})`;
}

function metricColor(m: Metric) {
    switch (m) {
        case "pm25":
            return BRAND.indigo;
        case "co2":
            return BRAND.blue;
        case "tvoc":
            return BRAND.green;
        case "temp":
            return "#f59e0b";
        case "humidity":
            return "#0ea5e9";
    }
}

// -----------------------------
// Subscription Plans
// -----------------------------

type SubPlanId = "free" | "lite" | "pro" | "ops";

type SubPlan = {
    id: SubPlanId;
    nameEn: string;
    nameKo: string;
    priceCentsPerMonth: number;
    creditsCentsPerMonth: number;
    perksEn: string[];
    perksKo: string[];
};

const SUB_PLANS: SubPlan[] = [
    {
        id: "free",
        nameEn: "Free",
        nameKo: "무료",
        priceCentsPerMonth: 0,
        creditsCentsPerMonth: 0,
        perksEn: [
            "Public Explorer + Air Badge",
            "Personal dashboard (basic)",
            "Beta (Missions/Referrals) access (requires verification)",
            "Upgrade to earn purchase credits faster",
        ],
        perksKo: [
            "공개 익스플로러 + 에어배지",
            "개인 대시보드(기본)",
            "베타(미션/리퍼럴) 참여 가능(검증 필요)",
            "업그레이드 시 구매 크레딧 더 빠르게 적립",
        ],
    },
    {
        id: "lite",
        nameEn: "Lite",
        nameKo: "라이트",
        priceCentsPerMonth: 900,
        creditsCentsPerMonth: 1200,
        perksEn: ["Personal dashboard", "Alerts (basic)", "Credits for device purchase"],
        perksKo: ["개인 대시보드", "알림(기본)", "노드 구매 크레딧 적립"],
    },
    {
        id: "pro",
        nameEn: "Pro",
        nameKo: "프로",
        priceCentsPerMonth: 1900,
        creditsCentsPerMonth: 2800,
        perksEn: ["Advanced insights", "Priority alerts", "Faster credit accrual"],
        perksKo: ["고급 인사이트", "우선 알림", "더 빠른 크레딧 적립"],
    },
    {
        id: "ops",
        nameEn: "Ops",
        nameKo: "옵스",
        priceCentsPerMonth: 4900,
        creditsCentsPerMonth: 8000,
        perksEn: ["Multi-site ops features", "CSV exports + policies", "Org credit bank"],
        perksKo: ["멀티사이트 운영 기능", "CSV 내보내기/정책", "조직 크레딧 뱅크"],
    },
];

const AIVT_MINING_RATES: Record<SubPlanId, number> = {
    free: 0.00001,
    lite: 0.00005,
    pro: 0.00012,
    ops: 0.00045,
};

function planById(id: SubPlanId) {
    return SUB_PLANS.find((x) => x.id === id) ?? SUB_PLANS[0];
}

function applyCreditsToSubtotal({
    subtotalCents,
    creditBalanceCents,
}: {
    subtotalCents: number;
    creditBalanceCents: number;
}) {
    const capCents = Math.floor(subtotalCents * 0.6); // Max 60% usable
    const usedCents = Math.min(capCents, creditBalanceCents);
    const dueCents = subtotalCents - usedCents;
    return { capCents, usedCents, dueCents };
}

// -----------------------------
// i18n
// -----------------------------

type Lang = "en" | "ko";

const I18N = {
    en: {
        // Nav
        "nav.comparison": "Comparison",
        "nav.rewards": "Rewards",
        "nav.subscription": "Subscription",
        "nav.faq": "FAQ",
        "nav.homepage": "Homepage",
        "nav.dashboard": "Dashboard",
        "nav.tagline": "Indoor Air Quality • DePIN • Proof-of-Sensing",
        "nav.lang.en": "EN",
        "nav.lang.ko": "KO",

        // Wallet
        "wallet.connect": "Connect Wallet",
        "wallet.disconnect": "Disconnect",

        // Home
        "hero.pill": "Real-time IAQ • Multi-site • Shareable Air Badge",
        "hero.title": "Measure air. Turn data into an asset — and operate it with DePIN.",
        "hero.desc":
            "The moment you measure air, the data becomes an asset. Monitor PM2.5, CO₂, TVOC across sites, rank branches by KPI, trigger alerts, and export reports — with Web3-native Proof-of-Sensing incentives.",
        "hero.cta.buy": "Buy Now",
        "hero.cta.dashboard": "Open Dashboard",
        "hero.cta.pilot": "Request Pilot / PoC →",

        "badge.title": "Air Badge",
        "badge.right": "Embeddable widget",
        "badge.today": "Today's IAQ Score",
        "badge.site": "Site",
        "badge.updated": "Updated just now • Powered by AirVent",

        "cmp.kicker": "Comparison",
        "cmp.title": "AirVent vs legacy IAQ monitoring",
        "cmp.desc": "The wedge is operations: ranking + alerts + repeatable monthly reporting.",
        "cmp.col.cap": "Capability",
        "cmp.col.trad": "Traditional",
        "cmp.col.av": "AirVent",

        "rewards.kicker": "Rewards",
        "rewards.title": "Global pricing (USD)",
        "rewards.note":
            "List price is $499/unit. Early buyers start with Genesis perks (Early Bird / Set); once the allocation sells out, pricing returns to the list price.",
        "rewards.creditNote": "Subscribers can pay with AirVent Credits up to 60% of the checkout subtotal.",

        "sub.kicker": "Subscription",
        "sub.title": "Subscription-to-Own (AirVent Credits)",
        "sub.desc": "Start free, then upgrade to earn voucher credits and apply up to 60% toward device purchases.",
        "sub.policy": "Credits are vouchers (non-cash, non-transferable) and can cover up to 60% of the checkout subtotal.",
        "sub.cta.7d": "Open 7-day Ops Report",
        "sub.cta.beta": "Join Beta Missions",
        "sub.beta.note": "Beta rewards require verification and are not credited automatically.",

        "faq.kicker": "FAQ",
        "faq.title": "Common questions",

        // Dashboard shared
        "dash.mode.public": "Public Explorer",
        "dash.mode.ops": "Operations",
        "dash.mode.personal": "Personal",

        // Ops
        "dash.kicker": "Operations Dashboard",
        "dash.title": "Multi-site IAQ Monitoring",
        "dash.subtitle": "KPI focus: Time-over-threshold • Alerts • CSV export",
        "dash.range": "Range",
        "dash.range.24h": "24h",
        "dash.range.7d": "7d",
        "dash.export": "Export CSV",
        "dash.stat.score": "IAQ Score (latest)",
        "dash.stat.active": "Active devices",
        "dash.stat.alerts": "Alerts (latest)",
        "dash.stat.tot": "Time-over-threshold",
        "dash.stat.aivt": "AIVT earned",
        "dash.stat.credit": "Credits balance",
        "dash.trend": "Trend",
        "dash.live": "Live metrics (latest)",
        "dash.devices": "Devices",
        "dash.devices.search": "Search deviceId / vendorId / label",
        "dash.devices.none": "No devices match.",
        "dash.alerts": "Alerts",
        "dash.alerts.none": "No active alerts.",
        "dash.badge": "Public Air Badge",
        "dash.badge.desc": "Embed on your website for trust & conversion.",
        "dash.badge.copy": "Copy",
        "dash.badge.preview": "Preview",
        "dash.badge.copied": "Copied!",

        // Public explorer
        "dash.public.kicker": "Public Explorer",
        "dash.public.title": "AirVent Network Explorer",
        "dash.public.subtitle": "Node map • Live status • Leaderboard",
        "dash.public.stat.nodes": "Total nodes",
        "dash.public.stat.online": "Online",
        "dash.public.stat.cities": "Cities",
        "dash.public.stat.uptime": "Uptime (24h)",
        "dash.public.map": "Node Map",
        "dash.public.map.right": "Privacy-preserved location • click a node",
        "dash.public.list": "Nodes",
        "dash.public.list.right": "Search & filter",
        "dash.public.search": "Search device / site / city",
        "dash.public.filter.all": "All",
        "dash.public.filter.online": "Online",
        "dash.public.filter.degraded": "Degraded",
        "dash.public.filter.offline": "Offline",
        "dash.public.selected": "Selected node",
        "dash.public.none": "No nodes match.",

        // Personal
        "dash.personal.kicker": "Personal Dashboard",
        "dash.personal.title": "My IAQ & Rewards",
        "dash.personal.subtitle": "My devices • 24h insights • Credits",

        // Credits
        "credit.title": "AirVent Credits (Voucher)",
        "credit.balance": "Balance",
        "credit.max60": "Max usable: 60%",
        "credit.checkout": "Checkout",
        "credit.product": "Product",
        "credit.product.early": "Early Bird (1 unit)",
        "credit.product.std": "Standard (1 unit)",
        "credit.product.list": "List price (1 unit)",
        "credit.product.set": "Set (3 units)",
        "credit.subtotal": "Subtotal",
        "credit.cap": "Credit cap (60%)",
        "credit.used": "Credits used",
        "credit.due": "Amount due",
        "credit.plan": "Subscription plan",
        "credit.plan.current": "Current plan",
        "credit.plan.monthly": "Monthly credits",
        "credit.add": "Add credits",
        "credit.simulateMonth": "+1개월 시뮬",
        "credit.reset": "Reset",

        // Beta
        "beta.title": "Beta: Missions & Referrals",
        "beta.desc": "Earn voucher credits when missions/referrals are verified.",
        "beta.join": "Join Beta",
        "beta.joined": "Enrolled",
        "beta.ref": "Referral code",
        "beta.copy": "Copy",
        "beta.copied": "Copied!",

        // Locks
        "dash.lock.title": "Wallet required",
        "dash.lock.desc": "Connect a wallet to view customer-specific devices and rewards.",

        // Metrics
        "metric.pm25": "PM2.5 (µg/m³)",
        "metric.co2": "CO₂ (ppm)",
        "metric.tvoc": "TVOC (ppb)",
        "metric.temp": "Temperature (°C)",
        "metric.humidity": "Humidity (%)",
        "mine.title": "AIVT Real-time Mining",
        "mine.status": "Mining Active",
        "mine.rate": "Current Rate",
        "mine.total": "Total Tokens Mined",
    },
    ko: {
        // Nav
        "nav.comparison": "비교",
        "nav.rewards": "리워드",
        "nav.subscription": "구독",
        "nav.faq": "FAQ",
        "nav.homepage": "홈페이지",
        "nav.dashboard": "대시보드",
        "nav.tagline": "실내 공기질 • DePIN • Proof-of-Sensing",
        "nav.lang.en": "EN",
        "nav.lang.ko": "KO",

        // Wallet
        "wallet.connect": "지갑 연결",
        "wallet.disconnect": "연결 해제",

        // Home
        "hero.pill": "실시간 IAQ • 멀티사이트 • 공유 가능한 에어배지",
        "hero.title": "측정하는 순간, 데이터가 ‘자산’이 됩니다.",
        "hero.desc":
            "공기질 관리는 비용이 아니라, 운영지표 + DePIN 리워드로 누적되는 인프라입니다. 여러 지점을 한 화면에서 운영하고 PM2.5/CO₂/TVOC를 모니터링하며 KPI 랭킹·알림·리포트를 제공합니다.",
        "hero.cta.buy": "구매하기",
        "hero.cta.dashboard": "대시보드 열기",
        "hero.cta.pilot": "파일럿/PoC 문의 →",

        "badge.title": "에어배지",
        "badge.right": "임베드 위젯",
        "badge.today": "오늘의 IAQ 점수",
        "badge.site": "지점",
        "badge.updated": "방금 업데이트 • AirVent 제공",

        "cmp.kicker": "비교",
        "cmp.title": "AirVent vs 기존 공기질 모니터링",
        "cmp.desc": "차이는 ‘운영’입니다: 랭킹 + 알림 + 반복 가능한 월간 리포팅.",
        "cmp.col.cap": "항목",
        "cmp.col.trad": "기존 방식",
        "cmp.col.av": "AirVent",

        "rewards.kicker": "리워드",
        "rewards.title": "글로벌 가격 (USD)",
        "rewards.note":
            "정가 $499/대 기준. 초기 구매자는 ‘제네시스’ 혜택(얼리버드/세트)으로 시작하며, 물량 소진 시 정가로 복귀합니다.",
        "rewards.creditNote": "구독자는 AirVent 크레딧으로 결제 소계의 최대 60%까지 사용할 수 있습니다.",

        "sub.kicker": "구독",
        "sub.title": "구독→노드 구매(크레딧)",
        "sub.desc": "무료로 시작하고, 필요할 때 구독으로 바우처 크레딧을 적립해 노드 구매 시 결제 소계의 최대 60%까지 사용합니다.",
        "sub.policy": "크레딧은 바우처(현금화/양도 불가)이며, 결제 소계의 최대 60%까지 사용할 수 있습니다.",
        "sub.cta.7d": "7일 운영 리포트 보기",
        "sub.cta.beta": "베타 미션 참여",
        "sub.beta.note": "베타 리워드는 검증이 필요하며 자동 적립되지 않습니다.",

        "faq.kicker": "FAQ",
        "faq.title": "자주 묻는 질문",

        // Dashboard shared
        "dash.mode.public": "공개 익스플로러",
        "dash.mode.ops": "운영",
        "dash.mode.personal": "개인",

        // Ops
        "dash.kicker": "운영 대시보드",
        "dash.title": "멀티사이트 공기질 모니터링",
        "dash.subtitle": "KPI: 임계치 초과 비율 • 알림 • CSV 내보내기",
        "dash.range": "기간",
        "dash.range.24h": "24시간",
        "dash.range.7d": "7일",
        "dash.export": "CSV 내보내기",
        "dash.stat.score": "IAQ 점수 (최신)",
        "dash.stat.active": "활성 기기",
        "dash.stat.alerts": "알림 (최신)",
        "dash.stat.tot": "임계치 초과 비율",
        "dash.stat.aivt": "AIVT 획득",
        "dash.stat.credit": "크레딧 잔액",
        "dash.trend": "추이",
        "dash.live": "실시간 지표 (최신)",
        "dash.devices": "기기",
        "dash.devices.search": "deviceId / vendorId / 라벨 검색",
        "dash.devices.none": "일치하는 기기가 없습니다.",
        "dash.alerts": "알림",
        "dash.alerts.none": "활성 알림이 없습니다.",
        "dash.badge": "공개 에어배지",
        "dash.badge.desc": "웹사이트에 삽입해 신뢰와 전환을 높이세요.",
        "dash.badge.copy": "복사",
        "dash.badge.preview": "미리보기",
        "dash.badge.copied": "복사 완료!",

        // Public explorer
        "dash.public.kicker": "공개 익스플로러",
        "dash.public.title": "AirVent 네트워크 익스플로러",
        "dash.public.subtitle": "노드 지도 • 실시간 상태 • 랭킹",
        "dash.public.stat.nodes": "전체 노드",
        "dash.public.stat.online": "온라인",
        "dash.public.stat.cities": "도시 수",
        "dash.public.stat.uptime": "업타임(24h)",
        "dash.public.map": "노드 지도",
        "dash.public.map.right": "프라이버시 보호 위치 • 노드 클릭",
        "dash.public.list": "노드 목록",
        "dash.public.list.right": "검색 & 필터",
        "dash.public.search": "기기/지점/도시 검색",
        "dash.public.filter.all": "전체",
        "dash.public.filter.online": "온라인",
        "dash.public.filter.degraded": "주의",
        "dash.public.filter.offline": "오프라인",
        "dash.public.selected": "선택된 노드",
        "dash.public.none": "조건에 맞는 노드가 없습니다.",

        // Personal
        "dash.personal.kicker": "개인 대시보드",
        "dash.personal.title": "내 공기질 & 리워드",
        "dash.personal.subtitle": "내 디바이스 • 24h 인사이트 • 크레딧",

        // Credits
        "credit.title": "AirVent 크레딧(바우처)",
        "credit.balance": "잔액",
        "credit.max60": "최대 사용: 60%",
        "credit.checkout": "결제",
        "credit.product": "상품",
        "credit.product.early": "얼리버드(1대)",
        "credit.product.std": "스탠다드(1대)",
        "credit.product.list": "정가(1대)",
        "credit.product.set": "세트(3대)",
        "credit.subtotal": "소계",
        "credit.cap": "크레딧 상한(60%)",
        "credit.used": "사용 크레딧",
        "credit.due": "결제 금액",
        "credit.plan": "구독 플랜",
        "credit.plan.current": "현재 플랜",
        "credit.plan.monthly": "월 적립",
        "credit.add": "크레딧 추가",
        "credit.simulateMonth": "+1개월 시뮬",
        "credit.reset": "초기화",

        // Beta
        "beta.title": "베타: 미션 & 리퍼럴",
        "beta.desc": "미션/리퍼럴 검증 후 바우처 크레딧이 지급됩니다.",
        "beta.join": "베타 참여",
        "beta.joined": "참여됨",
        "beta.ref": "리퍼럴 코드",
        "beta.copy": "복사",
        "beta.copied": "복사 완료!",

        // Locks
        "dash.lock.title": "지갑이 필요합니다",
        "dash.lock.desc": "지갑을 연결하면 고객별 디바이스/리워드 정보를 볼 수 있습니다.",

        // Metrics
        "metric.pm25": "PM2.5 (µg/m³)",
        "metric.co2": "CO₂ (ppm)",
        "metric.tvoc": "TVOC (ppb)",
        "metric.temp": "온도 (°C)",
        "metric.humidity": "습도 (%)",
        "mine.title": "AIVT 실시간 채굴",
        "mine.status": "채굴 가동 중",
        "mine.rate": "채굴 속도",
        "mine.total": "총 채굴량",
    },
} as const;

type I18nKey = keyof typeof I18N.en;

type TFn = (key: I18nKey) => string;

function detectLang(): Lang {
    try {
        const stored = window.localStorage?.getItem("airvent_lang");
        if (stored === "en" || stored === "ko") return stored;
        const nav = window.navigator?.language?.toLowerCase() ?? "";
        if (nav.startsWith("ko")) return "ko";
    } catch {
        // ignore
    }
    return "en";
}

function makeT(lang: Lang): TFn {
    return (key: I18nKey) => {
        const raw = (I18N[lang] as any)[key] ?? (I18N.en as any)[key] ?? key;
        return String(raw);
    };
}

// -----------------------------
// Storage helpers
// -----------------------------

function detectCsvNewlineMode(): CsvNewlineMode {
    try {
        const stored = window.localStorage?.getItem("airvent_csv_newline");
        if (stored === "LF" || stored === "CRLF") return stored;
    } catch {
        // ignore
    }
    return "CRLF";
}

function setCsvNewlineMode(mode: CsvNewlineMode) {
    try {
        window.localStorage?.setItem("airvent_csv_newline", mode);
    } catch {
        // ignore
    }
}

function newlineFromMode(mode: CsvNewlineMode) {
    // Use char codes to avoid accidental editor conversion of "\n" into a real newline inside code.
    // LF=10, CR=13.
    return mode === "CRLF" ? String.fromCharCode(13, 10) : String.fromCharCode(10);
}

function usePreloadedImage(primaryUrl: string, fallbackUrl: string) {
    const [url, setUrl] = useState(primaryUrl);

    useEffect(() => {
        let cancelled = false;

        const img = new Image();
        img.onload = () => {
            if (!cancelled) setUrl(primaryUrl);
        };
        img.onerror = () => {
            if (!cancelled) setUrl(fallbackUrl);
        };

        img.src = primaryUrl;

        return () => {
            cancelled = true;
        };
    }, [primaryUrl, fallbackUrl]);

    return url;
}

function normalizeDashMode(stored: string | null | undefined): DashboardMode {
    if (stored === "public") return "public";
    if (stored === "ops" || stored === "customer") return "ops";
    if (stored === "personal") return "personal";
    return "public";
}

function detectSubPlan(): SubPlanId {
    try {
        const stored = window.localStorage?.getItem("airvent_sub_plan");
        if (stored === "free" || stored === "lite" || stored === "pro" || stored === "ops") return stored;
    } catch {
        // ignore
    }
    return "free";
}

function saveSubPlan(id: SubPlanId) {
    try {
        window.localStorage?.setItem("airvent_sub_plan", id);
    } catch {
        // ignore
    }
}

function detectCreditCents(): number {
    try {
        const raw = window.localStorage?.getItem("airvent_credit_cents");
        if (!raw) return 0;
        const n = Number(raw);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.floor(n));
    } catch {
        return 0;
    }
}

function saveCreditCents(v: number) {
    try {
        window.localStorage?.setItem("airvent_credit_cents", String(Math.max(0, Math.floor(v))));
    } catch {
        // ignore
    }
}

function detectOpsRange(): OpsRange {
    try {
        const stored = window.localStorage?.getItem("airvent_ops_range");
        if (stored === "24h" || stored === "7d") return stored;
    } catch {
        // ignore
    }
    return "24h";
}

function saveOpsRange(v: OpsRange) {
    try {
        window.localStorage?.setItem("airvent_ops_range", v);
    } catch {
        // ignore
    }
}

function detectBetaJoined(): boolean {
    try {
        return window.localStorage?.getItem("airvent_beta_joined") === "1";
    } catch {
        return false;
    }
}

function saveBetaJoined(v: boolean) {
    try {
        window.localStorage?.setItem("airvent_beta_joined", v ? "1" : "0");
    } catch {
        // ignore
    }
}

type BetaTaskId = "connect_wallet" | "add_site" | "share_badge" | "invite_friend";

type BetaTaskState = Record<BetaTaskId, boolean>;

const DEFAULT_BETA_TASKS: BetaTaskState = {
    connect_wallet: false,
    add_site: false,
    share_badge: false,
    invite_friend: false,
};

function detectBetaTasks(): BetaTaskState {
    try {
        const raw = window.localStorage?.getItem("airvent_beta_tasks");
        if (!raw) return { ...DEFAULT_BETA_TASKS };
        const parsed = JSON.parse(raw);
        const out: BetaTaskState = { ...DEFAULT_BETA_TASKS };
        (Object.keys(out) as BetaTaskId[]).forEach((k) => {
            out[k] = Boolean((parsed as any)[k]);
        });
        return out;
    } catch {
        return { ...DEFAULT_BETA_TASKS };
    }
}

function saveBetaTasks(v: BetaTaskState) {
    try {
        window.localStorage?.setItem("airvent_beta_tasks", JSON.stringify(v));
    } catch {
        // ignore
    }
}

// -----------------------------
// Types
// -----------------------------

type Site = {
    id: string;
    name: string;
    city: string;
    country?: string;
    address?: string;
    lat: number;
    lng: number;
};

type Device = {
    vendorId: string;
    deviceId: string;
    siteId: string;
    label: string;
    status: "online" | "offline" | "degraded";
    lastSeen: string;
    batteryPct?: number;
    firmware?: string;
};

type ReadingPoint = {
    t: string;
    ts: number;
    pm25: number;
    co2: number;
    tvoc: number;
    temp: number;
    humidity: number;
};

type Alert = {
    id: string;
    severity: "low" | "med" | "high";
    siteId: string;
    deviceId: string;
    metric: Metric;
    value: number;
    threshold: number;
    ts: number;
    note?: string;
};

// -----------------------------
// Data (for UI)
// -----------------------------

const mockSites: Site[] = [
    { id: "S-SEO-001", name: "AirVent HQ", city: "Seoul", country: "KR", address: "Gangnam-gu", lat: 37.5172, lng: 127.0473 },
    { id: "S-SEO-002", name: "Seoul Branch 01", city: "Seoul", country: "KR", address: "Mapo-gu", lat: 37.5636, lng: 126.9086 },
    { id: "S-BUS-001", name: "Busan Branch 01", city: "Busan", country: "KR", address: "Haeundae-gu", lat: 35.1631, lng: 129.1635 },
    { id: "S-TOK-001", name: "Tokyo Branch 01", city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503 },
    { id: "S-SIN-001", name: "Singapore Branch 01", city: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198 },
    { id: "S-SFO-001", name: "San Francisco Branch 01", city: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194 },
    { id: "S-LON-001", name: "London Branch 01", city: "London", country: "UK", lat: 51.5072, lng: -0.1276 },
];

const mockDevices: Device[] = [
    { vendorId: "AIRVENT", deviceId: "AV-0000000001", siteId: "S-SEO-001", label: "Entrance", status: "online", lastSeen: new Date(Date.now() - 2 * 60_000).toISOString(), batteryPct: 94, firmware: "1.2.3" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000002", siteId: "S-SEO-001", label: "Meeting Room", status: "online", lastSeen: new Date(Date.now() - 5 * 60_000).toISOString(), batteryPct: 89, firmware: "1.2.3" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000101", siteId: "S-SEO-002", label: "Counter", status: "degraded", lastSeen: new Date(Date.now() - 12 * 60_000).toISOString(), batteryPct: 62, firmware: "1.2.1" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000102", siteId: "S-SEO-002", label: "Back Office", status: "online", lastSeen: new Date(Date.now() - 4 * 60_000).toISOString(), batteryPct: 71, firmware: "1.2.2" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000201", siteId: "S-BUS-001", label: "Classroom A", status: "online", lastSeen: new Date(Date.now() - 3 * 60_000).toISOString(), batteryPct: 77, firmware: "1.2.2" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000202", siteId: "S-BUS-001", label: "Hallway", status: "degraded", lastSeen: new Date(Date.now() - 18 * 60_000).toISOString(), batteryPct: 48, firmware: "1.2.0" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000901", siteId: "S-TOK-001", label: "Lobby East", status: "offline", lastSeen: new Date(Date.now() - 5 * 60 * 60_000).toISOString(), batteryPct: 0, firmware: "1.1.9" },
    { vendorId: "AIRVENT", deviceId: "AV-0000000902", siteId: "S-TOK-001", label: "Lobby", status: "online", lastSeen: new Date(Date.now() - 7 * 60_000).toISOString(), batteryPct: 83, firmware: "1.2.2" },
    { vendorId: "AIRVENT", deviceId: "AV-0000001101", siteId: "S-SIN-001", label: "Reception", status: "online", lastSeen: new Date(Date.now() - 6 * 60_000).toISOString(), batteryPct: 68, firmware: "1.2.2" },
    { vendorId: "AIRVENT", deviceId: "AV-0000001102", siteId: "S-SIN-001", label: "Conference", status: "online", lastSeen: new Date(Date.now() - 9 * 60_000).toISOString(), batteryPct: 73, firmware: "1.2.3" },
    { vendorId: "AIRVENT", deviceId: "AV-0000002101", siteId: "S-SFO-001", label: "Showroom", status: "degraded", lastSeen: new Date(Date.now() - 22 * 60_000).toISOString(), batteryPct: 54, firmware: "1.2.1" },
    { vendorId: "AIRVENT", deviceId: "AV-0000003101", siteId: "S-LON-001", label: "Entrance", status: "online", lastSeen: new Date(Date.now() - 8 * 60_000).toISOString(), batteryPct: 79, firmware: "1.2.2" },
];

// -----------------------------
// Generators / Utils
// -----------------------------

function hash32(str: string) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}

function generateSeries(seed: number, points: number): ReadingPoint[] {
    const rand = mulberry32(seed);
    const out: ReadingPoint[] = [];
    const now = Date.now();
    // We want points spaced by 1h for 24h view, or 4h for 7d view?
    // Let's just do 30m intervals for simplicity.
    const interval = 30 * 60_000;

    // varied base levels
    let pm25 = 15 + rand() * 10;
    let co2 = 500 + rand() * 100;
    let tvoc = 100 + rand() * 50;
    let temp = 22 + rand() * 2;
    let humidity = 45 + rand() * 5;

    for (let i = points - 1; i >= 0; i--) {
        const ts = now - i * interval;
        // Walk
        pm25 = clamp(pm25 + (rand() - 0.5) * 5, 5, 150);
        co2 = clamp(co2 + (rand() - 0.5) * 50, 400, 2000);
        tvoc = clamp(tvoc + (rand() - 0.5) * 20, 50, 800);
        temp = clamp(temp + (rand() - 0.5) * 0.5, 18, 28);
        humidity = clamp(humidity + (rand() - 0.5) * 2, 30, 70);

        out.push({
            t: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            ts,
            pm25: Math.round(pm25),
            co2: Math.round(co2),
            tvoc: Math.round(tvoc),
            temp: Number(temp.toFixed(1)),
            humidity: Math.round(humidity),
        });
    }
    return out;
}

function scoreFromPoint(p: ReadingPoint) {
    // Simple mock formula: 100 - penalties
    let score = 100;
    if (p.pm25 > 35) score -= (p.pm25 - 35) * 0.5;
    if (p.co2 > 1000) score -= (p.co2 - 1000) * 0.05;
    if (p.tvoc > 500) score -= (p.tvoc - 500) * 0.1;
    return Math.round(clamp(score, 0, 100));
}

function timeOverThreshold(series: ReadingPoint[], metric: Metric): number {
    const THRESHOLDS: Record<Metric, number> = {
        pm25: 35,
        co2: 1000,
        tvoc: 500,
        temp: 30, // arbitrary
        humidity: 70, // arbitrary
    };
    const thr = THRESHOLDS[metric];
    const over = series.filter((p) => p[metric] > thr).length;
    return series.length === 0 ? 0 : Math.round((over / series.length) * 100);
}

function csvFromSeries(series: ReadingPoint[], newline: string): string {
    const header = ["timestamp", "pm25", "co2", "tvoc", "temp", "humidity"].join(",");
    const rows = series.map((p) => {
        return [new Date(p.ts).toISOString(), p.pm25, p.co2, p.tvoc, p.temp, p.humidity].join(",");
    });
    return [header, ...rows].join(newline);
}

function downloadText(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    if (typeof window.navigator !== "undefined" && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function queryParamsFromHref() {
    if (typeof window === "undefined") return new URLSearchParams();
    const href = window.location.href;
    const qIdx = href.indexOf("?");
    if (qIdx === -1) return new URLSearchParams();
    return new URLSearchParams(href.slice(qIdx));
}

type EmbedRoute = "badge" | null;
function detectEmbedRoute(): EmbedRoute {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash;
    if (hash.startsWith("#/badge")) return "badge";
    return null;
}

function shortAddr(addr: string) {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function makeMockSolAddress(seed: number) {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const rand = mulberry32(seed);
    let out = "";
    for (let i = 0; i < 44; i++) {
        out += chars[Math.floor(rand() * chars.length)];
    }
    return out;
}

function referralCodeFromWallet(walletAddress: string) {
    const h = hash32(walletAddress).toString(16).toUpperCase();
    // e.g. AV-1A2B3C4D
    return `AV-${h.padStart(8, "0").slice(0, 8)}`;
}

// -----------------------------
// Components
// -----------------------------

function LogoMark({ size = 18 }: { size?: number }) {
    // Brand gradient logo mark
    // Simple geometric shape resembling A/V or a leaf/wind.
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
            <defs>
                <linearGradient id="av_logo_grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={BRAND.blue} />
                    <stop offset="55%" stopColor={BRAND.indigo} />
                    <stop offset="100%" stopColor={BRAND.green} />
                </linearGradient>
            </defs>
            {/* Abstract shape: "A" with a swoosh */}
            <path d="M6 38c16-18 34-20 52-14-13 2-25 7-36 18C15 50 10 46 6 38z" fill={rgba(BRAND.indigo, 0.9)} />
            <path
                d="M18 18c9 10 19 16 40 14-12 6-22 14-34 22-6 4-13 2-18-4 6-10 9-20 12-32z"
                fill="url(#av_logo_grad)"
            />
        </svg>
    );
}

function BrandLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
    // Prioritize local image, fallback to SVG
    const [failed, setFailed] = useState(false);

    if (failed) return <LogoMark size={size} />;

    return (
        <img
            src={LOGO_LOCAL}
            alt="AirVent"
            style={{ height: size, width: "auto" }}
            className={className}
            onError={() => setFailed(true)}
        />
    );
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function DarkCard({
    title,
    right,
    children,
    className = "",
}: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">{title}</h3>
                {right}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function LightCard({
    title,
    right,
    children,
    className = "",
}: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {right}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function Button({
    className = "",
    variant = "primary",
    size = "md",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" }) {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-white text-slate-900 hover:bg-slate-100",
        secondary: "bg-white/10 text-white hover:bg-white/20",
        ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
    };
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

function LightButton({
    className = "",
    variant = "primary",
    size = "md",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" }) {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
    };
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
            {...props}
        />
    );
}

function Select({
    options,
    className = "",
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
    return (
        <div className="relative">
            <select
                className={`block w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-2 pr-8 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
                {...props}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value} className="bg-zinc-900 text-white">
                        {o.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">▼</div>
        </div>
    );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <DarkCard title={label} className="min-h-[120px]">
            <div className="text-2xl font-bold text-white md:text-3xl">{value}</div>
            {sub && <div className="mt-1 text-xs text-white/50">{sub}</div>}
        </DarkCard>
    );
}

function statusPill(status: Device["status"]) {
    switch (status) {
        case "online":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "degraded":
            return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        case "offline":
            return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
}

// -----------------------------
// Badge Embed Component (Route: #/badge)
// -----------------------------

function BadgeEmbedPage() {
    const params = useMemo(() => queryParamsFromHref(), []);
    const siteId = params.get("site") || "S-SEO-001";
    const langParam = params.get("lang");
    const lang: Lang = langParam === "ko" ? "ko" : langParam === "en" ? "en" : detectLang();
    const t = useMemo(() => makeT(lang), [lang]);

    const transparent = params.get("transparent") === "1";

    // Mock data for badge
    const score = 87; // static mock
    const latest: ReadingPoint = {
        t: "12:00",
        ts: Date.now(),
        pm25: 12,
        co2: 720,
        tvoc: 110,
        temp: 23.5,
        humidity: 45,
    };

    return (
        <div className="h-full w-full" style={{ background: transparent ? "transparent" : "white" }}>
            <div
                className="h-full w-full rounded-2xl border border-slate-200 bg-white/95 p-3"
                style={{ boxShadow: "0 8px 26px rgba(0,0,0,0.08)" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrandLogo size={24} />
                        <div className="text-xs font-bold text-slate-900">{t("badge.title")}</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-[10px] font-medium text-slate-600">Live</div>
                    </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t("badge.today")}</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900">{score}</span>
                            <span className="text-sm font-medium text-emerald-500">Good</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500">{t("badge.site")}</div>
                        <div className="text-xs font-bold text-slate-900">{siteId}</div>
                    </div>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-700">
                    {[
                        { k: "PM2.5", v: latest?.pm25 ?? "-", c: BRAND.indigo },
                        { k: "CO₂", v: latest?.co2 ?? "-", c: BRAND.blue },
                        { k: "TVOC", v: latest?.tvoc ?? "-", c: BRAND.green },
                    ].map((x) => (
                        <div key={x.k} className="rounded-xl border border-slate-200 bg-white p-2">
                            <div className="font-semibold" style={{ color: x.c }}>
                                {x.k}
                            </div>
                            <div className="font-mono">{x.v}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-3 border-t border-slate-100 pt-2 text-[9px] text-slate-400 flex justify-between">
                    <span>{t("badge.updated")}</span>
                    <a
                        href={window.location.origin}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline hover:text-slate-600"
                    >
                        Get AirVent &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
}

// -----------------------------
// Top nav
// -----------------------------

type Page = "home" | "dashboard";

function TopNav({
    page,
    setPage,
    lang,
    onToggleLang,
    t,
    walletAddress,
    onConnectWallet,
    onDisconnectWallet,
}: {
    page: Page;
    setPage: (p: Page) => void;
    lang: Lang;
    onToggleLang: () => void;
    t: TFn;
    walletAddress: string | null;
    onConnectWallet: () => void;
    onDisconnectWallet: () => void;
}) {
    const isHome = page === "home";

    return (
        <div
            className={
                isHome
                    ? "sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur"
                    : "sticky top-0 z-30 border-b border-white/10 bg-zinc-950/35 backdrop-blur"
            }
        >
            <Container>
                <div className="flex items-center justify-between py-3">
                    <button type="button" onClick={() => setPage("home")} className="flex items-center gap-3">
                        <BrandLogo size={isHome ? 40 : 36} className="shrink-0" />
                        <div className={isHome ? "hidden md:block text-xs text-slate-500" : "hidden md:block text-xs text-white/55"}>{t("nav.tagline")}</div>
                    </button>

                    <div className="flex items-center gap-1 md:gap-4">
                        <button
                            onClick={() => setPage("home")}
                            className={`px-3 py-1.5 text-sm font-medium transition ${isHome
                                ? "text-slate-900"
                                : "text-white/60 hover:text-white"
                                } ${isHome ? "" : "hidden md:block"}`}
                        >
                            {t("nav.homepage")}
                        </button>
                        <button
                            onClick={() => setPage("dashboard")}
                            className={`px-3 py-1.5 text-sm font-medium transition ${!isHome
                                ? "text-white"
                                : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            {t("nav.dashboard")}
                        </button>

                        <div className="mx-2 h-4 w-px bg-current opacity-10" />

                        <button
                            onClick={onToggleLang}
                            className={`flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase transition ${isHome ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"
                                }`}
                        >
                            <span>{lang === "en" ? "KO" : "EN"}</span>
                        </button>

                        {walletAddress ? (
                            <div className="flex items-center gap-2 rounded-full border border-current px-3 py-1.5 text-xs font-mono opacity-80" style={{ color: isHome ? BRAND.slate : "white" }}>
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                {shortAddr(walletAddress)}
                                <button
                                    onClick={onDisconnectWallet}
                                    className="ml-2 font-sans font-bold hover:underline"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onConnectWallet}
                                className={`rounded-full px-4 py-2 text-xs font-bold transition ${isHome
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "bg-white text-slate-900 hover:bg-slate-100"
                                    }`}
                            >
                                {t("wallet.connect")}
                            </button>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}

// -----------------------------
// Home Page
// -----------------------------

function HomePage({
    lang,
    t,
    onOpenDashboard,
    onJoinBeta,
    betaJoined,
}: {
    lang: Lang;
    t: TFn;
    onOpenDashboard: (mode?: DashboardMode) => void;
    onJoinBeta: () => void;
    betaJoined: boolean;
}) {
    // Preload hero
    const heroBgUrl = usePreloadedImage(HERO_BG_LOCAL, "");

    return (
        <div className="bg-white pb-20">
            {/* Hero */}
            <div className="relative overflow-hidden bg-slate-50">
                <Container className="relative pt-12 md:pt-20 lg:pt-28">
                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600 shadow-sm md:text-xs">
                            {t("hero.pill")}
                        </div>
                        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                            {t("hero.title")}
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                            {t("hero.desc")}
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <LightButton
                                variant="primary"
                                className="h-12 w-full px-8 text-base shadow-xl shadow-indigo-500/20 sm:w-auto"
                                onClick={() => onOpenDashboard("ops")}
                            >
                                {t("hero.cta.buy")}
                            </LightButton>
                            <LightButton
                                variant="secondary"
                                className="h-12 w-full px-8 text-base sm:w-auto"
                                onClick={() => onOpenDashboard("public")}
                            >
                                {t("hero.cta.dashboard")}
                            </LightButton>
                        </div>
                        <div className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">
                            {t("hero.cta.pilot")}
                        </div>
                    </div>

                    <div className="mt-16 md:mt-24">
                        <div className="relative mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
                            <div
                                className="aspect-[16/9] w-full rounded-2xl bg-slate-100 relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${heroBgUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        opacity: 0.22,
                                        filter: "saturate(0.95)",
                                    }}
                                />
                                <div className="absolute inset-0 bg-white/88 backdrop-blur-sm" />
                                <div className="relative p-6 md:p-8">
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
                                        <div className="md:col-span-7">
                                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                                                <span className="h-px w-8 bg-indigo-600"></span>
                                                {t("cmp.kicker")}
                                            </div>
                                            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">
                                                {t("cmp.title")}
                                            </h2>
                                            <p className="mt-4 text-slate-600">{t("cmp.desc")}</p>

                                            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 text-slate-500">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">{t("cmp.col.cap")}</th>
                                                            <th className="px-4 py-3 font-semibold">{t("cmp.col.trad")}</th>
                                                            <th className="px-4 py-3 font-semibold text-indigo-700">{t("cmp.col.av")}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-slate-900">Rank/Score</td>
                                                            <td className="px-4 py-3 text-slate-500">-</td>
                                                            <td className="px-4 py-3 font-bold text-indigo-600">Yes</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-slate-900">Alerts</td>
                                                            <td className="px-4 py-3 text-slate-500">Local-only</td>
                                                            <td className="px-4 py-3 font-bold text-indigo-600">Cloud/SMS</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-slate-900">Reports</td>
                                                            <td className="px-4 py-3 text-slate-500">Manual CSV</td>
                                                            <td className="px-4 py-3 font-bold text-indigo-600">Auto-generated</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-slate-900">Cost</td>
                                                            <td className="px-4 py-3 text-slate-500">Capex</td>
                                                            <td className="px-4 py-3 font-bold text-indigo-600">Sub-to-Own</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="md:col-span-5">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <BrandLogo size={24} />
                                                    <span className="font-bold text-slate-900">AirVent Demo</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <LightButton
                                                        variant="primary"
                                                        className="w-full justify-between"
                                                        onClick={() => onOpenDashboard("ops")}
                                                    >
                                                        <span>{t("dash.mode.ops")}</span>
                                                        <span>&rarr;</span>
                                                    </LightButton>
                                                    <LightButton
                                                        variant="secondary"
                                                        className="w-full justify-between"
                                                        onClick={() => onOpenDashboard("personal")}
                                                    >
                                                        <span>{t("dash.mode.personal")}</span>
                                                        <span>&rarr;</span>
                                                    </LightButton>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <LightCard
                                                    title={lang === "ko" ? "무료로 시작" : "Start Free"}
                                                    right={<span className="text-xs text-slate-500">{lang === "ko" ? "전환용 핵심" : "Conversion lever"}</span>}
                                                >
                                                    <div className="text-sm text-slate-700">
                                                        {lang === "ko"
                                                            ? "7일 운영 리포트로 ‘관리되고 있다’는 신뢰를 먼저 보여주고, 이후 구독→크레딧으로 구매 장벽을 낮춥니다."
                                                            : "Show trust first with a 7-day ops report, then reduce purchase friction via subscription-to-credits."}
                                                    </div>
                                                    <div className="mt-3">
                                                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                            {t("sub.cta.7d")}
                                                        </span>
                                                    </div>
                                                </LightCard>

                                                <LightCard
                                                    title={lang === "ko" ? "베타 미션" : "Beta Missions"}
                                                    right={<span className="text-xs text-slate-500">{lang === "ko" ? "리워드 지급" : "Rewards"}</span>}
                                                >
                                                    <div className="text-sm text-slate-700">
                                                        {lang === "ko"
                                                            ? "지갑 연결, 첫 사이트 등록 시 검증 후 바우처 크레딧을 지급합니다."
                                                            : "Connect wallet & register first site to earn verified voucher credits."}
                                                    </div>
                                                    <div className="mt-2 text-xs text-slate-500">{t("sub.beta.note")}</div>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <LightButton variant={betaJoined ? "secondary" : "primary"} size="sm" onClick={onJoinBeta}>
                                                            {betaJoined ? (lang === "ko" ? "베타 보기" : "View Beta") : t("beta.join")}
                                                        </LightButton>
                                                        <LightButton variant="ghost" size="sm" onClick={() => onOpenDashboard("personal")}>
                                                            {lang === "ko" ? "개인 대시보드" : "Personal"}
                                                        </LightButton>
                                                    </div>
                                                </LightCard>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>

                {/* Features / Product Section */}
                <Container className="py-24">
                    <div className="flex flex-col gap-16">

                        {/* Badge Feature */}
                        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
                            <div>
                                <div className="text-sm font-bold text-indigo-600">{t("badge.title")}</div>
                                <h3 className="mt-2 text-3xl font-bold text-slate-900">{t("hero.pill").split("•")[2] || "Shareable Air Badge"}</h3>
                                <p className="mt-4 text-lg text-slate-600">
                                    {t("dash.badge.desc")}
                                </p>
                                <div className="mt-8">
                                    <LightButton variant="secondary" onClick={() => {
                                        // Open badge in new window
                                        window.open(`${window.location.origin}/#/badge`, "_blank");
                                    }}>
                                        {t("dash.badge.preview")} &rarr;
                                    </LightButton>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-8 shadow-inner">
                                {/* Mock Badge visual */}
                                <div className="mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <LogoMark size={24} />
                                        <span className="font-bold text-slate-900">Gangnam HQ</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-500">Score</div>
                                            <div className="text-4xl font-black text-slate-900">87</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-emerald-500">Good</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                                            <div className="text-slate-500">PM2.5</div>
                                            <div className="mt-0.5 font-semibold text-slate-900">12</div>
                                            <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: BRAND.indigo, opacity: 0.35 }} />
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                                            <div className="text-slate-500">CO₂</div>
                                            <div className="mt-0.5 font-semibold text-slate-900">720</div>
                                            <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: BRAND.blue, opacity: 0.35 }} />
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white p-2">
                                            <div className="text-slate-500">TVOC</div>
                                            <div className="mt-0.5 font-semibold text-slate-900">110</div>
                                            <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: BRAND.green, opacity: 0.35 }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub-to-Own Feature */}
                        <div className="rounded-3xl bg-slate-900 px-6 py-16 text-center shadow-2xl md:px-12">
                            <h2 className="text-3xl font-black text-white md:text-4xl">{t("sub.title")}</h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">{t("sub.desc")}</p>

                            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 text-left">
                                {[
                                    SUB_PLANS[0], // Free
                                    SUB_PLANS[2], // Pro
                                    SUB_PLANS[3], // Ops
                                ].map((p) => (
                                    <div key={p.id} className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
                                        <div className="text-sm font-bold text-indigo-400">{lang === "ko" ? p.nameKo : p.nameEn}</div>
                                        <div className="mt-2 text-3xl font-bold text-white">{formatUsd(p.priceCentsPerMonth)}<span className="text-sm font-normal text-white/50">/mo</span></div>
                                        <div className="mt-1 text-sm text-emerald-400">
                                            +{formatUsd(p.creditsCentsPerMonth)} {t("credit.plan.monthly")}
                                        </div>
                                        <ul className="mt-6 space-y-3">
                                            {(lang === "ko" ? p.perksKo : p.perksEn).map(pk => (
                                                <li key={pk} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <span className="mt-0.5 text-indigo-400">✓</span>
                                                    {pk}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12">
                                <div className="text-sm text-slate-400 max-w-2xl mx-auto border-t border-white/10 pt-6">
                                    {t("sub.policy")}
                                </div>
                            </div>
                        </div>

                        {/* Pricing / Rewards */}
                        <div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-indigo-600">{t("rewards.kicker")}</div>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900">{t("rewards.title")}</h2>
                                <p className="mt-4 text-slate-600">{t("rewards.note")}</p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                {[
                                    { name: lang === "ko" ? "Early Bird" : "Early Bird", price: COMMERCE.earlyBirdCents, desc: lang === "ko" ? "초기 구매자 혜택" : "Genesis allocation" },
                                    { name: lang === "ko" ? "Standard" : "Standard", price: COMMERCE.standardCents, desc: lang === "ko" ? "기본 구성" : "Standard package" },
                                    { name: lang === "ko" ? "Set (3)" : "Set (3)", price: COMMERCE.set3Cents, desc: lang === "ko" ? "3대 세트" : "3-unit bundle" },
                                    { name: lang === "ko" ? "List" : "List", price: COMMERCE.listPriceCents, desc: lang === "ko" ? "정가" : "List price" },
                                ].map((p) => (
                                    <LightCard
                                        key={p.name}
                                        title={p.name}
                                        right={<span className="text-sm font-extrabold text-slate-900">{formatUsd(p.price)}</span>}
                                    >
                                        <div className="text-sm text-slate-600">{p.desc}</div>
                                        <div className="mt-3 text-xs text-slate-500">PM1.0/2.5/10 • CO₂ • TVOC</div>
                                    </LightCard>
                                ))}
                            </div>

                            <div className="mt-8 rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
                                {t("rewards.creditNote")}
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="mx-auto max-w-3xl">
                            <div className="text-sm font-bold text-indigo-600">{t("faq.kicker")}</div>
                            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{t("faq.title")}</h2>

                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <LightCard title={lang === "ko" ? "어떤 KPI를 보면 좋나요?" : "What KPI should we track?"}>
                                    <div className="text-sm text-slate-700">
                                        {lang === "ko"
                                            ? "초기에는 ‘임계치 초과 비율(24h/7d)’이 가장 좋습니다. 환기/필터링 같은 실행 행동으로 바로 연결되어 설득력이 큽니다."
                                            : "Start with Time-over-threshold (24h/7d). It translates directly into actions like ventilation and filtration."}
                                    </div>
                                </LightCard>
                                <LightCard title={lang === "ko" ? "데이터를 내보낼 수 있나요?" : "Can we export data?"}>
                                    <div className="text-sm text-slate-700">
                                        {lang === "ko" ? "네. 운영/개인 대시보드에서 CSV를 내보낼 수 있습니다." : "Yes. Operations/Personal dashboards can export CSV."}
                                    </div>
                                </LightCard>
                            </div>

                            <div className="mt-10 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6">
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">AirVent • {WEB3.chain} DePIN</div>
                                    <div className="mt-1 text-sm text-slate-600">Version {APP_VERSION}</div>
                                </div>
                                <div className="text-xs text-slate-500">{lang === "ko" ? WEB3.disclaimerKO : WEB3.disclaimerEN}</div>
                            </div>
                        </div>

                    </div >
                </Container >
            </div>
        </div>
    );
}

// -----------------------------
// Dashboard Components
// -----------------------------

function SimpleAreaChart({ data, dataKey }: { data: ReadingPoint[]; dataKey: Metric }) {
    const w = 560;
    const h = 260;
    const pad = 18;

    const values = data.map((d) => Number((d as any)[dataKey]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - ((d as any)[dataKey] - min) / range) * (h - pad * 2);
        return { x, y };
    });

    const path = points
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");

    const area = `${path} L${(w - pad).toFixed(2)} ${h.toFixed(2)} L${pad} ${h} Z`;

    // color from key
    const color = metricColor(dataKey);

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
            <defs>
                <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                    key={t}
                    x1={pad}
                    y1={pad + t * (h - pad * 2)}
                    x2={w - pad}
                    y2={pad + t * (h - pad * 2)}
                    stroke="rgba(255,255,255,0.1)"
                    strokeDasharray="4 4"
                />
            ))}
            <path d={area} fill={`url(#grad_${dataKey})`} />
            <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </svg>
    );
}

function PublicExplorerView({ lang, t, mode, onChangeMode }: { lang: Lang; t: TFn; mode: DashboardMode; onChangeMode: (v: DashboardMode) => void }) {
    const [selectedNode, setSelectedNode] = useState<Site | null>(null);
    const [filter, setFilter] = useState<"all" | "online" | "degraded" | "offline">("all");

    const nodes = mockSites;

    // Mock filter logic
    const filtered = nodes.filter(n => {
        // randomly assign statuses for demo since site != device 1:1 in this mock
        // Just a stub
        return true;
    });

    return (
        <Container className="pb-20 pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {t("dash.public.kicker")}
                    </div>
                    <h2 className="mt-1 text-3xl font-bold text-white">{t("dash.public.title")}</h2>
                    <p className="text-white/60">{t("dash.public.subtitle")}</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(["public", "ops", "personal"] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => onChangeMode(m)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${mode === m ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                                }`}
                        >
                            {t(`dash.mode.${m}` as any)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat label={t("dash.public.stat.nodes")} value="1,240" sub="+12 today" />
                <Stat label={t("dash.public.stat.online")} value="98.2%" sub="Active" />
                <Stat label={t("dash.public.stat.cities")} value="42" sub="Global" />
                <Stat label={t("dash.public.stat.uptime")} value="99.9%" sub="Network avg" />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Map (Mock) */}
                <div className="lg:col-span-2 min-h-[400px] rounded-3xl border border-white/10 bg-zinc-900 relative overflow-hidden group">
                    <div className="absolute inset-0 z-0 opacity-40"
                        style={{
                            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
                        }}
                    />
                    <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start z-10">
                        <h3 className="text-lg font-bold text-white">{t("dash.public.map")}</h3>
                        <div className="text-xs text-white/40">{t("dash.public.map.right")}</div>
                    </div>

                    {/* Mock Map Dots */}
                    <div className="absolute inset-0 mt-16 p-4">
                        {mockSites.map((s, i) => (
                            <div
                                key={s.id}
                                className="absolute h-3 w-3 rounded-full bg-indigo-500 hover:scale-150 transition cursor-pointer box-content border-2 border-zinc-900 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                                style={{
                                    top: `${20 + (Math.abs(s.lat * 123) % 60)}%`,
                                    left: `${10 + (Math.abs(s.lng * 456) % 80)}%`,
                                    transitionDelay: `${i * 50}ms`
                                }}
                                title={s.name}
                                onClick={() => setSelectedNode(s)}
                            />
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="rounded-3xl border border-white/10 bg-white/5 flex flex-col h-[500px]">
                    <div className="p-5 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white">{t("dash.public.list")}</h3>
                        <div className="mt-3">
                            <Input placeholder={t("dash.public.search")} className="text-xs" />
                        </div>
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {(["all", "online", "degraded", "offline"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border transition ${filter === f ? "bg-white text-black border-white" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                                        }`}
                                >
                                    {t(`dash.public.filter.${f}` as any)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {mockSites.map(s => (
                            <div key={s.id}
                                onClick={() => setSelectedNode(s)}
                                className={`p-3 rounded-xl border border-transparent transition cursor-pointer ${selectedNode?.id === s.id ? "bg-indigo-500/20 border-indigo-500/50" : "hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-white">{s.name}</div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]"></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-white/40">
                                    <span>{s.city}, {s.country}</span>
                                    <span className="font-mono">{s.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedNode && (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-900/10 p-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-sm font-bold text-emerald-300">{t("dash.public.selected")}: {selectedNode.name}</div>
                    </div>
                </div>
            )}

        </Container>
    );
}

function OperationsDashboard({
    lang,
    t,
    mode,
    onChangeMode,
    opsRange,
    setOpsRangeState,
    csvNewlineMode,
    setCsvNewlineModeState,
    creditCents,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
    opsRange: OpsRange;
    setOpsRangeState: (r: OpsRange) => void;
    csvNewlineMode: CsvNewlineMode;
    setCsvNewlineModeState: (m: CsvNewlineMode) => void;
    creditCents: number;
}) {
    // Generate mock data on fly
    const series = useMemo(() => generateSeries(12345, opsRange === "24h" ? 48 : 42), [opsRange]); // 30m intervals
    const alerts: Alert[] = [
        {
            id: "AL-101",
            severity: "high",
            siteId: "S-SEO-001",
            deviceId: "AV-0000000001",
            metric: "co2",
            value: 1250,
            threshold: 1000,
            ts: Date.now() - 15 * 60_000,
            note: "Meeting Room overcrowded",
        },
        {
            id: "AL-102",
            severity: "med",
            siteId: "S-BUS-001",
            deviceId: "AV-0000000202",
            metric: "pm25",
            value: 42,
            threshold: 35,
            ts: Date.now() - 45 * 60_000,
        },
    ];

    const onExport = () => {
        const csv = csvFromSeries(series, newlineFromMode(csvNewlineMode));
        downloadText(`airvent_ops_${opsRange}_${Date.now()}.csv`, csv);
    };

    const [copied, setCopied] = useState(false);
    const onCopyBadge = async () => {
        const code = `<iframe src="${window.location.origin}/#/badge?site=S-SEO-001&lang=${lang}" width="300" height="200" style="border:none;"></iframe>`;
        if (await copyToClipboard(code)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Container className="pb-20 pt-8">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                        {t("dash.kicker")}
                    </div>
                    <div className="flex items-center gap-4">
                        <h2 className="mt-1 text-3xl font-bold text-white">{t("dash.title")}</h2>
                        {/* Range Toggle */}
                        <div className="flex bg-white/10 rounded-lg p-0.5 mt-1">
                            {(["24h", "7d"] as const).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setOpsRangeState(r)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${opsRange === r ? "bg-indigo-500 text-white shadow" : "text-white/60 hover:text-white"
                                        }`}
                                >
                                    {t(`dash.range.${r}` as any)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-white/60">{t("dash.subtitle")}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {(["public", "ops", "personal"] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => onChangeMode(m)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${mode === m ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                {t(`dash.mode.${m}` as any)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60">
                            <span>CSV Newline:</span>
                            <button className={csvNewlineMode === "LF" ? "text-white font-bold" : "hover:text-white"} onClick={() => setCsvNewlineModeState("LF")}>LF</button>
                            <span className="opacity-20">|</span>
                            <button className={csvNewlineMode === "CRLF" ? "text-white font-bold" : "hover:text-white"} onClick={() => setCsvNewlineModeState("CRLF")}>CRLF</button>
                        </div>
                        <Button onClick={onExport} size="sm" variant="secondary" className="gap-2">
                            <span>{t("dash.export")}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat label={t("dash.stat.score")} value="87" sub="S-SEO-001 (Avg)" />
                <Stat label={t("dash.stat.tot")} value={`${timeOverThreshold(series, 'co2')}%`} sub={`CO2 > 1000 (${opsRange})`} />
                <Stat label={t("dash.stat.alerts")} value={alerts.length} sub="Active" />
                <Stat label={t("dash.stat.credit")} value={formatUsd(creditCents)} sub={t("rewards.creditNote")} />
            </div>

            {/* Main Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <DarkCard title={`${t("dash.trend")} (PM2.5)`} className="h-64">
                        <SimpleAreaChart data={series} dataKey="pm25" />
                    </DarkCard>
                    <DarkCard title={`${t("dash.trend")} (CO2)`} className="h-64">
                        <SimpleAreaChart data={series} dataKey="co2" />
                    </DarkCard>
                </div>

                <div className="space-y-6">
                    {/* Alerts Feed */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 min-h-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">{t("dash.alerts")}</h3>
                            <span className="text-xs font-mono text-white/40">{alerts.length}</span>
                        </div>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="text-center text-sm text-white/30 py-8">{t("dash.alerts.none")}</div>
                            ) : (
                                alerts.map(a => (
                                    <div key={a.id} className="relative rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs font-bold text-rose-300">
                                                {a.metric.toUpperCase()} &gt; {a.threshold}
                                            </div>
                                            <div className="text-[10px] text-rose-300/60 font-mono">
                                                {new Date(a.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="mt-1 text-xs text-white/80">{a.note || `${a.value} recorded at ${a.deviceId}`}</div>
                                        <div className="mt-2 text-[10px] uppercase font-bold tracking-wide text-rose-400">{a.severity} Priority</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Badge Embed Helper */}
                    <DarkCard title={t("dash.badge")} className="border-indigo-500/30">
                        <p className="text-xs text-white/60 leading-relaxed mb-4">{t("dash.badge.desc")}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" className="flex-1" onClick={onCopyBadge}>
                                {copied ? t("dash.badge.copied") : t("dash.badge.copy")}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => window.open(`#/badge?site=S-SEO-001&lang=${lang}`, "_blank")}>
                                {t("dash.badge.preview")}
                            </Button>
                        </div>
                    </DarkCard>
                </div>
            </div>

        </Container>
    );
}

function PersonalDashboard({
    lang,
    t,
    mode,
    onChangeMode,
    walletAddress,
    creditCents,
    setCreditCentsState,
    subPlan,
    setSubPlanState,
    csvNewlineMode,
    betaJoined,
    onJoinBeta,
    betaTasks,
    setBetaTasksState,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
    walletAddress: string | null;
    creditCents: number;
    setCreditCentsState: (c: number) => void;
    subPlan: SubPlanId;
    setSubPlanState: (p: SubPlanId) => void;
    csvNewlineMode: CsvNewlineMode;
    betaJoined: boolean;
    onJoinBeta: () => void;
    betaTasks: BetaTaskState;
    setBetaTasksState: (s: BetaTaskState) => void;
}) {
    if (!walletAddress) {
        return (
            <Container className="pt-20">
                <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-white">{t("dash.lock.title")}</h2>
                    <p className="mt-2 text-slate-400">{t("dash.lock.desc")}</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={() => onChangeMode("public")}>
                            &larr; {t("dash.mode.public")}
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    // Mining Logic
    const miningRate = AIVT_MINING_RATES[subPlan];
    const [minedTotal, setMinedTotal] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMinedTotal((prev: number) => prev + miningRate / 10); // Update every 100ms
        }, 100);
        return () => clearInterval(interval);
    }, [miningRate]);

    // Credit calculation logic
    const cartSubtotal = 49900; // Example cart
    const { capCents, usedCents, dueCents } = applyCreditsToSubtotal({ subtotalCents: cartSubtotal, creditBalanceCents: creditCents });

    const refCode = referralCodeFromWallet(walletAddress);

    const toggleTask = (k: BetaTaskId) => {
        const next = { ...betaTasks, [k]: !betaTasks[k] };
        setBetaTasksState(next);
        // Mock credit reward for completing task
        if (!betaTasks[k] && next[k]) {
            setCreditCentsState(creditCents + 500); // +$5 reward
        }
    };

    const plan = planById(subPlan);

    return (
        <Container className="pb-20 pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                        {t("dash.personal.kicker")}
                    </div>
                    <h2 className="mt-1 text-3xl font-bold text-white">{t("dash.personal.title")}</h2>
                    <p className="text-white/60">{t("dash.personal.subtitle")}</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(["public", "ops", "personal"] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => onChangeMode(m)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${mode === m ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                                }`}
                        >
                            {t(`dash.mode.${m}` as any)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Left Column: Mining & Credits */}
                <div className="space-y-6">
                    {/* Real-time Mining Card */}
                    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-900 p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                                <span className="flex h-1.5 w-1.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">{t("mine.status")}</span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest opacity-80">{t("mine.title")}</div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <div className="text-5xl font-black text-white font-mono tracking-tighter tabular-nums">
                                    {minedTotal.toFixed(6)}
                                </div>
                                <div className="text-xl font-bold text-emerald-500">AIVT</div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                <div>
                                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">{t("mine.rate")}</div>
                                    <div className="mt-0.5 text-sm font-bold text-white">+{miningRate.toFixed(5)} <span className="text-[10px] opacity-40 font-normal">/sec</span></div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">{t("mine.total")}</div>
                                    <div className="mt-0.5 text-sm font-bold text-emerald-400">LIVE</div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative glow */}
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-0 left-0 h-20 w-20 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    </div>

                    {/* Credits / Subscription */}
                    <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest opacity-80">{t("credit.title")}</div>
                                <div className="mt-2 text-4xl font-black text-white">{formatUsd(creditCents)}</div>
                                <div className="mt-1 text-xs text-indigo-200/60">{t("credit.max60")}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">{t("credit.plan.current")}</div>
                                <div className="mt-0.5 font-bold text-white">{lang === "ko" ? plan.nameKo : plan.nameEn}</div>
                                <div className="mt-3">
                                    <select
                                        className="bg-black/40 text-[10px] font-bold text-white px-2 py-1 rounded-lg border border-white/10 outline-none hover:border-indigo-500/50 transition cursor-pointer appearance-none"
                                        value={subPlan}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubPlanState(e.target.value as SubPlanId)}
                                    >
                                        {SUB_PLANS.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{lang === "ko" ? p.nameKo : p.nameEn}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Simulator */}
                        <div className="mt-8 rounded-2xl bg-black/30 p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t("credit.checkout")} (Sim)</div>
                                <button onClick={() => setCreditCentsState(0)} className="text-[10px] font-bold text-indigo-400 hover:text-white transition uppercase tracking-wider">{t("credit.reset")}</button>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-white/50">
                                    <span>{t("credit.product")} (List)</span>
                                    <span>{formatUsd(cartSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>{t("credit.used")}</span>
                                    <span className="text-emerald-400">-{formatUsd(usedCents)}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/10 flex justify-between font-bold text-white text-sm">
                                    <span>{t("credit.due")}</span>
                                    <span className="text-indigo-400">{formatUsd(dueCents)}</span>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/5 flex justify-center">
                                <button
                                    onClick={() => setCreditCentsState(creditCents + plan.creditsCentsPerMonth)}
                                    className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-indigo-400 hover:text-white transition group"
                                >
                                    <span className="group-hover:scale-110 transition-transform">📅</span> {t("credit.simulateMonth")} ({formatUsd(plan.creditsCentsPerMonth)})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Beta Section */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">{t("beta.title")}</h3>
                            {betaJoined ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">{t("beta.joined")}</span>
                            ) : (
                                <Button size="sm" onClick={onJoinBeta} className="rounded-full shadow-lg shadow-indigo-500/20">{t("beta.join")}</Button>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-white/50 leading-relaxed">{t("beta.desc")}</p>

                        {betaJoined && (
                            <div className="mt-8 space-y-6">
                                {/* Referral */}
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{t("beta.ref")}</div>
                                    <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl font-mono text-xs text-indigo-400 border border-indigo-500/10 select-all group cursor-pointer hover:border-indigo-500/30 transition">
                                        <span className="tracking-widest">{refCode}</span>
                                        <button
                                            onClick={() => copyToClipboard(refCode)}
                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-300/40 group-hover:text-indigo-300 transition"
                                        >
                                            {t("beta.copy")}
                                        </button>
                                    </div>
                                </div>

                                {/* Missions Checklist */}
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Active Missions</div>
                                    {(Object.keys(DEFAULT_BETA_TASKS) as BetaTaskId[]).map(k => (
                                        <div key={k}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${betaTasks[k] ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5 hover:bg-white/10 group"
                                                }`}
                                            onClick={() => toggleTask(k)}
                                        >
                                            <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${betaTasks[k] ? "bg-emerald-500 border-emerald-500" : "border-white/10 group-hover:border-white/30"
                                                }`}>
                                                {betaTasks[k] && <span className="text-black text-xs font-black">✓</span>}
                                            </div>
                                            <div className={`text-sm font-medium transition-opacity ${betaTasks[k] ? "text-white/40 line-through" : "text-white"}`}>
                                                {k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                            </div>
                                            {betaTasks[k] && <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-emerald-400/60">+Credits</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </Container>
    );
}

function DashboardPage({
    lang,
    t,
    mode,
    onChangeMode,
    walletAddress,
    csvNewlineMode,
    setCsvNewlineModeState,
    creditCents,
    setCreditCentsState,
    subPlan,
    setSubPlanState,
    opsRange,
    setOpsRangeState,
    betaJoined,
    onJoinBeta,
    betaTasks,
    setBetaTasksState,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
    walletAddress: string | null;
    csvNewlineMode: CsvNewlineMode;
    setCsvNewlineModeState: (m: CsvNewlineMode) => void;
    creditCents: number;
    setCreditCentsState: (c: number) => void;
    subPlan: SubPlanId;
    setSubPlanState: (p: SubPlanId) => void;
    opsRange: OpsRange;
    setOpsRangeState: (r: OpsRange) => void;
    betaJoined: boolean;
    onJoinBeta: () => void;
    betaTasks: BetaTaskState;
    setBetaTasksState: (s: BetaTaskState) => void;
}) {
    return (
        <div className="min-h-screen bg-zinc-950">
            {mode === "public" ? (
                <PublicExplorerView lang={lang} t={t} mode={mode} onChangeMode={onChangeMode} />
            ) : mode === "ops" ? (
                <OperationsDashboard
                    lang={lang}
                    t={t}
                    mode={mode}
                    onChangeMode={onChangeMode}
                    opsRange={opsRange}
                    setOpsRangeState={setOpsRangeState}
                    csvNewlineMode={csvNewlineMode}
                    setCsvNewlineModeState={setCsvNewlineModeState}
                    creditCents={creditCents}
                />
            ) : (
                <PersonalDashboard
                    lang={lang}
                    t={t}
                    mode={mode}
                    onChangeMode={onChangeMode}
                    walletAddress={walletAddress}
                    creditCents={creditCents}
                    setCreditCentsState={setCreditCentsState}
                    subPlan={subPlan}
                    setSubPlanState={setSubPlanState}
                    csvNewlineMode={csvNewlineMode}
                    betaJoined={betaJoined}
                    onJoinBeta={onJoinBeta}
                    betaTasks={betaTasks}
                    setBetaTasksState={setBetaTasksState}
                />
            )}

            {/* Dashboard Footer */}
            <div className="border-t border-white/10 bg-black/20 py-8">
                <Container>
                    <div className="flex justify-between items-center text-xs text-white/30">
                        <div>AirVent {APP_VERSION} • {WEB3.chain} Beta</div>
                        <div className="flex gap-4">
                            <span>Terms</span>
                            <span>Privacy</span>
                            <span>Docs</span>
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}

// -----------------------------
// App Root
// -----------------------------

/**
 * Debug API exposed on window.__airvent
 */
function exposeDebugApi(api: any) {
    if (typeof window !== "undefined") {
        (window as any).__airvent = api;
    }
}

export default function App() {
    const [lang, setLang] = useState<Lang>(detectLang());
    const [page, setPage] = useState<Page>("home");

    // Global State (persisted)
    const [walletAddress, setWalletAddress] = useState<string | null>(null); // mock wallet
    const [mode, setMode] = useState<DashboardMode>(() => normalizeDashMode(window.localStorage?.getItem("airvent_mode")));
    const [csvNewlineMode, setCsvNewlineModeState] = useState<CsvNewlineMode>(detectCsvNewlineMode());
    const [creditCents, setCreditCentsState] = useState<number>(detectCreditCents());
    const [subPlan, setSubPlanState] = useState<SubPlanId>(detectSubPlan());
    const [opsRange, setOpsRangeState] = useState<OpsRange>(detectOpsRange());
    const [betaJoined, setBetaJoined] = useState<boolean>(detectBetaJoined());
    const [betaTasks, setBetaTasksState] = useState<BetaTaskState>(detectBetaTasks());

    // Listeners to save Persistence
    useEffect(() => {
        try {
            window.localStorage?.setItem("airvent_lang", lang);
        } catch { }
    }, [lang]);

    const changeMode = (m: DashboardMode) => {
        setMode(m);
        try {
            window.localStorage?.setItem("airvent_mode", m);
        } catch { }
        if (page !== "dashboard") setPage("dashboard");
        window.scrollTo(0, 0);
    };

    const saveCsvNewline = (m: CsvNewlineMode) => {
        setCsvNewlineModeState(m);
        setCsvNewlineMode(m);
    };

    const saveCredit = (c: number) => {
        setCreditCentsState(c);
        saveCreditCents(c);
    };

    const saveSub = (p: SubPlanId) => {
        setSubPlanState(p);
        saveSubPlan(p);
    };

    const saveRange = (r: OpsRange) => {
        setOpsRangeState(r);
        saveOpsRange(r);
    };

    const saveBeta = (b: boolean) => {
        setBetaJoined(b);
        saveBetaJoined(b);
    };

    const saveTasks = (t: BetaTaskState) => {
        setBetaTasksState(t);
        saveBetaTasks(t);
    };

    // Wallet Mock
    const connectWallet = () => {
        // Simulate wallet connection
        const mockAddr = makeMockSolAddress(Date.now());
        setWalletAddress(mockAddr);
        // Auto-check beta task if joined
        if (betaJoined && !betaTasks.connect_wallet) {
            saveTasks({ ...betaTasks, connect_wallet: true });
            saveCredit(creditCents + 100); // Small bonus
        }
    };
    const disconnectWallet = () => setWalletAddress(null);

    const t = useMemo(() => makeT(lang), [lang]);

    // Route Check
    const embedRoute = useMemo(() => detectEmbedRoute(), []);

    // Expose Debug API
    useEffect(() => {
        exposeDebugApi({
            setCredit: saveCredit,
            setSub: saveSub,
            reset: () => {
                window.localStorage.clear();
                window.location.reload();
            }
        });
    });

    // Render Logic
    if (embedRoute === "badge") {
        return <BadgeEmbedPage />;
    }

    return (
        <div className="font-sans text-slate-900 antialiased selection:bg-indigo-500/30">
            <TopNav
                page={page}
                setPage={(p) => {
                    setPage(p);
                    window.scrollTo(0, 0);
                }}
                lang={lang}
                onToggleLang={() => setLang(lang === "en" ? "ko" : "en")}
                t={t}
                walletAddress={walletAddress}
                onConnectWallet={connectWallet}
                onDisconnectWallet={disconnectWallet}
            />

            <main>
                {page === "home" ? (
                    <HomePage
                        lang={lang}
                        t={t}
                        onOpenDashboard={(m) => changeMode(m || "public")}
                        onJoinBeta={() => {
                            saveBeta(true);
                            changeMode("personal");
                        }}
                        betaJoined={betaJoined}
                    />
                ) : (
                    <DashboardPage
                        lang={lang}
                        t={t}
                        mode={mode}
                        onChangeMode={changeMode}
                        walletAddress={walletAddress}
                        csvNewlineMode={csvNewlineMode}
                        setCsvNewlineModeState={saveCsvNewline}
                        creditCents={creditCents}
                        setCreditCentsState={saveCredit}
                        subPlan={subPlan}
                        setSubPlanState={saveSub}
                        opsRange={opsRange}
                        setOpsRangeState={saveRange}
                        betaJoined={betaJoined}
                        onJoinBeta={() => saveBeta(true)}
                        betaTasks={betaTasks}
                        setBetaTasksState={saveTasks}
                    />
                )}
            </main>
        </div>
    );
}
