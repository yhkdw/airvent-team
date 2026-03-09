import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { isAuthed } from "../auth";

const isLocal: boolean =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

/* ─────────────── i18n ─────────────── */
/* ─────────────── i18n ─────────────── */
const t = {
  ko: {
    nav: { about: "소개", node: "노드 구매", demo: "대시보드 Demo" },
    login: "로그인",
    dashboard: "대시보드",
    heroEyebrow: "DEPIN AIR QUALITY NETWORK",
    heroTitle: "실내 공기질을 측정하는 노드,\n이제 Testnet의 첫 기여자를 모집합니다",
    heroSub:
      "AirVent는 집·사무실·실내 공간의 공기질을 측정하는 스마트 노드입니다. 노드 출시와 Devnet 검증을 마친 지금, 제품 사용자이자 초기 네트워크 기여자로 함께할 첫 유저를 모집하고 있습니다.",
    heroCta: "노드 구매하기",
    heroMore: "앱 DEMO",
    heroCtaAuthed: "노드 구매하기",
    heroDash: "대시보드 입장",
    sections: {
      problems: "왜 AirVent가 필요한가요?",
      whyNow: "현재 단계와 핵심 메시지",
      whyNowSub: "AirVent는 지금 가장 중요한 지점을 지나고 있습니다.",
      howItWorks: "작동 방식",
      howItWorksSub: "측정에서 기여까지의 과정",
      timeline: "네트워크 타임라인",
      benefits: "참여 혜택",
      proof: "Proof Coming Soon",
      faq: "자주 묻는 질문",
    },
    problems: [
      "기존 공기질 측정기는 가격과 활용성이 아쉬워 대중화가 어렵습니다.",
      "실내 공기 상태를 지속적으로 이해하고 이상을 빠르게 파악하기 어렵습니다.",
      "데이터는 쌓여도 사용자에게 장기적인 가치나 참여 경험으로 연결되지 않습니다.",
    ],
    whyNowItems: [
      {
        title: "노드 출시 완료",
        desc: "실제 사용 가능한 물리 노드 기준으로 초기 사용자 온보딩을 시작할 수 있는 단계입니다.",
        icon: "radar",
      },
      {
        title: "Devnet 검증 완료",
        desc: "기초 동작, 데이터 흐름, 네트워크 연동의 핵심 검증을 마친 상태를 강조합니다.",
        icon: "shield",
      },
      {
        title: "초기 Testnet 모집",
        desc: "지금은 대규모 판매보다 초기 기여자와 실사용 검증을 함께 쌓아가는 시기입니다.",
        icon: "flask",
      },
    ],
    howItWorksItems: [
      {
        step: "01",
        title: "노드를 설치합니다",
        desc: "집, 사무실, 매장 등 실내 공간에 간편하게 설치합니다.",
        icon: "home",
      },
      {
        step: "02",
        title: "환경 데이터를 수집합니다",
        desc: "온도, 습도, PM, CO₂ 등 실내 공기질 신호를 측정합니다.",
        icon: "activity",
      },
      {
        step: "03",
        title: "데이터 품질을 검증합니다",
        desc: "측정 데이터를 네트워크 관점에서 검토하고 신뢰도를 높여갑니다.",
        icon: "shield",
      },
      {
        step: "04",
        title: "초기 기여자로 참여합니다",
        desc: "Testnet 단계에서 실제 사용자이자 초기 네트워크 기여자로 합류합니다.",
        icon: "wallet",
      },
    ],
    audienceItems: [
      {
        title: "일반 사용자 / 얼리어답터",
        icon: "wind",
        points: [
          "우리 집과 공간의 공기질을 눈으로 확인하고 싶은 분",
          "이상 징후를 더 빠르게 감지하고 싶은 분",
          "새로운 스마트 디바이스를 가장 먼저 써보고 싶은 분",
        ],
      },
      {
        title: "블록체인 / DePIN 사용자",
        icon: "layers",
        points: [
          "실물 기반 데이터 네트워크의 시작점에 참여하고 싶은 분",
          "Testnet 단계부터 프로젝트 성장에 함께하고 싶은 분",
          "초기 기여 포지션을 선점하고 싶은 분",
        ],
      },
    ],
    timelineItems: [
      "제품 설계 및 노드 준비",
      "Devnet 검증 완료",
      "Testnet 초기 유저 모집",
      "실사용 데이터 · 후기 · 운영 증빙 순차 공개",
      "네트워크 확장 및 참여 구조 고도화",
    ],
    benefitItems: [
      "초기 Testnet 참여 경험",
      "업데이트 및 커뮤니티 우선 접근",
      "노드 운용 경험 축적",
      "향후 공개될 기여 구조의 선점 효과",
      "초기 사용자 포지션 확보",
      "제품과 네트워크 발전 과정에 직접 관여",
    ],
    nodeCards: [
      {
        name: "AirVent Node",
        desc: "실내 공기질 측정과 네트워크 참여를 동시에 고려한 스마트 노드",
        specs: ["Indoor IAQ sensing", "Dashboard connected", "Early user ready"],
      },
      {
        name: "AirVent Dashboard",
        desc: "측정 흐름과 노드 상태를 확인하는 운영 화면의 시작점",
        specs: ["Node overview", "Status monitoring", "Proof-ready structure"],
      },
    ],
    proofItems: [
      "초기 운영자 후기 공개 예정",
      "실내 설치 사진 및 사용 사례 공개 예정",
      "대시보드 측정 스냅샷 공개 예정",
      "Testnet 운영/기여 데이터 공개 예정",
      "추가 검증 리포트 순차 업데이트 예정",
    ],
    faqs: [
      {
        q: "AirVent는 어떤 제품인가요?",
        a: "AirVent는 실내 공기질을 측정하는 스마트 노드이자, 검증 가능한 환경 데이터 네트워크의 초기 참여를 위한 진입점으로 설계된 제품입니다.",
      },
      {
        q: "지금은 상용 출시인가요, Testnet 단계인가요?",
        a: "현재는 노드 출시와 Devnet 검증을 마친 뒤 Testnet 초기 유저를 모집하는 단계입니다.",
      },
      {
        q: "일반 사용자도 참여할 수 있나요?",
        a: "가능합니다. 블록체인 지식이 없는 사용자도 공기질 측정과 제품 사용 관점에서 참여할 수 있도록 설계합니다.",
      },
      {
        q: "후기와 운영 데이터는 언제 공개되나요?",
        a: "초기 사용자 모집 이후 실사용 사례와 운영 데이터를 순차적으로 공개하는 구조로 계획하고 있습니다.",
      },
    ],
    footerTagline: "Hyperlocal Air Quality Network — Powered by Solana",
    footerLinks: { docs: "문서", github: "GitHub", blog: "블로그", privacy: "개인정보처리방침", terms: "이용약관" },
  },
  en: {
    nav: { about: "About", node: "Buy Node", demo: "Dashboard Demo" },
    login: "Login",
    dashboard: "Dashboard",
    heroEyebrow: "DEPIN AIR QUALITY NETWORK",
    heroTitle: "A Node for Indoor Air Quality,\nRecruiting Testnet Early Contributors",
    heroSub:
      "AirVent is a smart node that measures air quality in homes, offices, and indoor spaces. Following our Devnet verification, we are now recruiting the first users to join as product users and early network contributors.",
    heroCta: "Apply for Node",
    heroMore: "App DEMO",
    heroCtaAuthed: "Apply for Node",
    heroDash: "Enter Dashboard",
    sections: {
      problems: "Why AirVent?",
      whyNow: "Current Phase & Key Messages",
      whyNowSub: "AirVent is passing through its most crucial milestone.",
      howItWorks: "How It Works",
      howItWorksSub: "From measurement to contribution",
      timeline: "Network Timeline",
      benefits: "Participation Benefits",
      proof: "Proof Coming Soon",
      faq: "Frequently Asked Questions",
    },
    problems: [
      "Existing air quality monitors are hard to popularize due to cost and limited utility.",
      "It is difficult to consistently understand indoor air conditions and quickly identify anomalies.",
      "Even when data is collected, it often fails to connect users with long-term value or engagement.",
    ],
    whyNowItems: [
      {
        title: "Node Launch Complete",
        desc: "We are at a stage where early user onboarding can begin based on actual, usable physical nodes.",
        icon: "radar",
      },
      {
        title: "Devnet Verified",
        desc: "Highlights the completion of core verification for basic operations, data flow, and network integration.",
        icon: "shield",
      },
      {
        title: "Initial Testnet Recruitment",
        desc: "Currently, we focus on building early contributions and real-world validation rather than mass sales.",
        icon: "flask",
      },
    ],
    howItWorksItems: [
      {
        step: "01",
        title: "Install the Node",
        desc: "Easily install in indoor spaces like homes, offices, or stores.",
        icon: "home",
      },
      {
        step: "02",
        title: "Collect Environment Data",
        desc: "Measure indoor air quality signals such as Temperature, Humidity, PM, and CO₂.",
        icon: "activity",
      },
      {
        step: "03",
        title: "Verify Data Quality",
        desc: "Review measurement data from a network perspective to enhance reliability.",
        icon: "shield",
      },
      {
        step: "04",
        title: "Join as Early Contributor",
        desc: "Join as a real-world user and early network contributor during the Testnet phase.",
        icon: "wallet",
      },
    ],
    audienceItems: [
      {
        title: "General Users / Early Adopters",
        icon: "wind",
        points: [
          "Users who want to visually monitor air quality in their homes and spaces.",
          "Users who want to detect anomalies more quickly.",
          "Users who want to be the first to try new smart devices.",
        ],
      },
      {
        title: "Blockchain / DePIN Users",
        icon: "layers",
        points: [
          "Users who want to participate from the start of a physical-based data network.",
          "Users who want to grow with the project from the Testnet stage.",
          "Users who want to secure an early contributor position.",
        ],
      },
    ],
    timelineItems: [
      "Product Design & Node Preparation",
      "Devnet Verification Complete",
      "Initial Testnet User Recruitment",
      "Sequential release of usage data, reviews, and operational proofs",
      "Network expansion and advanced participation structures",
    ],
    benefitItems: [
      "Early Testnet participation experience",
      "Priority access to updates and community",
      "Accumulation of node operation experience",
      "Preemptive effect for upcoming contribution structures",
      "Securing an early user position",
      "Direct involvement in product and network evolution",
    ],
    nodeCards: [
      {
        name: "AirVent Node",
        desc: "A smart node designed for indoor air quality sensing and network participation.",
        specs: ["Indoor IAQ sensing", "Dashboard connected", "Early user ready"],
      },
      {
        name: "AirVent Dashboard",
        desc: "The starting point for monitoring measurement flows and node status.",
        specs: ["Node overview", "Status monitoring", "Proof-ready structure"],
      },
    ],
    proofItems: [
      "Early operator reviews coming soon",
      "Indoor installation photos and usage cases coming soon",
      "Dashboard measurement snapshots coming soon",
      "Testnet operational/contribution data coming soon",
      "Sequential updates of additional verification reports",
    ],
    faqs: [
      {
        q: "What kind of product is AirVent?",
        a: "AirVent is a smart node that measures indoor air quality and serves as an entry point for early participation in a verifiable environmental data network.",
      },
      {
        q: "Is it a commercial launch or a Testnet stage?",
        a: "Currently, we are at the stage of recruiting initial Testnet users after completing node launch and Devnet verification.",
      },
      {
        q: "Can general users participate?",
        a: "Yes. It is designed so that even users without blockchain knowledge can participate from an air quality monitoring and product usage perspective.",
      },
      {
        q: "When will reviews and operational data be released?",
        a: "We plan to sequentially release real-world cases and operational data after the initial user recruitment.",
      },
    ],
    footerTagline: "Hyperlocal Air Quality Network — Powered by Solana",
    footerLinks: { docs: "Docs", github: "GitHub", blog: "Blog", privacy: "Privacy Policy", terms: "Terms of Service" },
  },
} as const;

