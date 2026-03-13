import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { isAuthed, logout, getNickname } from "../auth";
import i18n from "../i18n/config";

const isLocal: boolean =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

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
    heroWebDemo: "웹 Demo",
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
      { icon: "📱", title: "터치스크린으로 더 쉬운 설치", desc: "에어벤트 노드는 기기 자체의 터치스크린에서 직접 와이파이를 연결할 수 있어, 복잡한 초기 설정 없이 누구나 쉽게 사용할 수 있습니다." },
      { icon: "🔋", title: "USB-C 전원으로 자유로운 이동", desc: "USB-C 전원 방식을 지원해 보조배터리만 있으면 원하는 공간으로 손쉽게 옮겨 사용할 수 있습니다. 거실, 침실, 아이방, 사무실 등 필요한 곳에서 바로 공기질을 확인할 수 있습니다." },
      { icon: "✨", title: "콤팩트한 사이즈, 감각적인 디자인", desc: "작고 세련된 디자인으로 공간을 해치지 않으며, 인테리어 소품처럼 자연스럽게 어우러집니다. 측정기 이상의 존재감으로, 기능성과 디자인을 동시에 만족시킵니다." },
      { icon: "🏅", title: "인증으로 검증된 신뢰성", desc: "KC 인증과 초미세먼지 성능인증을 통해 기기의 안전성과 측정 신뢰성을 높였습니다. 눈에 보이는 디자인뿐 아니라, 믿고 사용할 수 있는 품질까지 갖춘 공기질 노드입니다." },
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
    footerLinks: { docs: "문서", github: "GitHub", blog: "블로그", privacy: "개인정보처리방침", terms: "이용약관", warranty: "보증정책" },
    toast: {
      welcome: "님, 환영합니다!",
      sub: "{tx.toast.sub}"
    },
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
    heroWebDemo: "Web Demo",
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
      { icon: "📱", title: "Easier Setup with Touchscreen", desc: "AirVent Node lets you connect to Wi-Fi directly from the device's built-in touchscreen — no complex setup, easy for anyone." },
      { icon: "🔋", title: "Freedom to Move with USB-C Power", desc: "USB-C power support means all you need is a power bank. Move it to your living room, bedroom, kids' room, or office anytime." },
      { icon: "✨", title: "Compact Size, Stylish Design", desc: "Its sleek, compact design blends naturally into any space — functional and beautiful at the same time." },
      { icon: "🏅", title: "Reliability Backed by Certification", desc: "KC Certification and fine dust performance certification ensure the device's safety and measurement accuracy you can trust." },
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
    footerLinks: { docs: "Docs", github: "GitHub", blog: "Blog", privacy: "Privacy Policy", terms: "Terms of Service", warranty: "Warranty Policy" },
    toast: { welcome: ", welcome back!", sub: "Welcome to AirVent" },
  },
  ja: {
    nav: { about: "紹介", node: "ノード購入", demo: "ダッシュボードDemo" },
    login: "ログイン",
    dashboard: "ダッシュボード",
    heroEyebrow: "DEPIN AIR QUALITY NETWORK",
    heroTitle: "室内空気質を測定するノード、\nTestnetの最初の貢献者を募集しています",
    heroSub:
      "AirVentは家、オフィス、屋内空間の空気質を測定するスマートノードです。ノードの発売とDevnetの検証を終えた今、製品ユーザーであり初期ネットワーク貢献者として共に歩む最初のユーザーを募集しています。",
    heroCta: "ノードを購入する",
    heroMore: "アプリDEMO",
    heroCtaAuthed: "ノードを購入する",
    heroDash: "ダッシュボードへ",
    heroWebDemo: "Web Demo",
    sections: {
      problems: "なぜAirVentが必要なのですか？",
      whyNow: "現在のフェーズと主要メッセージ",
      whyNowSub: "AirVentは今、最も重要なマイルストーンを通過しています。",
      howItWorks: "仕組み",
      howItWorksSub: "測定から貢献までのプロセス",
      timeline: "ネットワークタイムライン",
      benefits: "参加特典",
      proof: "Proof Coming Soon",
      faq: "よくある質問",
    },
    problems: [
      { icon: "📱", title: "タッチスクリーンでより簡単な設置", desc: "AirVentノードは機器自体のタッチスクリーンから直接Wi-Fiに接続できるため、複雑な初期設定なしで誰でも簡単に使用できます。" },
      { icon: "🔋", title: "USB-C電源で自由な移動", desc: "USB-C電源方式をサポートし、モバイルバッテリーがあればお好みの場所に簡単に持ち運んで使用できます。リビング、寝室、子供部屋、オフィスなど、必要な場所ですぐに空気質を確認できます。" },
      { icon: "✨", title: "コンパクトなサイズ、洗練されたデザイン", desc: "小さく洗練されたデザインで空間を損なわず、インテリア小物のように自然に馴染みます。測定器以上の存在感で、機能性とデザインを同時に満足させます。" },
      { icon: "🏅", title: "認証で証明された信頼性", desc: "KC認証と超微粒子性能認証を通じて、機器の安全性と測定の信頼性を高めました。目に見えるデザインだけでなく、安心して使用できる品質まで備えた空気質ノードです。" },
    ],
    whyNowItems: [
      {
        title: "ノードの発売完了",
        desc: "実際に使用可能な物理ノードを基準に、初期ユーザーのオンボーディングを開始できる段階です。",
        icon: "radar",
      },
      {
        title: "Devnet検証完了",
        desc: "基本動作、データフロー、ネットワーク連動の核心的な検証を終えた状態です。",
        icon: "shield",
      },
      {
        title: "初期Testnet募集",
        desc: "現在は大規模な販売よりも、初期貢献者と共に実使用の検証を積み上げていく時期です。",
        icon: "flask",
      },
    ],
    howItWorksItems: [
      {
        step: "01",
        title: "ノードを設置します",
        desc: "家、オフィス、店舗などの屋内環境に簡単に設置します。",
        icon: "home",
      },
      {
        step: "02",
        title: "環境データを収集します",
        desc: "温度、湿度、PM、CO₂などの室内空気質シグナルを測定します。",
        icon: "activity",
      },
      {
        step: "03",
        title: "データ品質を検証します",
        desc: "測定データをネットワークの観点から検討し、信頼性を高めていきます。",
        icon: "shield",
      },
      {
        step: "04",
        title: "初期貢献者として参加します",
        desc: "Testnet段階で実際のユーザーであり初期ネットワーク貢献者として合流します。",
        icon: "wallet",
      },
    ],
    audienceItems: [
      {
        title: "一般ユーザー / アーリーアダプター",
        icon: "wind",
        points: [
          "自宅や空間の空気質を目で確認したい方",
          "異常な兆候をより迅速に検知したい方",
          "新しいスマートデバイスをいち早く使ってみたい方",
        ],
      },
      {
        title: "ブロックチェーン / DePINユーザー",
        icon: "layers",
        points: [
          "実物ベースのデータネットワークの出発点に参加したい方",
          "Testnet段階からプロジェクトの成長を共にしたい方",
          "初期の貢献ポジションを先取りしたい方",
        ],
      },
    ],
    timelineItems: [
      "製品設計およびノードの準備",
      "Devnet検証完了",
      "Testnet初期ユーザー募集",
      "実使用データ・レビュー・運営証明を順次公開",
      "ネットワーク拡張と参加構造の高度化",
    ],
    benefitItems: [
      "初期Testnet参加経験",
      "アップデートとコミュニティへの優先アクセス",
      "ノード運用の経験蓄積",
      "今後公開される貢献構造の先行メリット",
      "初期ユーザーポジションの確保",
      "製品とネットワークの発展過程への直接関与",
    ],
    nodeCards: [
      {
        name: "AirVent Node",
        desc: "室内空気質の測定とネットワークへの参加を同時に考慮したスマートノード",
        specs: ["Indoor IAQ sensing", "Dashboard connected", "Early user ready"],
      },
      {
        name: "AirVent Dashboard",
        desc: "測定フローとノードの状態を確認する運営画面の出発点",
        specs: ["Node overview", "Status monitoring", "Proof-ready structure"],
      },
    ],
    proofItems: [
      "初期運営者のレビューを公開予定",
      "屋内の設置写真と使用事例を公開予定",
      "ダッシュボードの測定スナップショットを公開予定",
      "Testnet運営/貢献データを公開予定",
      "追加の検証レポートを順次アップデート予定",
    ],
    faqs: [
      {
        q: "AirVentはどのような製品ですか？",
        a: "AirVentは室内空気質を測定するスマートノードであり、検証可能な環境データネットワークへの初期参加のためのエントリーポイントとして設計された製品です。",
      },
      {
        q: "今は商用リリースですか、それともTestnet段階ですか？",
        a: "現在はノードの発売とDevnetの検証を終えた後、Testnetの初期ユーザーを募集している段階です。",
      },
      {
        q: "一般ユーザーも参加できますか？",
        a: "可能です。ブロックチェーンの知識がないユーザーでも空気質の測定と製品の使用の観点から参加できるように設計されています。",
      },
      {
        q: "レビューと運営データはいつ公開されますか？",
        a: "初期ユーザーの募集後、実使用の事例と運営データを順次公開する構造を計画しています。",
      },
    ],
    footerTagline: "Hyperlocal Air Quality Network — Powered by Solana",
    footerLinks: { docs: "文書", github: "GitHub", blog: "ブログ", privacy: "個人情報保護方針", terms: "利用規約", warranty: "保証政策" },
    toast: { welcome: "さん、おかえりなさい！", sub: "AirVentへようこそ" },
  },
  'zh-TW': {
    nav: { about: "關於", node: "購買節點", demo: "儀表板 Demo" },
    login: "登錄",
    dashboard: "儀表板",
    heroEyebrow: "DEPIN AIR QUALITY NETWORK",
    heroTitle: "測量室內空氣質量的節點，\n現正招募 Testnet 首批貢獻者",
    heroSub:
      "AirVent 是測量家庭、辦公室及室內空間空氣質量的智能節點。隨着節點發布和 Devnet 驗證的完成，我們現正招募首批以產品用戶及初期網絡貢獻者身份加入的成員。",
    heroCta: "申請節點",
    heroMore: "App DEMO",
    heroCtaAuthed: "申請節點",
    heroDash: "進入儀表板",
    heroWebDemo: "網頁 Demo",
    sections: {
      problems: "爲什麼需要 AirVent？",
      whyNow: "目前階段與核心信息",
      whyNowSub: "AirVent 正處於其最重要的里程碑。",
      howItWorks: "運作方式",
      howItWorksSub: "從測量到貢獻的過程",
      timeline: "網絡時間線",
      benefits: "參與福利",
      proof: "Proof Coming Soon",
      faq: "常見問題",
    },
    problems: [
      { icon: "📱", title: "觸控螢幕讓安裝更簡單", desc: "AirVent 節點可直接在設備觸控螢幕上連接 Wi-Fi，無需複雜的初期設置，任何人都能輕鬆使用。" },
      { icon: "🔋", title: "USB-C 供電，隨心移動", desc: "支持 USB-C 供電，只要有行動電源就能輕鬆移動到任何空間。客廳、臥室、小孩房或辦公室，隨處都能即時查看空氣質量。" },
      { icon: "✨", title: "尺寸精巧，設計感十足", desc: "精巧時尚的設計不佔空間，能像裝飾品般自然融入環境。它不僅是測量儀器，更兼具功能性與美感。" },
      { icon: "🏅", title: "認證保障，值得信賴", desc: "通過 KC 認證和超細懸浮微粒性能認證，提升了設備的安全性和測量可靠性。不僅外觀出衆，品質更值得信賴。" },
    ],
    whyNowItems: [
      {
        title: "節點發布完成",
        desc: "目前已可基於實際可用的物理節點開始初階用戶入駐。",
        icon: "radar",
      },
      {
        title: "Devnet 驗證完成",
        desc: "強調已完成基礎運作、數據流和網絡聯動的核心驗證。",
        icon: "shield",
      },
      {
        title: "初期 Testnet 招募",
        desc: "目前是與初期貢獻者共同積累實際使用驗證的時期，而非大規模銷售。",
        icon: "flask",
      },
    ],
    howItWorksItems: [
      {
        step: "01",
        title: "安裝節點",
        desc: "在家庭、辦公室、商店等室內空間輕鬆完成安裝。",
        icon: "home",
      },
      {
        step: "02",
        title: "收集環境數據",
        desc: "測量室內空氣質量信號，如溫度、濕度、PM、CO₂ 等。",
        icon: "activity",
      },
      {
        step: "03",
        title: "驗證數據質量",
        desc: "從網絡角度審核測量數據，提升可信度。",
        icon: "shield",
      },
      {
        step: "04",
        title: "加入成爲初期貢獻者",
        desc: "在 Testnet 階段以真實用戶及初期網絡貢獻者身份加入。",
        icon: "wallet",
      },
    ],
    audienceItems: [
      {
        title: "一般用戶 / 早期採用者",
        icon: "wind",
        points: [
          "想親眼確認家中和空間空氣質量的用戶",
          "想更快速偵測異常徵兆的用戶",
          "想率先嘗試新型智能設備的用戶",
        ],
      },
      {
        title: "區塊鏈 / DePIN 用戶",
        icon: "layers",
        points: [
          "想參與實體數據網絡起點的用戶",
          "想從 Testnet 階段起與項目共同成長的用戶",
          "想搶佔初期貢獻位置的用戶",
        ],
      },
    ],
    timelineItems: [
      "產品設計與節點準備",
      "Devnet 驗證完成",
      "Testnet 初期用戶招募",
      "依次公開實際使用數據、評論及運營證明",
      "網絡擴展與參與結構優化",
    ],
    benefitItems: [
      "初期 Testnet 參與經驗",
      "優先獲得更新信息與加入社區",
      "累積節點運營經驗",
      "即將公開的貢獻結構優先權",
      "佔據初期用戶位置",
      "直接參與產品與網絡的演進過程",
    ],
    nodeCards: [
      {
        name: "AirVent Node",
        desc: "兼顧室內空氣質量測量與網絡參與的智能節點",
        specs: ["Indoor IAQ sensing", "Dashboard connected", "Early user ready"],
      },
      {
        name: "AirVent Dashboard",
        desc: "確認測量流程與節點狀態的運營頁面起點",
        specs: ["Node overview", "Status monitoring", "Proof-ready structure"],
      },
    ],
    proofItems: [
      "即將公開初期運營者評論",
      "即將公開室內安裝照片與使用案例",
      "即將公開儀表板測量快照",
      "即將公開 Testnet 運營/貢獻數據",
      "依次更新額外的驗證報告",
    ],
    faqs: [
      {
        q: "AirVent 是什麼樣的產品？",
        a: "AirVent 是一個測量室內空氣質量的智能節點，也是爲參與可驗證環境數據網絡而設計的初期入口點。",
      },
      {
        q: "目前是商業發布，還是 Testnet 階段？",
        a: "目前是在完成節點發布與 Devnet 驗證後，招募 Testnet 初期用戶的階段。",
      },
      {
        q: "一般用戶也可以參與嗎？",
        a: "可以。即使是沒有區塊鏈知識的用戶，也能從空氣質量測量與產品使用的角度參與其中。",
      },
      {
        q: "什麼時候會公開評論和運營數據？",
        a: "我們計劃在初階用戶招募後，依次公開實際使用案例與運營數據。",
      },
    ],
    footerTagline: "Hyperlocal Air Quality Network — Powered by Solana",
    footerLinks: { docs: "文檔", github: "GitHub", blog: "部落格", privacy: "隱私權政策", terms: "使用條款", warranty: "保固政策" },
    toast: { welcome: "，歡迎回來！", sub: "歡迎來到 AirVent" },
  },
};

