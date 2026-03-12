import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const translations: Record<string, any> = {
  ko: {
    back: "메인으로 돌아가기",
    title: "이용약관",
    updated: "최종 업데이트일: 2026년 3월 12일",
    intro: "본 이용약관(이하 “약관”)은 AirVent 및 관련 서비스 운영 주체 (이하 “회사”, “AirVent”, “서비스”)가 제공하는 웹사이트, 계정, 소프트웨어, 애플리케이션, 노드 제품, 테스트넷 기능, 커뮤니티 기능 및 관련 서비스의 이용 조건을 정합니다. 서비스를 이용하거나, 계정을 생성하거나, 노드를 구매 또는 예약하거나, 지갑을 연결하거나, 테스트넷에 참여하는 경우 귀하는 본 약관에 동의하는 것으로 봅니다.",
    sections: [
      { title: "1. 약관의 적용 범위", text: "본 약관은 AirVent 웹사이트, 노드 판매 또는 예약, 계정 서비스, 소프트웨어, 펌웨어, 대시보드, 테스트넷 기능, 베타 기능, 지갑 연동 기능, 커뮤니티 기능 및 회사가 별도로 제공하는 관련 서비스에 적용됩니다." },
      { title: "2. 자격 및 지역 제한", list: ["귀하는 거주 지역에서 계약 체결 가능한 법적 연령이어야 합니다.", "귀하는 제재 대상자 또는 금지된 단체가 아니어야 합니다.", "서비스 이용이 관할법률에 위반되지 않음을 스스로 확인해야 합니다.", "회사는 특정 국가 또는 사용자에 대해 서비스를 제한할 수 있습니다."] },
      { title: "3. 계정 및 보안", list: ["정확한 정보를 제공해야 합니다.", "인증 수단 보안 유지 책임은 본인에게 있습니다.", "의심스러운 활동 발견 시 즉시 통보해야 합니다."] },
      { title: "4. 지갑 연결 및 디지털 자산", list: ["지갑은 비수탁 방식으로 간주됩니다.", "개인키 및 시드 문구 보안 책임은 전적으로 본인에게 있습니다.", "네트워크 수수료 및 블록체인 인프라 위험을 부담합니다."] },
      { title: "5. 노드 제품 및 예약 주문", list: ["사양 및 가격은 수시로 변경될 수 있습니다.", "예약 주문 시 실제 사양이나 배송 시점은 변경될 수 있습니다.", "회사는 합리적 사유로 주문을 거절 또는 취소할 수 있습니다."] },
      { title: "6. 결제 및 세금", list: ["암호화폐 결제는 최종적이며 취소가 어려울 수 있습니다.", "세금 신고 및 납부 의무는 본인에게 있습니다."] },
      { title: "7. 배송 및 통관", list: ["통관 수수료 및 세금은 귀하가 부담합니다.", "수입 규제 준수 여부를 스스로 확인해야 합니다."] },
      { title: "8. 환불 및 보증", text: "별도의 환불/보증 정책에 따릅니다. 디지털 콘텐츠나 라이선스는 환불이 제한될 수 있습니다." },
      { title: "9. 테스트넷 및 베타 기능", list: ["예고 없이 기능이 변경되거나 초기화될 수 있습니다.", "테스트넷 활동은 향후 경제적 보상을 보장하지 않습니다."] },
      { title: "10. 리워드 및 토큰 고지", text: "본 서비스는 투자 자문을 제공하지 않으며 특정 수익률을 보장하지 않습니다." },
      { title: "11. 제3자 서비스", text: "제3자 인프라와 연동될 수 있으나 회사는 그 성능을 보증하지 않습니다." },
      { title: "12. 허용되지 않는 행위", list: ["부정 수급행위", "해킹 및 리버스 엔지니어링", "타인의 권리 침해"] },
      { title: "13. 준법 협조", text: "회사는 필요 시 KYC/AML 자료를 요청할 수 있습니다." },
      { title: "14. 지식재산권", text: "서비스 내 모든 자료의 권리는 회사 또는 원권리자에게 귀속됩니다." },
      { title: "15. 이용자 콘텐츠", text: "귀하가 제출한 피드백은 서비스 개선을 위해 사용될 수 있습니다." },
      { title: "16. 서비스 변경 및 종료", text: "회사는 운영상 필요에 따라 서비스를 언제든 중단하거나 변경할 수 있습니다." },
      { title: "17. 계정 제한", text: "약관 위반 시 즉시 계정이 정지되거나 해지될 수 있습니다." },
      { title: "18. 면책사항", text: "서비스는 '있는 그대로' 제공되며 회사는 특정 결과에 대해 보증하지 않습니다." },
      { title: "19. 책임 제한", text: "간접 손해나 블록체인 네트워크 마비로 인한 손해에 책임을 지지 않습니다." },
      { title: "20. 귀하의 보상 책임", text: "귀하의 위반 행위로 인해 발생한 모든 청구에 대해 회사에 면책해야 합니다." },
      { title: "21. 소비자 보호", text: "강행 법규에 따른 권리는 본 약관으로 배제되지 않습니다." },
      { title: "22. 준거법 및 분쟁 해결", text: "대한민국 법률을 준거법으로 하며 서울 관할 법원에서 해결합니다." },
      { title: "23. 약관 변경", text: "개정 시 웹사이트 고지를 통해 안내합니다." },
      { title: "24. 분리 가능성", text: "일부 조항이 무효라도 나머지 조항은 유효합니다." },
      { title: "25. 문의처", contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" } }
    ]
  },
  en: {
    back: "Back to Main",
    title: "Terms of Service",
    updated: "Last Updated: March 12, 2026",
    intro: "These Terms of Service (\"Terms\") govern the use of the website, software, applications, node products, testnet features, and related services provided by AirVent (\"Company\", \"AirVent\", \"Services\"). By using our services, creating an account, or interacting with our products, you agree to these Terms.",
    sections: [
      { title: "1. Scope", text: "These Terms apply to AirVent websites, node sales, software, dashboards, testnets, and all other services provided by the Company." },
      { title: "2. Eligibility", list: ["You must be of legal age in your jurisdiction.", "You must not be on any sanctions list.", "You are responsible for ensuring compliance with local laws.", "The Company may restrict service in specific regions."] },
      { title: "3. Accounts", list: ["Provision of accurate information is required.", "You are responsible for the security of your account.", "Notify us immediately of any suspicious activity."] },
      { title: "4. Wallets & Assets", list: ["Wallets are non-custodial.", "You are solely responsible for your private keys and seed phrases.", "You bear the risk of network fees and blockchain infrastructure."] },
      { title: "5. Node Products", list: ["Specifications and pricing may change without notice.", "Delivery timelines for pre-orders are estimated.", "We reserve the right to cancel orders for reasonable cause."] },
      { title: "6. Payments", list: ["Crypto payments are final.", "You are responsible for all applicable taxes."] },
      { title: "7. Shipping & Customs", list: ["Customs duties and taxes are your responsibility.", "Verify local import regulations before purchasing."] },
      { title: "8. Warranty & Refunds", text: "Subject to separate refund and warranty policies. Digital licenses may be non-refundable." },
      { title: "9. Testnet & Beta", list: ["Features may be reset or modified without notice.", "Testnet activities do not guarantee future financial compensation."] },
      { title: "10. Rewards Notice", text: "The service does not provide investment advice or guarantee specific returns." },
      { title: "11. Third-party Services", text: "Interactions with 3rd party infra are at your own risk." },
      { title: "12. Prohibited Conduct", list: ["Exploiting rewards", "Hacking or reverse engineering", "Infringing on the rights of others"] },
      { title: "13. Compliance", text: "KYC/AML documentation may be requested if required by law." },
      { title: "14. Intellectual Property", text: "All service materials are owned by the Company or its licensors." },
      { title: "15. User Content", text: "Feedback provided may be used to improve our services." },
      { title: "16. Service Changes", text: "The Company may suspend or modify services for operational needs." },
      { title: "17. Account Restriction", text: "Violation of Terms may lead to immediate account termination." },
      { title: "18. Disclaimers", text: "Services are provided 'as is' without specific guarantees." },
      { title: "19. Limitation of Liability", text: "No liability for indirect damages or blockchain network failures." },
      { title: "20. Indemnification", text: "You agree to indemnify the Company for claims arising from your breach." },
      { title: "21. Consumer Rights", text: "Mandatory consumer laws take precedence over these Terms." },
      { title: "22. Governing Law", text: "Governed by the laws of the Republic of Korea." },
      { title: "23. Amendments", text: "Revised Terms will be posted on the website." },
      { title: "24. Severability", text: "Invalidity of some terms does not affect the remainder." },
      { title: "25. Contact", contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" } }
    ]
  },
  ja: {
    back: "メインに戻る",
    title: "利用規約",
    updated: "最終更新日: 2026年3月12日",
    intro: "本利用規約（以下「本規約」）は、AirVent（以下「当社」「AirVent」「サービス」）が提供するウェブサイト、ソフトウェア、アプリケーション、ノード製品、テストネット機能、および関連サービスの利用条件を定めるものです。サービスのご利用を開始することで、本規約に同意したものとみなされます。",
    sections: [
      { title: "1. 適用範囲", text: "ウェブサイト、ノード販売、ソフトウェア、ダッシュボード、テストネット、その他すべての提供サービスに適用されます。" },
      { title: "2. 制限事項", list: ["居住地の法律で契約可能な年齢である必要があります。", "制裁対象リストに含まれていないことが条件です。", "現地法規の遵守は利用者の責任です。", "特定の地域でサービスを制限する場合があります。"] },
      { title: "3. アカウント", list: ["正確な情報の提供義務があります。", "セキュリティ管理は利用者の自己責任です。", "不正アクセス発見時は直ちに当社へ通知してください。"] },
      { title: "4. ウォレット", list: ["ウォレットは非カストディ型として扱われます。", "秘密鍵やシードフレーズの管理は全責任を負ってください。", "ネットワーク手数料やブロックチェーンの不確実性を承諾してください。"] },
      { title: "5. ノード製品", list: ["仕様や価格は予告なく変更される場合があります。", "予約注文の納期は目安であり、変更の可能性があります。", "合理的な理由により注文をキャンセルする権利を留保します。"] },
      { title: "6. 決済", list: ["仮想通貨決済は最終的であり、キャンセルが困難な場合があります。", "税務申告は利用者の義務です。"] },
      { title: "7. 配送・通関", list: ["関税や諸税は利用者の負担となります。", "輸入規制の適合性は自己確認が必要です。"] },
      { title: "8. 返金・保証", text: "別途定める返金・保証ポリシーに従います。デジタルコンテンツは返金不可となる場合があります。" },
      { title: "9. テストネット", list: ["機能は予告なくリセット・変更される場合があります。", "テストネットへの参加が将来の経済的報酬を保証するものではありません。"] },
      { title: "10. リワード告知", text: "投資助言や特定の収益を保証するものではありません。" },
      { title: "11. 第三者サービス", text: "第三者インフラに関するリスクは利用者が負うものとします。" },
      { title: "12. 禁止行為", list: ["不正なリワード取得", "ハッキングやリバースエンジニアリング", "他者の権利侵害"] },
      { title: "13. コンプライアンス", text: "必要に応じてKYC/AML資料を請求する場合があります。" },
      { title: "14. 知的財産権", text: "すべての資料は当社または正当な権利者に帰属します。" },
      { title: "15. ユーザーからの資料", text: "提供されたフィードバックは製品改善に活用される場合があります。" },
      { title: "16. サービスの変更", text: "運営上の必要性により、予告なく中断・変更する場合があります。" },
      { title: "17. アカウント制限", text: "規約違反時はアカウントを直ちに停止または解約します。" },
      { title: "18. 免責事項", text: "サービスは「現状有姿」で提供され、特定の成果を保証しません。" },
      { title: "19. 責任制限", text: "間接損害やブロックチェーンの麻痺に伴う損害について責任を負いません。" },
      { title: "20. 賠償責任", text: "利用者の違反に起因する請求について、当社を免責するものとします。" },
      { title: "21. 消費者保護", text: "各国の強行法規による権利は本規約により排除されません。" },
      { title: "22. 準拠法", text: "大韓民国法を準拠法とし、ソウルの管轄裁判所にて解決します。" },
      { title: "23. 規約の変更", text: "改定時はウェブサイトでの告知により案内します。" },
      { title: "24. 分離可能性", text: "一部が無効となっても、他の条項の効力は維持されます。" },
      { title: "25. 連絡先", contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" } }
    ]
  },
  "zh-TW": {
    back: "返回首頁",
    title: "使用條款",
    updated: "最後更新日期：2026年3月12日",
    intro: "本使用條款（下稱「本條款」）旨在規範 AirVent（下稱「公司」、「AirVent」、「服務」）提供的網站、軟體、應用程式、節點產品、測試網功能及相關服務。使用本服務即代表您同意本條款。",
    sections: [
      { title: "1. 適用範圍", text: "本條款適用於所有官方網站、節點銷售、軟體、儀表板、測試網及各項服務。" },
      { title: "2. 資格限制", list: ["您必須具備當地法律規定的簽約年齡。", "您不得為任何受制裁的人員或組織。", "您需自行確認遵循當地法規。", "公司保留在特定地區限制服務的權利。"] },
      { title: "3. 帳戶安全", list: ["需提供正確資訊。", "您負有維護帳戶與認證手段安全的責任。", "發現可疑行為應立即通知。"] },
      { title: "4. 錢包與資產", list: ["錢包採非代管模式。", "私鑰與助記詞之保管完全由您自行負責。", "您需承擔網路手續費與區塊鏈基礎設施之風險。"] },
      { title: "5. 節點產品", list: ["規格與價格可能隨時變更。", "預購交期為預估值，可能因故調整。", "公司保留因合理原因取消訂單的權利。"] },
      { title: "6. 支付與稅務", list: ["加密貨幣支付為最終性質，難以取消。", "稅務申報與繳納由您自行負責。"] },
      { title: "7. 配送與通關", list: ["進口關稅與稅金由您負擔。", "需自行確認是否符合當地進口規定。"] },
      { title: "8. 退款與保固", text: "依據個別之退款與保固政策。數位授權可能無法退款。" },
      { title: "9. 測試網與測試版", list: ["功能可能隨時重置或變更。", "測試網參與不保證未來之經濟回報。"] },
      { title: "10. 獎勵告知", text: "本服務不提供投資建議，亦不保證收益率。" },
      { title: "11. 第三方服務", text: "對第三方基礎設施之依賴風險由您自行承擔。" },
      { title: "12. 禁止行為", list: ["異常刷獎勵行為", "駭客攻擊或逆向工程", "侵害他人權利"] },
      { title: "13. 合規協助", text: "必要時公司可要求提供 KYC/AML 資料。" },
      { title: "14. 智慧財產權", text: "所有資料之權利歸屬公司或原權利人。" },
      { title: "15. 使用者反饋", text: "提供之反饋可能用於產品改善。" },
      { title: "16. 服務變更", text: "公司可視營運需要隨時中斷或變更服務。" },
      { title: "17. 帳戶限制", text: "違反條款時，帳戶可能被立即停用或解約。" },
      { title: "18. 免責聲明", text: "服務採「現狀」提供，不保證特定結果。" },
      { title: "19. 責任限制", text: "對於間接損害或因區塊鏈故障造成之損失概不負責。" },
      { title: "20. 賠償責任", text: "因您的違規行為致使公司受損時，應予補償。" },
      { title: "21. 消費者保護", text: "各國強制法規之權利不因本條款而排除。" },
      { title: "22. 準據法", text: "以大韓民國法律為準據法，並由首爾法院管轄。" },
      { title: "23. 條款變更", text: "修訂時將於網站公告。" },
      { title: "24. 分離性", text: "部分條款無效不影響其餘條款之效力。" },
      { title: "25. 聯繫方式", contact: { service: "AirVent", website: "airvent.ai", email: "info@airventinc.co.kr" } }
    ]
  }
};

export default function TermsPage() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "ko"; const lang = currentLang.startsWith("ko") ? "ko" : currentLang.startsWith("ja") ? "ja" : currentLang.startsWith("zh") ? "zh-TW" : "en";
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
              {section.text && <p className={section.list ? "mb-4" : ""}>{section.text}</p>}
              {section.list && (
                <ul className="list-disc space-y-2 pl-6">
                  {section.list.map((item: string, lIdx: number) => (
                    <li key={lIdx}>{item}</li>
                  ))}
                </ul>
              )}
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
