import React, { useEffect, useMemo, useState } from "react";

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
// URL : /hero-airvent-device.png

// 권장(안정적) 방식: 리포지토리 public 폴더에 파일을 두고 절대경로로 참조
// 파일 위치: public/hero-airvent-device.png
// 참조 경로: /hero-airvent-device.png
const HERO_BG_LOCAL = "/hero-airvent-device.png";

// -----------------------------
// Brand palette
// -----------------------------

const BRAND = {
    blue: "#3266A3",
    indigo: "#2A2344",
    green: "#30933F",
    ink: "#0B1020",
    surface: "#F6F9FF",
} as const;

const WEB3 = {
    chain: "Solana",
    token: "AIVT",
    disclaimerEN:
        "Rewards and eligibility are subject to terms & policies. Network stats and locations may be privacy-preserved (approximate).",
    disclaimerKO:
        "리워드 및 혜택 제공은 약관/정책에 따릅니다. 네트워크 통계/위치는 프라이버시 보호를 위해 근사치로 표시될 수 있습니다.",
} as const;

// -----------------------------
// Commerce / Credits
// -----------------------------

const COMMERCE = {
    currency: "USD",
    listPriceCents: 49900, // $499
    earlyBirdCents: 34900, // $349
    standardCents: 39900, // $399
    set3Cents: 99000, // $990
    maxCreditRatio: 0.6, // up to 60% of subtotal
    creditSymbol: "AVC", // AirVent Credits (voucher)
} as const;

type CsvNewlineMode = "CRLF" | "LF";

type DashboardMode = "public" | "ops" | "personal";

type OpsRange = "24h" | "7d";

type Metric = "pm25" | "co2" | "tvoc" | "temp" | "humidity";

type SubPlanId = "free" | "lite" | "pro" | "ops";

type SubscriptionPlan = {
    id: SubPlanId;
    nameEn: string;
    nameKo: string;
    priceCentsPerMonth: number;
    creditsCentsPerMonth: number;
    perksEn: string[];
    perksKo: string[];
};