export const heroBadges = [
  "Devnet Verified",
  "Testnet Early Access",
  "Indoor Air Quality Node",
] as const;

type Lang = keyof typeof t;

export default function LandingPage() {
  const navigate = useNavigate();
  // Detect initial language correctly from i18n or URL params
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
  const [authenticated, setAuthenticated] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const tx = t[lang];

  useEffect(() => {
    console.log("[LandingPage] lang state:", lang, "i18n.language:", i18n.language, "window.location.search:", window.location.search);
    let toastTimer: ReturnType<typeof setTimeout>;
    
    // Sync i18n with URL param if present (critical for redirection after login)
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang && ["ko", "en", "ja", "zh-TW"].includes(urlLang)) {
      i18n.changeLanguage(urlLang);
    }
    const currentLang = (i18n.language || "en").split("-")[0] as Lang;
    if (t[currentLang]) {
      setLang(currentLang);
    } else {
      setLang("en");
    }
    const loadUser = async (session: import('@supabase/supabase-js').Session | null) => {
      if (session) {
        console.log("[LandingPage] setAuthenticated(true)"); setAuthenticated(true);
        const { supabase: sb } = await import('../lib/supabaseClient');
        const nick = await getNickname(session.user.id);
        setNickname(nick);
        if (nick) {
          setShowToast(true);
          toastTimer = setTimeout(() => setShowToast(false), 4000);
        }
      } else {
        console.log("[LandingPage] setAuthenticated(false)"); setAuthenticated(false);
        setNickname(null);
      }
    };
    import('../lib/supabaseClient').then(({ supabase: sb }) => {
      sb.auth.getSession().then(({ data: { session } }) => loadUser(session));
      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
        loadUser(session);
      });
      return () => {
        subscription.unsubscribe();
        clearTimeout(toastTimer);
      };
    });
  }, []);

  const handleLogout = async () => {
    console.log("[LandingPage] logout called"); await logout();
    console.log("[LandingPage] setAuthenticated(false)"); setAuthenticated(false);
    setMenuOpen(false);
    navigate("/");
  };

  const changeLanguage = (l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {showToast && nickname && (
        <div style={{position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',zIndex:9999,animation:'slideDown 0.4s ease-out'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(15,23,42,0.95)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(16,185,129,0.1)',padding:'16px 24px',backdropFilter:'blur(16px)'}}>
            <span style={{fontSize:'24px'}}>👋</span>
            <div>
              <div style={{color:'#34d399',fontWeight:900,fontSize:'16px'}}>{`${nickname}${tx.toast.welcome}`}</div>
              <div style={{color:'#94a3b8',fontSize:'12px',marginTop:'2px'}}>{tx.toast.sub}</div>
            </div>
            <button onClick={() => setShowToast(false)} style={{marginLeft:'8px',color:'#475569',background:'none',border:'none',cursor:'pointer',fontSize:'18px',lineHeight:'1'}} onMouseOver={e=>(e.currentTarget.style.color='#94a3b8')} onMouseOut={e=>(e.currentTarget.style.color='#475569')}>✕</button>
          </div>
        </div>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translate(-50%,-16px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <Container>
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 flex items-center">
                <img src="/airvent-logo-v3.png" alt="Airvent" className="h-full w-auto object-contain" />
              </div>
              <div className="hidden sm:block border-l border-slate-700 pl-4">
                <div className="text-sm font-black uppercase tracking-widest text-slate-400">Airvent DePIN</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#problems" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">{tx.nav.about}</a>
              <Link to="/node" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">{tx.nav.node}</Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                {(["en", "ko", "ja", "zh-TW"] as Lang[]).map((l) => (
                  <button key={l} onClick={() => changeLanguage(l)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-slate-200"}`}>
                    {l.toUpperCase() === "ZH-TW" ? "ZH" : l.toUpperCase()}
                  </button>
                ))}
              </div>
              {authenticated ? (
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition flex items-center gap-1">
                    {lang === "ko" ? "내 계정" : "Account"} <span className="text-xs">{menuOpen ? "▲" : "▼"}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 overflow-hidden">
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors">
                        🏠 {tx.dashboard}
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
                        🚪 {lang === "ko" ? "로그아웃" : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to={`/login?lang=${lang}`} className="rounded-xl bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-sm hover:bg-emerald-400 transition">
                  {tx.login}
                </Link>
              )}
            </div>
          </div>
        </Container>
      </header>
      <main>
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
                      <Link to={`/login?lang=${lang}`} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 text-emerald-400 font-semibold px-8 py-4 text-base hover:border-emerald-400 hover:text-white transition">
                        {lang === "ko" ? "로그인" : lang === "ja" ? "ログイン" : lang === "zh-TW" ? "登錄" : "Login"}
                      </Link>
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
        <section id="problems" className="py-24 bg-slate-900/20">
          <Container>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 underline decoration-emerald-500/30 decoration-4 underline-offset-8">{tx.sections.problems}</h2>
              <div className="grid gap-4">
                {tx.problems.map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left flex gap-5 items-start hover:border-emerald-500/30 transition-colors">
                    <span className="text-4xl shrink-0 mt-1">{item.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
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
      <footer className="border-t border-slate-800 bg-slate-950 py-14">
        <Container>
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="text-base font-black text-white mb-2">Airvent-AI</div>
              <p className="text-sm text-slate-500 leading-relaxed">{tx.footerTagline}</p>
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
                  <li><a href="/warranty" className="hover:text-emerald-400 transition-colors">{tx.footerLinks.warranty}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h4>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link to="/node" className="hover:text-emerald-400 transition-colors">{tx.nav.node}</Link></li>
                  <li><Link to={`/login?lang=${lang}`} className="hover:text-emerald-400 transition-colors">{tx.dashboard}</Link></li>
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