export const heroBadges = [
  "Devnet Verified",
  "Testnet Early Access",
  "Indoor Air Quality Node",
] as const;

type Lang = keyof typeof t;

/* ─────────────── Component ─────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ko");
  const [authenticated, setAuthenticated] = useState(false);
  const tx = t[lang];

  useEffect(() => {
    isAuthed().then(setAuthenticated);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <Container>
          <div className="py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="h-12 flex items-center">
                <img src="/airvent-logo-v3.png" alt="Airvent" className="h-full w-auto object-contain" />
              </div>
              <div className="hidden sm:block border-l border-slate-700 pl-4">
                <div className="text-sm font-black uppercase tracking-widest text-slate-400">Airvent DePIN</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#problems" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">{tx.nav.about}</a>
              <Link to="/node" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">{tx.nav.node}</Link>
              
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                {(["ko", "en"] as Lang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <Link to={authenticated ? "/dashboard" : "/login"} className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition">
                {authenticated ? tx.dashboard : tx.login}
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />
          <Container>
            <div className="relative py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {heroBadges.map((b, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 tracking-wider">
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-8 whitespace-pre-line tracking-tight">
                  {tx.heroTitle}
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
                  {tx.heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  {authenticated ? (
                    <>
                      <Link to="/node" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-slate-950 font-bold px-8 py-4 text-base hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5">
                        {tx.heroCtaAuthed}
                        <span>→</span>
                      </Link>
                      <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 text-white font-bold px-8 py-4 text-base hover:bg-blue-400 transition shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5">
                        {tx.heroDash}
                      </Link>
                      <a href="/demo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 text-slate-400 font-semibold px-8 py-4 text-base hover:border-slate-500 hover:text-white transition">
                        {tx.heroMore}
                      </a>
                    </>
                  ) : (
                    <>
                      <Link to="/node" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-slate-950 font-bold px-8 py-4 text-base hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5">
                        {tx.heroCta}
                        <span>→</span>
                      </Link>
                      <a href="/demo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 text-slate-400 font-semibold px-8 py-4 text-base hover:border-slate-500 hover:text-white transition">
                        {tx.heroMore}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <div className="relative w-full max-w-md aspect-square rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  <img src="/airvent_titan.png" alt="Airvent Node" className="relative w-4/5 h-4/5 object-contain drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Problems Section ── */}
        <section id="problems" className="py-24 bg-slate-900/20">
          <Container>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{tx.sections.problems}</h2>
              <div className="grid gap-4">
                {tx.problems.map((p, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-left flex gap-4 items-start">
                    <span className="text-emerald-500 font-bold">Q.</span>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ── Why Now Section (Positioning) ── */}
        <section className="py-24 border-t border-slate-800/50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">{tx.sections.whyNow}</h2>
              <p className="text-slate-400">{tx.sections.whyNowSub}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {tx.whyNowItems.map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                    {item.icon === "radar" && "📡"}
                    {item.icon === "shield" && "🛡️"}
                    {item.icon === "flask" && "🧪"}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── How It Works ── */}
        <section className="py-24 bg-slate-900/10 border-t border-slate-800/50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">{tx.sections.howItWorks}</h2>
              <p className="text-slate-400">{tx.sections.howItWorksSub}</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {tx.howItWorksItems.map((step, i) => (
                <div key={i} className="relative p-8 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-4xl mb-6">
                    {step.icon === "home" && "🏠"}
                    {step.icon === "activity" && "📈"}
                    {step.icon === "shield" && "🛡️"}
                    {step.icon === "wallet" && "💳"}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 mb-2">STEP {step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Audience ── */}
        <section className="py-24 border-t border-slate-800/50">
          <Container>
            <div className="grid md:grid-cols-2 gap-12">
              {tx.audienceItems.map((item, i) => (
                <div key={i} className="p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="text-3xl mb-6">{item.icon === "wind" ? "🌬️" : "📚"}</div>
                  <h3 className="text-2xl font-bold text-white mb-6">{item.title}</h3>
                  <ul className="space-y-4">
                    {item.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                        <span className="text-emerald-500 mt-1">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Timeline & Benefits ── */}
        <section className="py-24 bg-slate-900/20 border-t border-slate-800/50">
          <Container>
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold text-white mb-10">{tx.sections.timeline}</h3>
                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                  {tx.timelineItems.map((item, i) => (
                    <div key={i} className="relative pl-10 flex items-center gap-4">
                      <div className={`absolute left-0 w-6 h-6 rounded-full border-4 border-slate-950 ${i <= 2 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-800"}`} />
                      <p className={`text-sm font-medium ${i <= 2 ? "text-emerald-400" : "text-slate-500"}`}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-10">{tx.sections.benefits}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {tx.benefitItems.map((item, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>




        {/* ── Proof & FAQ ── */}
        <section className="py-24 border-t border-slate-800/50">
          <Container>
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold text-white mb-10">{tx.sections.proof}</h3>
                <div className="space-y-4">
                  {tx.proofItems.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-sm italic">
                      · {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-10">{tx.sections.faq}</h3>
                <div className="space-y-6">
                  {tx.faqs.map((faq, i) => (
                    <div key={i}>
                      <h4 className="text-slate-200 font-bold mb-2">Q. {faq.q}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-14">
        <Container>
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="text-base font-black text-white mb-2">Airvent-AI</div>
              <p className="text-sm text-slate-500 leading-relaxed">{tx.footerTagline}</p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mt-5">
                {[
                  { label: "X", href: "https://x.com/airventdepin", icon: "𝕏" },
                  { label: "Discord", href: "https://discord.gg/airvent", icon: "💬" },
                  { label: "Telegram", href: "https://t.me/airventdepin", icon: "✈️" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-sm">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resources</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.docs}</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.github}</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.blog}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legal</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><a href="/privacy" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.privacy}</a></li>
                  <li><a href="/terms" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.terms}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link to="/node" className="hover:text-emerald-400 transition-colors">{tx.nav.node}</Link></li>
                  <li><Link to="/login" className="hover:text-emerald-400 transition-colors">{tx.dashboard}</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Airvent-AI. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Solana
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