const SUB_PLANS: SubscriptionPlan[] = [
    {
        id: "free",
        nameEn: "Free",
        nameKo: "무료",
        priceCentsPerMonth: 0,
        creditsCentsPerMonth: 0,
        perksEn: [
            "Public Explorer + Air Badge",
            "Personal dashboard (basic)",
            "Optional Beta: missions & referrals (verification)",
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

function planById(id: SubPlanId) {
    return SUB_PLANS.find((p) => p.id === id) ?? SUB_PLANS[0];
}

function maxCreditsForSubtotalCents(subtotalCents: number) {
    return Math.floor(subtotalCents * COMMERCE.maxCreditRatio);
}

function applyCreditsToSubtotal(params: { subtotalCents: number; creditBalanceCents: number }) {
    const capCents = maxCreditsForSubtotalCents(params.subtotalCents);
    const usedCents = Math.max(0, Math.min(params.creditBalanceCents, capCents));
    const dueCents = Math.max(0, params.subtotalCents - usedCents);
    return { capCents, usedCents, dueCents };
}

function centsToUsd(cents: number) {
    return cents / 100;
}

function formatUsd(cents: number) {
    const usd = centsToUsd(cents);
    if (Math.abs(usd - Math.round(usd)) < 1e-9) return `$${Math.round(usd)}`;
    return `$${usd.toFixed(2)}`;
}

function hexToRgb(hex: string) {
    const h = hex.replace("#", "").trim();
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = Number.parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return { r, g, b };
}

function rgba(hex: string, a: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}

function brandGradientCss(angle = 90) {
    return `linear-gradient(${angle}deg, ${BRAND.blue} 0%, ${BRAND.indigo} 52%, ${BRAND.green} 100%)`;
}

function metricColor(m: Metric) {
    if (m === "co2") return BRAND.blue;
    if (m === "pm25") return BRAND.indigo;
    if (m === "tvoc") return BRAND.green;
    return BRAND.blue;
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
        "credit.simulateMonth": "Simulate +1 month",
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

export function setCsvNewlineMode(mode: CsvNewlineMode) {
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

export function saveSubPlan(id: SubPlanId) {
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

export type Alert = {
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
// IAQ helpers
// -----------------------------

const THRESHOLDS: Record<Metric, number> = {
    pm25: 35,
    co2: 1000,
    tvoc: 400,
    temp: 26,
    humidity: 60,
};

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function generateSeries(seed: number, points = 48): ReadingPoint[] {
    let x = seed;
    const rnd = () => {
        x = (x * 1664525 + 1013904223) % 4294967296;
        return x / 4294967296;
    };

    const now = Date.now();
    const out: ReadingPoint[] = [];
    for (let i = points - 1; i >= 0; i--) {
        const ts = now - i * 30 * 60_000;
        const hour = new Date(ts).getHours();
        const busy = hour >= 9 && hour <= 20 ? 1 : 0.6;

        const pm25 = Math.max(2, Math.round((10 + busy * 18) * (0.6 + rnd())));
        const co2 = Math.round((520 + busy * 800) * (0.85 + rnd() * 0.35));
        const tvoc = Math.round((80 + busy * 260) * (0.7 + rnd() * 0.9));
        const temp = Math.round((21 + (rnd() - 0.5) * 2.5) * 10) / 10;
        const humidity = Math.round((43 + (rnd() - 0.5) * 12) * 10) / 10;

        out.push({
            t: new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            ts,
            pm25,
            co2,
            tvoc,
            temp,
            humidity,
        });
    }
    return out;
}

function scoreFromPoint(p: ReadingPoint): number {
    const pm25 = 100 - clamp((p.pm25 / THRESHOLDS.pm25) * 55, 0, 55);
    const co2 = 100 - clamp((p.co2 / THRESHOLDS.co2) * 45, 0, 45);
    const tvoc = 100 - clamp((p.tvoc / THRESHOLDS.tvoc) * 35, 0, 35);
    const temp = 100 - clamp(((p.temp - 22) / 6) * 18, 0, 18);
    const humidity = 100 - clamp(((p.humidity - 45) / 20) * 18, 0, 18);
    const v = pm25 * 0.28 + co2 * 0.28 + tvoc * 0.18 + temp * 0.13 + humidity * 0.13;
    return Math.round(clamp(v, 0, 100));
}

export function timeOverThreshold(series: ReadingPoint[], metric: Metric): number {
    const thr = THRESHOLDS[metric];
    const over = series.filter((p) => p[metric] > thr).length;
    return series.length === 0 ? 0 : Math.round((over / series.length) * 100);
}

function csvFromSeries(series: ReadingPoint[], newline: string): string {
    const header = ["timestamp", "pm25", "co2", "tvoc", "temp", "humidity"].join(",");
    const rows = series
        .map((p) => {
            const iso = new Date(p.ts).toISOString();
            return [iso, p.pm25, p.co2, p.tvoc, p.temp, p.humidity].join(",");
        })
        .join(newline);
    return rows ? `${header}${newline}${rows}` : header;
}

function downloadText(filename: string, text: string) {
    if (typeof window === "undefined") return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // fallback
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            return true;
        } catch {
            return false;
        }
    }
}

function statusPill(status: Device["status"]) {
    switch (status) {
        case "online":
            return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
        case "degraded":
            return "bg-amber-500/15 text-amber-200 border-amber-500/30";
        default:
            return "bg-zinc-500/15 text-zinc-200 border-zinc-500/30";
    }
}

function shortAddr(addr: string) {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function makeMockSolAddress(seed: number) {
    const base = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    let x = seed >>> 0;
    const pick = () => {
        x = (x * 1664525 + 1013904223) >>> 0;
        return base[x % base.length];
    };
    return Array.from({ length: 44 }).map(pick).join("");
}

function hash32(input: string) {
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

function projectEquirect(lat: number, lng: number, width: number, height: number) {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
}

export function referralCodeFromWallet(walletAddress: string) {
    const h = hash32(walletAddress).toString(16).toUpperCase();
    return `AV-${h.padStart(8, "0").slice(0, 8)}`;
}

// -----------------------------
// UI primitives
// -----------------------------

function Container({ children }: { children: React.ReactNode }) {
    return <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>;
}

function LogoMark({ size = 18 }: { size?: number }) {
    // Verified AirVent Logo Mark (Blue/Green swoosh)
    return (
        <svg width={size} height={size} viewBox="0 0 120 60" aria-hidden="true" fill="none">
            {/* Dark Blue Wedge (Bottom Left) */}
            <path
                d="M10 45 C 25 48, 45 45, 65 32 L 35 32 C 25 35, 15 40, 10 45 Z"
                fill="#1B365D"
            />
            {/* Green Swoosh (Top Right) */}
            <path
                d="M35 32 Q 75 18 110 5 Q 85 25 55 35 Q 45 35 35 32 Z"
                fill="#4B8C45"
            />
        </svg>
    );
}

function GradientText({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                backgroundImage: brandGradientCss(90),
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
            }}
        >
            {children}
        </span>
    );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: ButtonVariant;
    size?: "sm" | "md";
    type?: "button" | "submit";
    disabled?: boolean;
    title?: string;
};

function LightButton({
    children,
    onClick,
    className = "",
    variant = "primary",
    size = "md",
    type = "button",
    disabled,
    title,
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
    const pad = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";
    const styles: Record<ButtonVariant, string> = {
        primary: "text-white shadow-sm",
        secondary: "bg-white text-slate-900 border border-slate-200",
        ghost: "bg-transparent text-slate-800 hover:bg-slate-50 border border-transparent",
    };
    const styleProps: React.CSSProperties =
        variant === "primary" ? { background: brandGradientCss(90) } : variant === "ghost" ? {} : {};
    const disabledCls = disabled ? "opacity-60 pointer-events-none" : "";

    return (
        <button
            type={type}
            title={title}
            onClick={onClick}
            className={`${base} ${pad} ${styles[variant]} ${disabledCls} ${className}`.trim()}
            style={styleProps}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function Button({
    children,
    onClick,
    className = "",
    variant = "secondary",
    size = "md",
    type = "button",
    disabled,
    title,
}: ButtonProps) {
    // Dark theme button
    const base =
        "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-0";
    const pad = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";
    const styles: Record<ButtonVariant, string> = {
        primary: "text-white",
        secondary: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
        ghost: "bg-transparent text-white/80 hover:bg-white/5",
    };
    const styleProps: React.CSSProperties = variant === "primary" ? { background: brandGradientCss(90) } : {};
    const disabledCls = disabled ? "opacity-60 pointer-events-none" : "";

    return (
        <button
            type={type}
            title={title}
            onClick={onClick}
            className={`${base} ${pad} ${styles[variant]} ${disabledCls} ${className}`.trim()}
            style={styleProps}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function LightCard({
    title,
    right,
    children,
    className = "",
}: {
    title?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    const hasHeader = Boolean(title) || Boolean(right);
    return (
        <div className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}>
            {hasHeader && (
                <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <div className="text-xs text-slate-500">{right}</div>
                </div>
            )}
            <div className={hasHeader ? "mt-3" : ""}>{children}</div>
        </div>
    );
}

function DarkCard({
    title,
    right,
    children,
    className = "",
}: {
    title?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    const hasHeader = Boolean(title) || Boolean(right);
    return (
        <div className={`rounded-3xl border border-white/10 bg-white/5 p-4 ${className}`.trim()}>
            {hasHeader && (
                <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-white/60">{right}</div>
                </div>
            )}
            <div className={hasHeader ? "mt-3" : ""}>{children}</div>
        </div>
    );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/55">{label}</div>
            <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
            {sub ? <div className="mt-1 text-xs text-white/55">{sub}</div> : null}
        </div>
    );
}

function Input({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
        />
    );
}

function Select({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-950">
                    {o.label}
                </option>
            ))}
        </select>
    );
}

// -----------------------------
// Routing (hash)
// -----------------------------

type Page = "home" | "dashboard";

type EmbedRoute = "badge" | null;

function detectEmbedRoute(): EmbedRoute {
    try {
        const h = (window.location.hash || "").toLowerCase();
        if (h.startsWith("#/badge") || h.startsWith("#badge")) return "badge";
    } catch {
        // ignore
    }
    return null;
}

function queryParamsFromHref(): URLSearchParams {
    try {
        const href = window.location.href;
        const idx = href.indexOf("?");
        if (idx < 0) return new URLSearchParams();
        return new URLSearchParams(href.slice(idx + 1));
    } catch {
        return new URLSearchParams();
    }
}

// -----------------------------
// Badge embed
// -----------------------------

function BadgeEmbedPage() {
    const params = useMemo(() => queryParamsFromHref(), []);
    const siteId = params.get("site") || "S-SEO-001";
    const langParam = params.get("lang");
    const lang: Lang = langParam === "ko" ? "ko" : langParam === "en" ? "en" : detectLang();
    const t = useMemo(() => makeT(lang), [lang]);

    const transparent = params.get("transparent") === "1";

    const site = useMemo(() => mockSites.find((s) => s.id === siteId) ?? mockSites[0], [siteId]);
    const seed = useMemo(() => siteId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0), [siteId]);
    const series = useMemo(() => generateSeries(seed, 24), [seed]);
    const latest = series[series.length - 1];
    const score = latest ? scoreFromPoint(latest) : 0;

    useEffect(() => {
        try {
            document.documentElement.style.background = "transparent";
            document.body.style.margin = "0";
            document.body.style.background = transparent ? "transparent" : "white";
        } catch {
            // ignore
        }
    }, [transparent]);

    return (
        <div className="h-full w-full" style={{ background: transparent ? "transparent" : "white" }}>
            <div
                className="h-full w-full rounded-2xl border border-slate-200 bg-white/95 p-3"
                style={{ boxShadow: "0 8px 26px rgba(0,0,0,0.08)" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LogoMark size={18} />
                        <div className="text-sm font-extrabold text-slate-900">AirVent</div>
                    </div>
                    <div className="text-[11px] text-slate-500">Embeddable Badge</div>
                </div>

                <div className="mt-2 flex items-end justify-between">
                    <div>
                        <div className="text-xs text-slate-500">{t("badge.today")}</div>
                        <div className="mt-0.5 text-4xl font-black text-slate-900">{score}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500">{t("badge.site")}</div>
                        <div className="mt-0.5 text-sm font-semibold text-slate-900">{site?.name ?? siteId}</div>
                    </div>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-700">
                    {[
                        { k: "PM2.5", v: latest?.pm25 ?? "-", c: BRAND.indigo },
                        { k: "CO₂", v: latest?.co2 ?? "-", c: BRAND.blue },
                        { k: "TVOC", v: latest?.tvoc ?? "-", c: BRAND.green },
                    ].map((x) => (
                        <div key={x.k} className="rounded-xl border border-slate-200 bg-white p-2">
                            <div className="text-slate-500">{x.k}</div>
                            <div className="mt-0.5 font-semibold text-slate-900">{x.v}</div>
                            <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: x.c, opacity: 0.35 }} />
                        </div>
                    ))}
                </div>

                <div className="mt-2 text-[11px] text-slate-500">{t("badge.updated")}</div>
            </div>
        </div>
    );
}


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

    const navTo = (id: string) => {
        if (!isHome) {
            setPage("home");
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
            return;
        }
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

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
                    <button type="button" onClick={() => setPage("home")} className="flex items-center gap-2">
                        <LogoMark size={20} />
                        <div className={isHome ? "text-sm font-extrabold text-slate-900" : "text-sm font-extrabold text-white"}>AirVent</div>
                        <div className={isHome ? "hidden md:block text-xs text-slate-500" : "hidden md:block text-xs text-white/55"}>{t("nav.tagline")}</div>
                    </button>

                    <div className="hidden md:flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => navTo("comparison")}
                            className={
                                isHome
                                    ? "rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    : "rounded-full px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                            }
                        >
                            {t("nav.comparison")}
                        </button>
                        <button
                            type="button"
                            onClick={() => navTo("rewards")}
                            className={
                                isHome
                                    ? "rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    : "rounded-full px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                            }
                        >
                            {t("nav.rewards")}
                        </button>
                        <button
                            type="button"
                            onClick={() => navTo("subscription")}
                            className={
                                isHome
                                    ? "rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    : "rounded-full px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                            }
                        >
                            {t("nav.subscription")}
                        </button>
                        <button
                            type="button"
                            onClick={() => navTo("faq")}
                            className={
                                isHome
                                    ? "rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    : "rounded-full px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                            }
                        >
                            {t("nav.faq")}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(isHome ? "dashboard" : "home")}
                            className={
                                isHome
                                    ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                                    : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
                            }
                            title={isHome ? t("nav.dashboard") : t("nav.homepage")}
                        >
                            {isHome ? t("nav.dashboard") : t("nav.homepage")}
                        </button>

                        <button
                            type="button"
                            onClick={onToggleLang}
                            className={
                                isHome
                                    ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                                    : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
                            }
                            title="Language"
                        >
                            {lang === "ko" ? t("nav.lang.ko") : t("nav.lang.en")}
                        </button>

                        {walletAddress ? (
                            <button
                                type="button"
                                onClick={onDisconnectWallet}
                                className={
                                    isHome
                                        ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                                        : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
                                }
                                title={shortAddr(walletAddress)}
                            >
                                {t("wallet.disconnect")}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onConnectWallet}
                                className={
                                    isHome
                                        ? "rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                                        : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
                                }
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
// Home
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
    onOpenDashboard: (mode?: DashboardMode, range?: OpsRange) => void;
    onJoinBeta: () => void;
    betaJoined: boolean;
}) {
    const heroBgUrl = usePreloadedImage(HERO_BG_LOCAL, HERO_BG_LOCAL);

    return (
        <div className="bg-white">
            <div className="bg-gradient-to-b from-white to-slate-50">
                <Container>
                    <div className="py-12 md:py-16">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
                            <div className="absolute inset-0" style={{ backgroundImage: brandGradientCss(110), opacity: 0.10 }} />
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url(${heroBgUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    opacity: 1,
                                }}
                            />
                            {/* Gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
                            <div className="relative p-6 md:p-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
                                    <div className="md:col-span-7">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                                            <span className="h-2 w-2 rounded-full" style={{ background: BRAND.green }} />
                                            {t("hero.pill")}
                                        </div>
                                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                                            <GradientText>{t("hero.title")}</GradientText>
                                        </h1>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{t("hero.desc")}</p>
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <LightButton variant="primary" onClick={() => document.getElementById("rewards")?.scrollIntoView({ behavior: "smooth" })}>
                                                {t("hero.cta.buy")}
                                            </LightButton>
                                            <LightButton variant="secondary" onClick={() => onOpenDashboard()}>
                                                {t("hero.cta.dashboard")}
                                            </LightButton>
                                            <a
                                                href="#"
                                                onClick={(e) => e.preventDefault()}
                                                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                                            >
                                                {t("hero.cta.pilot")}
                                            </a>
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
                                                    <LightButton variant="primary" size="sm" onClick={() => onOpenDashboard("ops", "7d")}>
                                                        {t("sub.cta.7d")}
                                                    </LightButton>
                                                </div>
                                            </LightCard>

                                            <LightCard
                                                title={t("beta.title")}
                                                right={
                                                    <span className={`text-xs ${betaJoined ? "text-emerald-600" : "text-slate-500"}`}>
                                                        {betaJoined ? t("beta.joined") : "Beta"}
                                                    </span>
                                                }
                                            >
                                                <div className="text-sm text-slate-700">{t("beta.desc")}</div>
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

                                    <div className="md:col-span-5">
                                        <LightCard title={t("badge.title")} right={t("badge.right")}>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="text-xs text-slate-500">{t("badge.today")}</div>
                                                    <div className="mt-1 text-5xl font-black text-slate-900">92</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-500">{t("badge.site")}</div>
                                                    <div className="mt-1 text-sm font-semibold text-slate-900">AirVent HQ</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
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
                                                    <div className="mt-0.5 font-semibold text-slate-900">180</div>
                                                    <div className="mt-1 h-1 rounded-full" style={{ backgroundColor: BRAND.green, opacity: 0.35 }} />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-slate-500">{t("badge.updated")}</div>
                                        </LightCard>
                                    </div>                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <section id="comparison" className="border-t border-slate-200 bg-white">
                <Container>
                    <div className="py-12">
                        <div className="text-xs font-semibold text-slate-500">{t("cmp.kicker")}</div>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{t("cmp.title")}</h2>
                        <p className="mt-2 text-slate-600">{t("cmp.desc")}</p>

                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                            <div className="grid grid-cols-3 bg-slate-50 text-xs font-semibold text-slate-600">
                                <div className="px-4 py-3">{t("cmp.col.cap")}</div>
                                <div className="px-4 py-3">{t("cmp.col.trad")}</div>
                                <div className="px-4 py-3">{t("cmp.col.av")}</div>
                            </div>
                            {["Multi-site operations", "Action KPI", "Customer trust", "Reporting"].map((cap, idx) => (
                                <div key={cap} className="grid grid-cols-3 border-t border-slate-200 text-sm">
                                    <div className="px-4 py-3 font-semibold text-slate-900">{cap}</div>
                                    <div className="px-4 py-3 text-slate-600">{idx === 0 ? "Manual checks" : idx === 1 ? "Raw readings" : idx === 2 ? "No public proof" : "Screenshots"}</div>
                                    <div className="px-4 py-3 text-slate-900">
                                        {idx === 0 ? "HQ dashboard + ranking" : idx === 1 ? "Time-over-threshold + incidents" : idx === 2 ? "Shareable Air Badge" : "CSV export (roadmap: monthly PDF)"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            <section id="rewards" className="border-t border-slate-200 bg-white">
                <Container>
                    <div className="py-12">
                        <div className="text-xs font-semibold text-slate-500">{t("rewards.kicker")}</div>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{t("rewards.title")}</h2>
                        <p className="mt-2 text-slate-600">{t("rewards.note")}</p>
                        <p className="mt-2 text-slate-600">{t("rewards.creditNote")}</p>

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
                    </div>
                </Container>
            </section>

            <section id="subscription" className="border-t border-slate-200 bg-slate-50">
                <Container>
                    <div className="py-12">
                        <div className="text-xs font-semibold text-slate-500">{t("sub.kicker")}</div>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{t("sub.title")}</h2>
                        <p className="mt-2 text-slate-600">{t("sub.desc")}</p>
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{t("sub.policy")}</div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            {SUB_PLANS.map((pl) => (
                                <LightCard
                                    key={pl.id}
                                    title={lang === "ko" ? pl.nameKo : pl.nameEn}
                                    right={<span className="text-sm font-extrabold text-slate-900">{formatUsd(pl.priceCentsPerMonth)}/mo</span>}
                                >
                                    <div className="text-sm text-slate-600">
                                        {pl.creditsCentsPerMonth > 0 ? (
                                            <>
                                                +{formatUsd(pl.creditsCentsPerMonth)} {COMMERCE.creditSymbol}/{lang === "ko" ? "월" : "mo"}
                                            </>
                                        ) : (
                                            <>{lang === "ko" ? "월 크레딧 없음" : "No monthly credits"}</>
                                        )}
                                    </div>
                                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                                        {(lang === "ko" ? pl.perksKo : pl.perksEn).map((x) => (
                                            <li key={x}>• {x}</li>
                                        ))}
                                    </ul>
                                </LightCard>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <LightButton variant="primary" onClick={() => onOpenDashboard("ops", "7d")}>
                                {t("sub.cta.7d")}
                            </LightButton>
                            <LightButton variant="secondary" onClick={onJoinBeta}>
                                {t("sub.cta.beta")}
                            </LightButton>
                            <div className="text-xs text-slate-500">{t("sub.beta.note")}</div>
                        </div>
                    </div>
                </Container>
            </section>

            <section id="faq" className="border-t border-slate-200 bg-white">
                <Container>
                    <div className="py-12">
                        <div className="text-xs font-semibold text-slate-500">{t("faq.kicker")}</div>
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
                </Container>
            </section>
        </div>
    );
}

// -----------------------------
// Dashboard
// -----------------------------

function DashboardModeTabs({ mode, onChange, t }: { mode: DashboardMode; onChange: (m: DashboardMode) => void; t: TFn }) {
    const items: { id: DashboardMode; label: string }[] = [
        { id: "public", label: t("dash.mode.public") },
        { id: "ops", label: t("dash.mode.ops") },
        { id: "personal", label: t("dash.mode.personal") },
    ];

    return (
        <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5">
            {items.map((it) => (
                <button
                    key={it.id}
                    type="button"
                    onClick={() => onChange(it.id)}
                    className={
                        "px-3 py-2 text-xs font-semibold transition " + (mode === it.id ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5")
                    }
                >
                    {it.label}
                </button>
            ))}
        </div>
    );
}

function OpsRangeTabs({ range, onChange, t }: { range: OpsRange; onChange: (r: OpsRange) => void; t: TFn }) {
    const items: { id: OpsRange; label: string }[] = [
        { id: "24h", label: t("dash.range.24h") },
        { id: "7d", label: t("dash.range.7d") },
    ];
    return (
        <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div className="px-3 py-2 text-xs font-semibold text-white/55">{t("dash.range")}</div>
            {items.map((it) => (
                <button
                    key={it.id}
                    type="button"
                    onClick={() => onChange(it.id)}
                    className={
                        "px-3 py-2 text-xs font-semibold transition " + (range === it.id ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5")
                    }
                >
                    {it.label}
                </button>
            ))}
        </div>
    );
}

function LockedPanel({ t }: { t: TFn }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">{t("dash.lock.title")}</div>
            <div className="mt-2 text-sm text-white/70">{t("dash.lock.desc")}</div>
            <div className="mt-4 text-xs text-white/55">Use the top-right button to connect your wallet.</div>
        </div>
    );
}

type PublicNode = {
    id: string;
    siteId: string;
    siteName: string;
    city: string;
    status: Device["status"];
    lat: number;
    lng: number;
    lastSeen: string;
};

function buildPublicNodes(devices: Device[], sites: Site[]): PublicNode[] {
    const siteById = new Map(sites.map((s) => [s.id, s] as const));
    return devices.map((d) => {
        const s = siteById.get(d.siteId);
        const baseLat = s?.lat ?? 0;
        const baseLng = s?.lng ?? 0;
        const h = hash32(d.deviceId + d.siteId);
        const jLat = ((h % 1000) / 1000 - 0.5) * 0.08;
        const jLng = (((h / 1000) % 1000) / 1000 - 0.5) * 0.08;

        return {
            id: d.deviceId,
            siteId: d.siteId,
            siteName: s?.name ?? d.siteId,
            city: s?.city ?? "-",
            status: d.status,
            lat: baseLat + jLat,
            lng: baseLng + jLng,
            lastSeen: d.lastSeen,
        };
    });
}

function PublicExplorerView({
    lang,
    t,
    mode,
    onChangeMode,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
}) {
    const nodes = useMemo(() => buildPublicNodes(mockDevices, mockSites), []);
    const [q, setQ] = useState<string>("");
    const [filter, setFilter] = useState<"all" | "online" | "degraded" | "offline">("all");
    const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return nodes
            .filter((n) => (filter === "all" ? true : n.status === filter))
            .filter((n) => {
                if (!s) return true;
                return [n.id, n.siteName, n.city].some((x) => x.toLowerCase().includes(s));
            });
    }, [nodes, q, filter]);

    const selected = useMemo(() => filtered.find((n) => n.id === selectedId) ?? filtered[0] ?? null, [filtered, selectedId]);

    const w = 720;
    const h = 360;

    return (
        <Container>
            <div className="py-6 md:py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-xs text-white/55">{t("dash.public.kicker")}</div>
                        <div className="mt-1 text-2xl font-extrabold text-white">{t("dash.public.title")}</div>
                        <div className="mt-2 text-sm text-white/70">{t("dash.public.subtitle")}</div>
                    </div>
                    <DashboardModeTabs mode={mode} onChange={onChangeMode} t={t} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Stat label={t("dash.public.stat.nodes")} value={nodes.length} />
                    <Stat label={t("dash.public.stat.online")} value={nodes.filter((n) => n.status === "online").length} />
                    <Stat label={t("dash.public.stat.cities")} value={new Set(nodes.map((n) => n.city)).size} />
                    <Stat label={t("dash.public.stat.uptime")} value={`~${Math.round(92 + (hash32("u") % 6))}%`} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
                    <DarkCard
                        className="md:col-span-7"
                        title={t("dash.public.map")}
                        right={<span className="text-white/50">{t("dash.public.map.right")}</span>}
                    >
                        <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
                            <svg viewBox={`0 0 ${w} ${h}`} className="h-[360px] w-full" aria-label="node-map">
                                <rect x="0" y="0" width={w} height={h} rx="18" fill={rgba(BRAND.blue, 0.06)} />
                                <path
                                    d={`M20 ${h - 40} C 160 ${h - 130}, 280 ${h - 30}, 420 ${h - 100} C 520 ${h - 160}, 620 ${h - 60}, ${w - 20} ${h - 140}`}
                                    fill="none"
                                    stroke={rgba(BRAND.indigo, 0.18)}
                                    strokeWidth="2"
                                />

                                {filtered.map((n) => {
                                    const p = projectEquirect(n.lat, n.lng, w, h);
                                    const isSel = selected && n.id === selected.id;
                                    const c = n.status === "online" ? BRAND.green : n.status === "degraded" ? "#F59E0B" : "#94A3B8";
                                    return (
                                        <g key={n.id}>
                                            <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={isSel ? 7 : 5}
                                                fill={c}
                                                opacity={isSel ? 0.95 : 0.75}
                                                onClick={() => setSelectedId(n.id)}
                                                style={{ cursor: "pointer" }}
                                            />
                                            {isSel && <circle cx={p.x} cy={p.y} r={14} fill="none" stroke={c} strokeOpacity={0.5} strokeWidth="2" />}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </DarkCard>

                    <DarkCard
                        className="md:col-span-5"
                        title={t("dash.public.list")}
                        right={<span className="text-white/50">{t("dash.public.list.right")}</span>}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            <Input value={q} onChange={setQ} placeholder={t("dash.public.search")} />
                            <Select
                                value={filter}
                                onChange={(v) => setFilter(v as any)}
                                options={[
                                    { value: "all", label: t("dash.public.filter.all") },
                                    { value: "online", label: t("dash.public.filter.online") },
                                    { value: "degraded", label: t("dash.public.filter.degraded") },
                                    { value: "offline", label: t("dash.public.filter.offline") },
                                ]}
                            />
                        </div>

                        <div className="mt-3 max-h-[280px] overflow-auto rounded-2xl border border-white/10">
                            <div className="divide-y divide-white/10">
                                {filtered.map((n) => (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => setSelectedId(n.id)}
                                        className={
                                            "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition " +
                                            (selected && selected.id === n.id ? "bg-white/10" : "hover:bg-white/5")
                                        }
                                    >
                                        <div>
                                            <div className="font-semibold text-white">{n.id}</div>
                                            <div className="text-xs text-white/55">
                                                {n.city} • {n.siteName}
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusPill(n.status)}`}>{n.status}</span>
                                    </button>
                                ))}
                                {filtered.length === 0 && <div className="px-3 py-8 text-center text-sm text-white/60">{t("dash.public.none")}</div>}
                            </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="text-xs text-white/55">{t("dash.public.selected")}</div>
                            {selected ? (
                                <div className="mt-2">
                                    <div className="text-sm font-semibold text-white">{selected.id}</div>
                                    <div className="mt-1 text-xs text-white/60">
                                        {selected.city} • {selected.siteName}
                                    </div>
                                    <div className="mt-2 text-xs text-white/60">Last seen: {new Date(selected.lastSeen).toLocaleString()}</div>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-white/60">-</div>
                            )}
                        </div>

                        <div className="mt-3 text-xs text-white/55">{lang === "ko" ? WEB3.disclaimerKO : WEB3.disclaimerEN}</div>
                    </DarkCard>
                </div>
            </div>
        </Container>
    );
}


function SimpleAreaChart({
    series,
    metric,
    color,
    height = 64,
}: {
    series: ReadingPoint[];
    metric: Metric;
    color: string;
    height?: number;
}) {
    const data = series.map((p) => p[metric]);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Polyline points
    const w = 100;
    const h = 50;
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - ((v - min) / range) * h;
            return `${x},${y}`;
        })
        .join(" ");

    // Closed area
    const areaPoints = `0,${h} ${points} ${w},${h}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ height, width: "100%" }} preserveAspectRatio="none">
            <defs>
                <linearGradient id={`grad_${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points={areaPoints} fill={`url(#grad_${metric})`} stroke="none" />
        </svg>
    );
}

function OperationsDashboard({
    t,
    mode,
    onChangeMode,
}: {
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
}) {
    const [range, setRange] = useState<OpsRange>(() => detectOpsRange());
    const [locked] = useState(false);

    // In a real app, 'locked' would depend on wallet connection + ownership of NFT/SBT.
    // Here, we simulate it unlocked for demo, or maybe toggle it?
    // Let's assume unlocked for the demo unless we want to show the "Connect Wallet" state.

    const handleRange = (r: OpsRange) => {
        setRange(r);
        saveOpsRange(r);
    };

    const seed = useMemo(() => 12345, []);
    const series = useMemo(() => generateSeries(seed, range === "24h" ? 24 : 7 * 24), [seed, range]);

    const stats = [
        { label: t("dash.stat.score"), value: 87, sub: "+2% vs last period" },
        { label: t("dash.stat.active"), value: "12/12", sub: "100% uptime" },
        { label: t("dash.stat.alerts"), value: 0, sub: t("dash.alerts.none") },
        { label: t("dash.stat.tot"), value: "1.2%", sub: "Target < 5%" },
    ];

    const handleExport = () => {
        const csv = csvFromSeries(series, newlineFromMode(detectCsvNewlineMode()));
        downloadText(`airvent-ops-${range}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    };

    return (
        <Container>
            <div className="py-6 md:py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-xs text-white/55">{t("dash.kicker")}</div>
                        <div className="mt-1 text-2xl font-extrabold text-white">{t("dash.title")}</div>
                        <div className="mt-2 text-sm text-white/70">{t("dash.subtitle")}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <DashboardModeTabs mode={mode} onChange={onChangeMode} t={t} />
                        <div className="flex items-center gap-2">
                            <OpsRangeTabs range={range} onChange={handleRange} t={t} />
                            <Button size="sm" onClick={handleExport}>
                                {t("dash.export")}
                            </Button>
                        </div>
                    </div>
                </div>

                {locked ? (
                    <div className="mt-8">
                        <LockedPanel t={t} />
                    </div>
                ) : (
                    <>
                        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {stats.map((s) => (
                                <Stat key={s.label} label={s.label} value={s.value} sub={s.sub} />
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Main charts */}
                            {(["pm25", "co2", "tvoc", "temp"] as Metric[]).map((m) => (
                                <DarkCard
                                    key={m}
                                    title={t(`metric.${m}` as any)}
                                    right={
                                        <span className="text-xs text-white/50">
                                            {range} {t("dash.trend")}
                                        </span>
                                    }
                                >
                                    <SimpleAreaChart series={series} metric={m} color={metricColor(m)} height={160} />
                                    <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                                        <div>Min: {Math.min(...series.map((p) => p[m]))}</div>
                                        <div>Max: {Math.max(...series.map((p) => p[m]))}</div>
                                        <div>Avg: {Math.round(series.reduce((a, b) => a + b[m], 0) / series.length)}</div>
                                    </div>
                                </DarkCard>
                            ))}
                        </div>

                        <div className="mt-6">
                            <DarkCard title={t("dash.devices")}>
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="text-xs text-white/55">
                                        {mockDevices.length} total, {mockDevices.filter((d) => d.status === "online").length} online
                                    </div>
                                    <div className="w-full md:w-64">
                                        <Input value="" onChange={() => { }} placeholder={t("dash.devices.search")} />
                                    </div>
                                </div>
                                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                                    <table className="w-full text-left text-sm text-white/70">
                                        <thead className="bg-white/5 text-xs uppercase text-white/50">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Device</th>
                                                <th className="px-4 py-3 font-semibold">Site</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="hidden px-4 py-3 font-semibold md:table-cell">Last Seen</th>
                                                <th className="hidden px-4 py-3 font-semibold md:table-cell">Firmware</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mockDevices.slice(0, 5).map((d) => (
                                                <tr key={d.deviceId} className="hover:bg-white/5">
                                                    <td className="px-4 py-3 font-medium text-white">
                                                        {d.label}
                                                        <div className="text-[10px] text-white/40">{d.deviceId}</div>
                                                    </td>
                                                    <td className="px-4 py-3">{d.siteId}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${statusPill(d.status)}`}>
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-xs md:table-cell">{new Date(d.lastSeen).toLocaleString()}</td>
                                                    <td className="hidden px-4 py-3 text-xs md:table-cell font-mono">{d.firmware}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {mockDevices.length > 5 && (
                                        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-2 text-center text-xs text-white/40 hover:bg-white/5 cursor-pointer">
                                            View all {mockDevices.length} devices
                                        </div>
                                    )}
                                </div>
                            </DarkCard>
                        </div>
                    </>
                )}
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
    onConnectWallet,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    onChangeMode: (m: DashboardMode) => void;
    walletAddress: string | null;
    onConnectWallet: () => void;
}) {
    const [creditCents, setCreditCents] = useState(() => detectCreditCents());
    const [subPlan] = useState<SubPlanId>(() => detectSubPlan());
    const [cartPoints, setCartPoints] = useState(0); // 0=none, 1=Early, 2=Std, 3=Set

    useEffect(() => {
        saveCreditCents(creditCents);
    }, [creditCents]);

    // const creditsUsd = centsToUsd(creditCents);
    const plan = planById(subPlan);

    // Cart logic
    const cartItem =
        cartPoints === 1
            ? { name: t("credit.product.early"), price: COMMERCE.earlyBirdCents }
            : cartPoints === 2
                ? { name: t("credit.product.std"), price: COMMERCE.standardCents }
                : cartPoints === 3
                    ? { name: t("credit.product.set"), price: COMMERCE.set3Cents }
                    : null;

    const { capCents, usedCents, dueCents } = applyCreditsToSubtotal({
        subtotalCents: cartItem?.price ?? 0,
        creditBalanceCents: creditCents,
    });

    const handleSimulate = () => {
        // Add monthly credits
        const add = plan.creditsCentsPerMonth;
        if (add > 0) {
            setCreditCents((p) => p + add);
            alert(`Simulated month passed. +${formatUsd(add)} credits added.`);
        } else {
            alert("Free plan has no monthly credits. Upgrade to Ops/Pro/Lite.");
        }
    };

    const handleReset = () => {
        setCreditCents(0);
    };

    if (!walletAddress) {
        return (
            <Container>
                <div className="py-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="text-xs text-white/55">{t("dash.personal.kicker")}</div>
                            <div className="mt-1 text-2xl font-extrabold text-white">{t("dash.personal.title")}</div>
                        </div>
                        <DashboardModeTabs mode={mode} onChange={onChangeMode} t={t} />
                    </div>
                    <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
                        <div className="text-lg font-semibold text-white">{t("dash.lock.title")}</div>
                        <div className="mt-2 text-white/60">{t("dash.lock.desc")}</div>
                        <Button variant="primary" className="mt-6" onClick={onConnectWallet}>
                            {t("wallet.connect")}
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-6 md:py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-xs text-white/55">{t("dash.personal.kicker")}</div>
                        <div className="mt-1 text-2xl font-extrabold text-white">{t("dash.personal.title")}</div>
                        <div className="mt-2 text-sm text-white/70">{t("dash.personal.subtitle")}</div>
                    </div>
                    <DashboardModeTabs mode={mode} onChange={onChangeMode} t={t} />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
                    {/* Left: Credits & Plan */}
                    <div className="space-y-6 md:col-span-4">
                        <DarkCard title={t("credit.title")} right={<span className="text-xs text-emerald-400">{t("credit.max60")}</span>}>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{formatUsd(creditCents)}</span>
                                <span className="text-sm font-semibold text-white/60">{COMMERCE.creditSymbol}</span>
                            </div>
                            <div className="mt-1 text-xs text-white/40">≈ {formatUsd(creditCents)} USD value</div>

                            <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">{t("credit.plan.current")}</span>
                                    <span className="font-semibold text-white">
                                        {lang === "ko" ? plan.nameKo : plan.nameEn}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">{t("credit.plan.monthly")}</span>
                                    <span className="font-semibold text-emerald-400">
                                        +{formatUsd(plan.creditsCentsPerMonth)}
                                    </span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex gap-2">
                                    <Button size="sm" onClick={handleSimulate} className="flex-1">
                                        {t("credit.simulateMonth")}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleReset}>
                                        {t("credit.reset")}
                                    </Button>
                                </div>
                            </div>
                        </DarkCard>

                        <DarkCard title={t("credit.checkout")}>
                            <div className="space-y-3">
                                <div className="text-sm text-white/60">{t("credit.product")}</div>
                                <select
                                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                                    value={cartPoints}
                                    onChange={(e) => setCartPoints(Number(e.target.value))}
                                >
                                    <option value={0}>-- Select --</option>
                                    <option value={1}>{t("credit.product.early")} ({formatUsd(COMMERCE.earlyBirdCents)})</option>
                                    <option value={2}>{t("credit.product.std")} ({formatUsd(COMMERCE.standardCents)})</option>
                                    <option value={3}>{t("credit.product.set")} ({formatUsd(COMMERCE.set3Cents)})</option>
                                </select>

                                {cartItem && (
                                    <div className="mt-4 space-y-2 rounded-xl bg-white/5 p-3 text-sm">
                                        <div className="flex justify-between text-white/70">
                                            <span>{t("credit.subtotal")}</span>
                                            <span>{formatUsd(cartItem.price)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-400">
                                            <span>{t("credit.used")}</span>
                                            <span>-{formatUsd(usedCents)}</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                                            <span>{t("credit.due")}</span>
                                            <span>{formatUsd(dueCents)}</span>
                                        </div>
                                        <div className="mt-1 text-right text-[10px] text-white/40">
                                            {t("credit.cap")}: {formatUsd(capCents)}
                                        </div>
                                    </div>
                                )}
                                <Button variant="primary" className="w-full" disabled={!cartItem}>
                                    {t("hero.cta.buy")}
                                </Button>
                            </div>
                        </DarkCard>
                    </div>

                    {/* Right: Personal stats (simple) */}
                    <div className="md:col-span-8">
                        <DarkCard title={t("dash.personal.title")}>
                            <div className="text-sm text-white/70">
                                You have 0 connected devices. (Mock data shown in Ops dashboard).
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Stat label="Total Rewards" value="12.4 AIVT" />
                                <Stat label="Referrals" value="0" />
                            </div>
                        </DarkCard>
                    </div>
                </div>
            </div>
        </Container>
    );
}

// -----------------------------
// Dashboard Page Component
// -----------------------------

function DashboardPage({
    lang,
    t,
    mode,
    setMode,
    walletAddress,
    onConnectWallet,
}: {
    lang: Lang;
    t: TFn;
    mode: DashboardMode;
    setMode: (m: DashboardMode) => void;
    walletAddress: string | null;
    onConnectWallet: () => void;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {mode === "public" && <PublicExplorerView lang={lang} t={t} mode={mode} onChangeMode={setMode} />}
            {mode === "ops" && <OperationsDashboard t={t} mode={mode} onChangeMode={setMode} />}
            {mode === "personal" && (
                <PersonalDashboard
                    lang={lang}
                    t={t}
                    mode={mode}
                    onChangeMode={setMode}
                    walletAddress={walletAddress}
                    onConnectWallet={onConnectWallet}
                />
            )}
        </div>
    );
}

// -----------------------------
// Self-tests (hidden)
// -----------------------------

if (typeof window !== "undefined") {
    (window as any).__airvent = {
        APP_VERSION,
        BRAND,
        I18N,
        SUB_PLANS,
        reset: () => {
            localStorage.clear();
            window.location.reload();
        },
    };
}

// -----------------------------
// App
// -----------------------------

export default function App() {
    const [page, setPage] = useState<Page>("home");
    const [lang, setLang] = useState<Lang>(() => detectLang());
    const [dashMode, setDashMode] = useState<DashboardMode>(() => normalizeDashMode(null));
    const t = useMemo(() => makeT(lang), [lang]);

    // Beta / Wallet state
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [betaJoined, setBetaJoined] = useState(() => detectBetaJoined());
    const [betaTasks, setBetaTasks] = useState<BetaTaskState>(() => detectBetaTasks());

    useEffect(() => {
        // Only save lang if explicitly changed, but here we just respect what's used.
        // (We could save to localStorage on effect)
        window.localStorage?.setItem("airvent_lang", lang);
    }, [lang]);

    useEffect(() => {
        saveBetaJoined(betaJoined);
    }, [betaJoined]);

    useEffect(() => {
        saveBetaTasks(betaTasks);
    }, [betaTasks]);

    // Embed check
    const [embed, setEmbed] = useState<EmbedRoute>(null);
    useEffect(() => {
        setEmbed(detectEmbedRoute());
        const h = () => setEmbed(detectEmbedRoute());
        window.addEventListener("hashchange", h);
        return () => window.removeEventListener("hashchange", h);
    }, []);

    if (embed === "badge") {
        return <BadgeEmbedPage />;
    }

    const handleConnectWallet = () => {
        // Mock wallet connection
        const mockAddr = makeMockSolAddress(Date.now());
        setWalletAddress(mockAddr);
        if (betaJoined && !betaTasks.connect_wallet) {
            setBetaTasks((prev) => ({ ...prev, connect_wallet: true }));
            alert("Mission Completed: Wallet Connected! (+100 Credits - demo)");
            saveCreditCents(detectCreditCents() + 100);
        }
    };

    const handleDisconnectWallet = () => {
        setWalletAddress(null);
    };

    const handleOpenDashboard = (mode?: DashboardMode, range?: OpsRange) => {
        setPage("dashboard");
        if (mode) setDashMode(mode);
        if (range) saveOpsRange(range); // side-effect immediate
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleJoinBeta = () => {
        if (!betaJoined) {
            if (confirm("Join AirVent Beta?\n\n- Receive missions\n- Earn credits\n- Verify ID (mock)")) {
                setBetaJoined(true);
                alert("Welcome to Beta! Check your Personal Dashboard for missions.");
            }
        } else {
            handleOpenDashboard("personal");
        }
    };

    const handleToggleLang = () => {
        setLang((prev) => (prev === "en" ? "ko" : "en"));
    };

    return (
        <div className="font-sans text-slate-900 antialiased selection:bg-indigo-500/30">
            <TopNav
                page={page}
                setPage={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                lang={lang}
                onToggleLang={handleToggleLang}
                t={t}
                walletAddress={walletAddress}
                onConnectWallet={handleConnectWallet}
                onDisconnectWallet={handleDisconnectWallet}
            />
            <main>
                {page === "home" && (
                    <HomePage
                        lang={lang}
                        t={t}
                        onOpenDashboard={handleOpenDashboard}
                        onJoinBeta={handleJoinBeta}
                        betaJoined={betaJoined}
                    />
                )}
                {page === "dashboard" && (
                    <DashboardPage
                        lang={lang}
                        t={t}
                        mode={dashMode}
                        setMode={setDashMode}
                        walletAddress={walletAddress}
                        onConnectWallet={handleConnectWallet}
                    />
                )}
            </main>
        </div>
    );
}


