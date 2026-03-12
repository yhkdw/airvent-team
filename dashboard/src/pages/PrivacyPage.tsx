import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const translations: Record<string, any> = {
  ko: {
    back: "메인으로 돌아가기",
    title: "개인정보처리방침",
    updated: "최종 업데이트일: 2026년 3월 12일",
    intro: "AirVent 및 관련 서비스(이하 “회사”, “AirVent”, “서비스”)는 이용자의 개인정보를 중요하게 생각합니다. 본 개인정보처리방침은 AirVent 웹사이트, 계정 서비스, 노드 관련 서비스, 고객지원 및 기타 관련 애플리케이션 이용 과정에서 회사가 어떤 정보를 수집하고, 어떻게 사용하며, 누구와 공유하고, 얼마 동안 보관하는지 설명합니다. 또한 이용자가 자신의 개인정보에 대해 행사할 수 있는 권리와 선택권도 안내합니다.",
    sections: [
      {
        title: "1. 수집하는 개인정보",
        content: "회사는 서비스 제공 과정에서 다음과 같은 정보를 수집할 수 있습니다.",
        subsections: [
          { title: "1) 이용자가 직접 제공하는 정보", list: ["이름 또는 닉네임", "이메일 주소", "비밀번호 또는 인증 관련 정보", "국가 또는 지역 정보", "고객지원 문의 내용", "노드 구매, 예약, 신청 또는 계정 등록 과정에서 입력한 정보", "뉴스레터, 대기자 명단, 이벤트 등록 과정에서 제출한 정보"] },
          { title: "2) 서비스 이용 과정에서 자동 수집되는 정보", list: ["IP 주소", "브라우저 종류 및 기기 정보", "운영체제 정보", "접속 일시", "방문 페이지 및 클릭 기록", "쿠키 및 유사 기술을 통한 이용 정보", "로그 데이터 및 오류 기록"] },
          { title: "3) 제3자 인증 또는 외부 서비스 연동 시 수집되는 정보", text: "회사는 계정 생성 및 로그인 편의를 위해 제3자 인증 제공자 또는 외부 플랫폼을 사용할 수 있습니다. 이 경우 회사는 해당 인증 제공자로부터 이용자 식별, 계정 생성 또는 서비스 제공에 필요한 최소한의 정보만 받을 수 있습니다." },
          { title: "4) 선택적으로 수집될 수 있는 정보", text: "서비스 기능에 따라 다음 정보가 추가로 처리될 수 있습니다.", list: ["지갑 주소 또는 블록체인 계정 식별자", "노드 식별 정보", "주문, 결제, 배송 관련 정보", "마케팅 수신 동의 여부", "베타 테스트 또는 테스트넷 참여 정보"] }
        ]
      },
      {
        title: "2. 개인정보의 이용 목적",
        text: "회사는 수집한 정보를 다음 목적 범위 내에서 이용할 수 있습니다.",
        list: ["계정 생성, 로그인, 본인 확인 및 계정 관리", "웹사이트 및 서비스 운영", "노드 신청, 구매, 예약, 배송 및 관련 고객지원 제공", "테스트넷, 베타 프로그램 및 커뮤니티 운영", "서비스 품질 개선, 오류 분석, 보안 강화", "공지사항, 업데이트, 이벤트, 프로모션 안내", "이용자 문의 대응 및 분쟁 처리", "법적 의무 준수 및 권리 보호", "부정 이용, 사기, 보안 위협 탐지 및 방지"]
      },
      {
        title: "3. 개인정보의 처리 근거",
        text: "회사는 적용되는 법령에 따라 다음과 같은 근거에 따라 개인정보를 처리할 수 있습니다.",
        list: ["이용자와의 계약 이행 또는 계약 체결 전 조치", "회사의 정당한 이익", "이용자의 동의", "법적 의무 준수", "이용자 또는 공공의 중대한 이익 보호가 필요한 경우"]
      },
      {
        title: "4. 쿠키 및 유사 기술",
        text: "회사는 웹사이트 운영, 로그인 유지, 트래픽 분석, 사용자 경험 개선을 위해 쿠키 및 유사 기술을 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. 다만 일부 기능은 쿠키가 비활성화되면 정상적으로 작동하지 않을 수 있습니다."
      },
      {
        title: "5. 개인정보의 공유 및 제공",
        text: "회사는 다음 경우에 개인정보를 제3자와 공유할 수 있습니다.",
        list: ["호스팅, 인증, 분석, 이메일 발송, 고객지원, 결제, 물류 등 서비스 운영에 필요한 외부 서비스 제공업체", "이용자가 연동을 요청하거나 동의한 외부 플랫폼", "법령에 따라 요구되거나, 적법한 요청에 대응해야 하는 경우", "회사의 권리, 재산, 안전 또는 이용자 보호가 필요한 경우", "합병, 인수, 자산 양도 등 기업 구조 변경 과정에서 필요한 경우"],
        footer: "회사는 서비스 제공에 필요한 범위를 초과하여 개인정보를 판매하지 않습니다."
      },
      {
        title: "6. 국제 이전",
        text: "AirVent는 글로벌 서비스 운영 과정에서 개인정보를 이용자가 거주하는 국가 외의 국가로 이전하거나 저장할 수 있습니다. 이 경우 회사는 적용되는 법령에 따라 적절한 보호조치를 마련하기 위해 합리적인 노력을 기울입니다."
      },
      {
        title: "7. 보관 기간",
        text: "회사는 개인정보를 수집 목적 달성에 필요한 기간 동안만 보관합니다. 다만 다음 경우에는 더 오래 보관할 수 있습니다.",
        list: ["법령상 보존 의무가 있는 경우", "분쟁 해결, 계약 이행, 보안 대응 또는 내부 기록 보관이 필요한 경우", "이용자가 별도 동의한 경우"],
        footer: "보관이 더 이상 필요하지 않은 개인정보는 합리적인 절차에 따라 삭제하거나 익명화합니다."
      },
      {
        title: "8. 이용자의 권리",
        text: "적용되는 법령에 따라 이용자는 다음 권리를 가질 수 있습니다.",
        list: ["자신의 개인정보에 대한 열람 요청", "부정확한 정보의 정정 요청", "삭제 요청", "처리 제한 요청", "처리 반대", "동의 철회", "데이터 이동 요청", "마케팅 수신 거부"],
        footer: "회사는 관련 법령 및 서비스 운영상 필요한 범위에서 이러한 요청을 검토하고 처리합니다."
      },
      {
        title: "9. 아동의 개인정보",
        text: "AirVent 서비스는 관련 법령상 보호가 필요한 아동을 대상으로 설계되지 않았습니다. 회사는 법적으로 허용되지 않는 방식으로 아동의 개인정보를 고의로 수집하지 않습니다."
      },
      {
        title: "10. 보안",
        text: "회사는 개인정보의 분실, 오용, 무단 접근, 공개, 변경 또는 파기를 방지하기 위해 합리적인 기술적·관리적 보호조치를 시행합니다. 다만 어떤 시스템도 절대적으로 안전하다고 보장할 수는 없습니다."
      },
      {
        title: "11. 제3자 사이트 및 서비스",
        text: "서비스에는 제3자 웹사이트, 플랫폼 또는 서비스로 연결되는 링크가 포함될 수 있습니다. 회사는 해당 제3자 서비스의 개인정보 처리 관행에 대해 책임지지 않으며, 이용자는 각 서비스의 정책을 별도로 확인해야 합니다."
      },
      {
        title: "12. 정책 변경",
        text: "회사는 사업, 기술, 법률 또는 운영상의 변화에 따라 본 개인정보처리방침을 수정할 수 있습니다. 중요한 변경이 있는 경우 웹사이트 또는 적절한 수단을 통해 안내합니다. 상단의 “최종 업데이트일”은 최근 개정일을 의미합니다."
      },
      {
        id: "contact",
        title: "13. 문의처",
        text: "개인정보처리방침 또는 개인정보 처리와 관련하여 문의하려면 아래로 연락해 주시기 바랍니다.",
        contact: {
          service: "AirVent",
          website: "airvent.ai",
          email: "info@airventinc.co.kr"
        }
      }
    ]
  },
  en: {
    back: "Back to Main",
    title: "Privacy Policy",
    updated: "Last Updated: March 12, 2026",
    intro: "AirVent and related services (collectively, \"Company,\" \"AirVent,\" or \"Services\") value your privacy. This Privacy Policy explains what information we collect, how we use it, whom we share it with, and how long we retain it in the course of using the AirVent website, account services, node-related services, customer support, and other related applications. It also informs you of your rights and choices regarding your personal information.",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We may collect the following information during the course of providing our services:",
        subsections: [
          { title: "1) Information you provide directly", list: ["Name or nickname", "Email address", "Password or authentication-related information", "Country or regional information", "Customer support inquiry details", "Information entered during node purchase, reservation, application, or account registration", "Information submitted during newsletter, waitlist, or event registration"] },
          { title: "2) Information collected automatically", list: ["IP address", "Browser type and device information", "Operating system information", "Access time", "Pages visited and click history", "Usage information via cookies and similar technologies", "Log data and error records"] },
          { title: "3) Information from third-party authentication or linked services", text: "We may use third-party authentication providers or external platforms for account creation and login convenience. In such cases, we receive only the minimum information necessary for user identification, account creation, or service provision from the respective provider." },
          { title: "4) Optional information", text: "The following information may be processed depending on service features:", list: ["Wallet address or blockchain account identifier", "Node identification information", "Order, payment, and delivery-related information", "Marketing consent status", "Beta test or testnet participation information"] }
        ]
      },
      {
        title: "2. Purpose of Use",
        text: "We use collected information for the following purposes within the scope of our operations:",
        list: ["Account creation, login, identity verification, and account management", "Website and service operation", "Providing node application, purchase, reservation, delivery, and related customer support", "Operating testnets, beta programs, and communities", "Improving service quality, error analysis, and security enhancement", "Notification of announcements, updates, events, and promotions", "Responding to user inquiries and dispute resolution", "Legal compliance and rights protection", "Detection and prevention of unauthorized use, fraud, and security threats"]
      },
      {
        title: "3. Legal Basis for Processing",
        text: "We process personal information based on the following grounds as permitted by applicable laws:",
        list: ["Performance of a contract or pre-contractual measures", "Legitimate interests of the Company", "User consent", "Compliance with legal obligations", "Protection of vital interests of the user or public interest"]
      },
      {
        title: "4. Cookies and Similar Technologies",
        text: "We use cookies and similar technologies for website operation, authentication maintenance, traffic analysis, and user experience improvement. Users can refuse or delete cookies through browser settings, though some features may not function properly without them."
      },
      {
        title: "5. Sharing and Disclosure",
        text: "We may share personal information with third parties in the following cases:",
        list: ["External service providers for hosting, authentication, analysis, email, support, payment, and logistics", "External platforms linked by user request or consent", "To comply with laws or respond to legal requests", "To protect the Company's rights, property, safety, or users", "In the course of corporate changes such as mergers, acquisitions, or asset transfers"],
        footer: "We do not sell personal information beyond the scope necessary for service provision."
      },
      {
        title: "6. International Transfers",
        text: "AirVent may transfer or store personal information in countries other than your country of residence during global operations. We make reasonable efforts to ensure appropriate safeguards are in place as required by law."
      },
      {
        title: "7. Retention Period",
        text: "We retain personal information only for the period necessary to fulfill its purposes, except in the following cases:",
        list: ["Legal retention obligations", "Dispute resolution, contract performance, security response, or internal record-keeping", "Additional user consent"],
        footer: "Personal information that is no longer needed is deleted or anonymized through reasonable procedures."
      },
      {
        title: "8. User Rights",
        text: "Under applicable laws, you may have the following rights:",
        list: ["Request access to your personal information", "Request correction of inaccurate information", "Request deletion", "Request restriction of processing", "Object to processing", "Withdraw consent", "Data portability request", "Opt-out of marketing communications"],
        footer: "We review and process these requests within the scope required by law and service operations."
      },
      {
        title: "9. Children's Privacy",
        text: "AirVent services are not designed for children requiring special legal protection. We do not knowingly collect personal information from children in an unauthorized manner."
      },
      {
        title: "10. Security",
        text: "We implement reasonable technical and organizational measures to prevent loss, misuse, unauthorized access, disclosure, alteration, or destruction. However, no system is absolutely secure."
      },
      {
        title: "11. Third-party Sites and Services",
        text: "Services may contain links to third-party sites or platforms. We are not responsible for their privacy practices; users should check their respective policies."
      },
      {
        title: "12. Policy Changes",
        text: "We may update this Privacy Policy to reflect changes in business, technology, law, or operations. Major changes will be announced on the website. The \"Last Updated\" date reflects the most recent revision."
      },
      {
        id: "contact",
        title: "13. Contact Us",
        text: "For inquiries regarding this Privacy Policy or personal information processing, please contact us below:",
        contact: {
          service: "AirVent",
          website: "airvent.ai",
          email: "info@airventinc.co.kr"
        }
      }
    ]
  },
  ja: {
    back: "メインに戻る",
    title: "個人情報保護方針",
    updated: "最終更新日: 2026年3月12日",
    intro: "AirVentおよび関連サービス（以下「当社」「AirVent」「サービス」）は、利用者の個人情報を重視しています。本個人情報保護方針は、AirVentウェブサイト、アカウント、ノード関連サービス、カスタマーサポート、および関連アプリケーションの利用において、どのような情報を収集・利用・共有・保管するかを説明するものです。また、権利と選択肢についてもご案内します。",
    sections: [
      {
        title: "1. 収集する個人情報",
        content: "当社はサービスの提供過程において以下の情報を収集する場合があります。",
        subsections: [
          { title: "1) 直接提供される情報", list: ["名前またはニックネーム", "メールアドレス", "パスワードまたは認証関連情報", "国・地域情報", "カスタマーサポートへの問い合わせ内容", "ノード購入・予約・登録時に入力された情報", "ニュースレターやイベント登録時に提出された情報"] },
          { title: "2) 自動的に収集される情報", list: ["IPアドレス", "ブラウザの種類およびデバイス情報", "OS情報", "アクセス日時", "訪問ページおよびクリック履歴", "Cookie等による利用情報", "ログデータおよびエラー分析記録"] },
          { title: "3) 第三者認証等からの情報", text: "アカウント作成・ログインの便宜のため、外部プラットフォーム認証を使用する場合があります。この場合、識別やサービス提供に必要な最低限の情報のみを取得します。" },
          { title: "4) 任意で収集される情報", text: "機能に応じて以下の情報が処理される場合があります。", list: ["ウォレットアドレスまたはブロックチェーン識別子", "ノード識別情報", "注文・決済・配送関連情報", "マーケティング受信同意状況", "テストネット等の参加情報"] }
        ]
      },
      {
        title: "2. 利用目的",
        text: "当社は収集した情報を以下の目的で利用します。",
        list: ["アカウント作成・管理・本人確認", "ウェブサイトおよびサービスの運営", "ノード関連のサポート・配送提供", "テストネットやコミュニティの運営", "品質改善・エラー分析・セキュリティ強化", "重要事項・イベント・プロモーションの案内", "問い合わせ対応および紛争解決", "法的義務の遵守および権利保護", "不正利用・詐欺・脅威の検知と防止"]
      },
      {
        title: "3. 処理の根拠",
        text: "当社は法令に基づき、以下のいずれかの根拠により個人情報を処理します。",
        list: ["契約の履行または締結前の措置", "当社の正当な利益", "利用者の同意", "法的義務の遵守", "重大な利益の保護が必要な場合"]
      },
      {
        title: "4. Cookieおよび類似技術",
        text: "ウェブ運営・ログイン維持・分析・ユーザー体験向上のためにCookie等を使用します。ブラウザの設定で拒否・削除が可能ですが、一部機能が制限される場合があります。"
      },
      {
        title: "5. 共有および提供",
        text: "当社は以下の場合に第三者と情報を共有することがあります。",
        list: ["ホスティング・認証・決済・物流等の業務委託先", "同意を得た外部プラットフォームとの連携", "法的要求への対応", "権利・財産・安全の保護に必要な場合", "合併・買収等の事業譲渡に伴う場合"],
        footer: "当社は、サービス提供に必要な範囲を超えて個人情報を販売することはありません。"
      },
      {
        title: "6. 国際移転",
        text: "グローバル運営において、居住国以外の国へ情報を移転・保管する場合があります。法令に従い適切な保護措置を講じるよう努めます。"
      },
      {
        title: "7. 保管期間",
        text: "目的達成に必要な期間のみ保管します。ただし、以下の場合は例外です。",
        list: ["法令による保管義務がある場合", "紛争解決・契約履行・セキュリティ上の必要がある場合", "別途同意がある場合"],
        footer: "不要となった情報は、合理的な手順で削除または匿名化します。"
      },
      {
        title: "8. 利用者の権利",
        text: "法令に基づき、以下の権利を行使できる場合があります。",
        list: ["閲覧・開示請求", "訂正・修正請求", "削除請求", "処理制限の請求", "処理への異議申し立て", "同意の撤回", "データポータビリティ請求", "ダイレクトメールの配信停止"],
        footer: "当社は法令の範囲内でこれらの要求を検討し、誠実に対応します。"
      },
      {
        title: "9. お子様のプライバシー",
        text: "本サービスは法的保護が必要なお子様を対象としていません。意図的に情報を収集することはありません。"
      },
      {
        title: "10. セキュリティ",
        text: "紛失・悪用・不正アクセス等を防ぐため、合理的かつ適切な保護措置を講じます。ただし、絶対的な安全を保証するものではありません。"
      },
      {
        title: "11. 第三者のサイト",
        text: "サービス内のリンク先における個人情報の取り扱いについては責任を負いかねます。各サイトのポリシーをご確認ください。"
      },
      {
        title: "12. 方針の変更",
        text: "運営・技術・法改正等に伴い改定される場合があります。重要な変更はウェブ等で通知します。「最終更新日」をご確認ください。"
      },
      {
        id: "contact",
        title: "13. お問い合わせ",
        text: "プライバシーポリシーに関するお問い合わせは以下までご連絡ください。",
        contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" }
      }
    ]
  },
  "zh-TW": {
    back: "返回首頁",
    title: "隱私權政策",
    updated: "最後更新日期：2026年3月12日",
    intro: "AirVent 及其相關服務（以下簡稱「公司」、「AirVent」或「服務」）非常重視使用者的隱私。本隱私權政策旨在說明我們在營運過程中所收集、使用、共用及保留個人資訊的情況。此外，本政策亦會告知您對個人資訊所擁有的權利與選擇。",
    sections: [
      {
        title: "1. 收集的個人資訊",
        content: "我們在提供服務的過程中可能會收集以下資訊：",
        subsections: [
          { title: "1) 您直接提供的資訊", list: ["名稱或暱稱", "電子郵件地址", "密碼或認證相關資訊", "國家或地區資訊", "客戶支援查詢內容", "在購買、預約、註冊過程中輸入的資訊", "訂閱新聞報或活動報名時提交的資訊"] },
          { title: "2) 自動收集的資訊", list: ["IP 位址", "瀏覽器類型及裝置資訊", "作業系統資訊", "存取時間", "造訪頁面及點擊記錄", "透過 Cookie 等技術收集的利用資訊", "日誌數據及錯誤記錄"] },
          { title: "3) 來自第三方認證或連動服務的資訊", text: "為方便註冊與登入，我們可能使用第三方認證。在這種情況下，我們僅會從該提供者處獲取識別身分或提供服務所需的最低限度資訊。" },
          { title: "4) 選項性資訊", text: "根據功能需求，可能會處理以下資訊：", list: ["錢包地址或區塊鏈帳戶標識符", "節點識別資訊", "訂單、支付及配送相關資訊", "行銷訊息接收意願", "測試網等參與資訊"] }
        ]
      },
      {
        title: "2. 利用目的",
        text: "我們將收集的資訊用於以下目的：",
        list: ["帳戶建立、登入、身分驗證及帳戶管理", "網站及服務營運", "提供節點相關支援與配送", "營運測試網及社群", "改善服務品質、錯誤分析及強化安全", "重要通知、活動及促銷資訊發佈", "回應諮詢及處理爭議", "遵守法律義務及保護權利", "偵測與防止不正當使用、詐騙及安全威脅"]
      },
      {
        title: "3. 處理依據",
        text: "我們依據適用法律，根據以下理由處理資訊：",
        list: ["履行契約或簽約前的措施", "公司的正當利益", "使用者的同意", "遵守法律義務", "保護使用者或公眾的重大利益"]
      },
      {
        title: "4. Cookie 及類似技術",
        text: "我們使用 Cookie 以維持登入、分析流量及改善體驗。您可透過瀏覽器設定拒絕，但部分功能可能受限。"
      },
      {
        title: "5. 共用與提供",
        text: "我們在以下情況下可能與第三方共用資訊：",
        list: ["託管、認證、支付、物流等委外服務提供者", "經使用者同意之外部平台連動", "配合法律要求", "保護權利、財產、安全或使用者所必須", "企業併購或資產轉讓時"],
        footer: "我們不會在提供服務所需的範圍外銷售個人資訊。"
      },
      {
        title: "6. 國際傳輸",
        text: "在全域營運中，資訊可能傳輸至居住國以外的國家。我們將盡力確保符合法律要求的保護措施。"
      },
      {
        title: "7. 保留期限",
        text: "資訊僅保留至目的達成，除非：",
        list: ["法律規定的保留義務", "處理爭議、履行契約或安全需求", "額外獲得使用者同意"],
        footer: "不再需要的資訊將經由合理程序刪除或去識別化。"
      },
      {
        title: "8. 使用者權利",
        text: "根據法律，您可能擁有以下權利：",
        list: ["查閱或要求提供副本", "要求更正錯誤資訊", "要求刪除", "限制處理", "反對處理", "撤回同意", "要求資料可攜帶性", "拒絕接收行銷訊息"],
        footer: "我們將在法律與營運許可的範圍內審查並處理您的要求。"
      },
      {
        title: "9. 兒童隱私",
        text: "本服務不對受法律保護的兒童設計。我們不會刻意收集兒童資訊。"
      },
      {
        title: "10. 安全性",
        text: "我們採取合適的技術與管理措施以防止資訊丟失或未授權存取。但沒有系統是絕對安全的。"
      },
      {
        title: "11. 第三方連結",
        text: "對於服務中連結之第三方網站的隱私做法，我們概不負責。請參閱其各自的政策。"
      },
      {
        title: "12. 政策變更",
        text: "本政策可能隨業務或法律變更而修訂。重要變更將於網站公告。「最後更新日期」反映最新版本。"
      },
      {
        id: "contact",
        title: "13. 聯繫我們",
        text: "如有隱私權相關問題，請聯絡：",
        contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" }
      }
    ]
  }
};

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "ko") as string;
  const t = translations[lang] || translations.ko;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      <main className="mx-auto max-w-4xl px-6 py-16 md:px-8">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            <MoveLeft className="h-4 w-4" />
            {t.back}
          </Link>
        </div>

        <header className="mb-12 border-b border-slate-800 pb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-500">
            AirVent
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            {t.updated}
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300 md:text-lg">
            {t.intro}
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-slate-400">
          {t.sections.map((section: any, idx: number) => (
            <section key={idx}>
              <h2 className="mb-6 text-2xl font-bold text-white">{section.title}</h2>
              {section.content && <p className="mb-4">{section.content}</p>}
              
              {section.subsections && (
                <div className="space-y-6">
                  {section.subsections.map((sub: any, sIdx: number) => (
                    <div key={sIdx}>
                      <h3 className="mb-3 text-lg font-semibold text-slate-200">{sub.title}</h3>
                      {sub.text && <p className="mb-3">{sub.text}</p>}
                      {sub.list && (
                        <ul className="list-disc space-y-2 pl-6">
                          {sub.list.map((item: string, iIdx: number) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.text && !section.subsections && <p className={section.list ? "mb-3" : ""}>{section.text}</p>}
              
              {section.list && !section.subsections && (
                <ul className="list-disc space-y-2 pl-6">
                  {section.list.map((item: string, lIdx: number) => (
                    <li key={lIdx}>{item}</li>
                  ))}
                </ul>
              )}

              {section.footer && <p className="mt-4 text-emerald-400 font-medium">{section.footer}</p>}

              {section.contact && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <p className="mb-3">
                    <span className="font-semibold text-slate-200 uppercase text-xs tracking-wider mr-2">Service:</span> {section.contact.service}
                  </p>
                  <p className="mb-3">
                    <span className="font-semibold text-slate-200 uppercase text-xs tracking-wider mr-2">Website:</span>{" "}
                    <a href={`https://${section.contact.website}`} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
                      {section.contact.website}
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200 uppercase text-xs tracking-wider mr-2">Email:</span>{" "}
                    <a href={`mailto:${section.contact.email}`} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
                      {section.contact.email}
                    </a>
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
