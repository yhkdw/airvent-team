import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const translations: Record<string, any> = {
  ko: {
    back: "메인으로 돌아가기",
    title: "보증, 환불 및 배송 정책",
    updated: "최종 업데이트일: 2026년 3월 12일",
    intro: "본 정책은 AirVent가 판매하는 노드 제품 및 관련 액세서리에 대한 제한적 하드웨어 보증 범위, 환불 절차 및 배송 조건을 설명합니다. 본 정책은 관련 법령상 소비자에게 부여되는 강행규정상 권리를 제한하지 않습니다.",
    sections: [
      {
        id: 1,
        title: "1. 제한적 하드웨어 보증",
        content: "AirVent는 별도 표시가 없는 한, 원구매자에게 배송 완료일 또는 구매 증빙일 중 확인 가능한 기준일로부터 1년 동안 정상적인 사용 조건에서 발생한 제조상 결함 또는 하드웨어 하자에 대해 제한적 보증을 제공합니다. 이 보증은 제품 페이지, 포장, 보증서 또는 별도 공지에서 더 긴 보증기간을 약속한 경우 그 더 유리한 기준을 따를 수 있습니다."
      },
      {
        id: 2,
        title: "2. 보증 대상",
        content: "보증기간 내 정상 사용 중 발생한 다음과 같은 문제는 보증 대상이 될 수 있습니다.",
        list: [
          "전원이 정상적으로 켜지지 않는 하드웨어 결함",
          "기본 기능이 작동하지 않는 제조상 결함",
          "출고 시점부터 존재한 조립 불량 또는 부품 결함",
          "센서, 화면, 버튼, 포트, 무선 연결 모듈 등의 비정상 동작",
          "배송 중 발생한 초기 파손으로 확인되는 경우"
        ]
      },
      {
        id: 3,
        title: "3. 보증에서 제외되는 경우",
        content: "다음과 같은 경우에는 관련 법령상 허용되는 범위에서 무상보증 대상이 아닐 수 있습니다.",
        list: [
          "이용자 과실, 충격, 침수, 낙하, 화재, 과전압, 오염, 부식",
          "비정상적인 전원 사용, 부적절한 설치 환경, 권장 사용 범위 초과",
          "무단 분해, 개조, 수리 또는 비공인 부품 사용",
          "소프트웨어 해킹, 루팅, 펌웨어 변조, 비공식 프로그램 설치",
          "소모품의 자연 소모, 외관상 마모, 스크래치, 변색, 오염",
          "천재지변, 정전, 낙뢰, 통신장애, 외부 서비스 장애",
          "지갑, 블록체인 네트워크, 테스트넷, 제3자 앱 또는 서버 장애",
          "제품의 정상 기능과 무관한 경미한 외관상 차이"
        ]
      },
      {
        id: 4,
        title: "4. 초기 불량(DOA) 및 환불",
        content: "제품 수령 직후 발견되는 중대한 하드웨어 이상, 전원 불능, 심각한 파손 또는 오배송은 초기 불량으로 접수될 수 있습니다.",
        list: [
          "초기 불량 접수 기한은 제품 수령일로부터 7일 이내입니다.",
          "초기 불량으로 확인되면 우선적으로 교환 또는 재배송을 제공할 수 있으며, 재고가 없으면 수리 또는 환불로 처리할 수 있습니다.",
          "단순 변심에 의한 환불의 경우, 제품 포장이 훼손되지 않고 재판매가 가능한 상태여야 하며 왕복 배송비는 이용자가 부담합니다.",
          "초기 불량 여부 확인을 위해 사진, 영상, 주문번호, 시리얼 정보 또는 제품 상태 확인이 필요한 추가 자료를 요청할 수 있습니다."
        ]
      },
      {
        id: 5,
        title: "5. 보증 서비스 방식",
        content: "회사는 보증 대상 여부를 확인한 후 다음 중 하나의 방식으로 처리할 수 있습니다.",
        list: [
          "무상 수리",
          "동일 또는 동등 성능의 교체품 제공",
          "대체 부품 교환",
          "재고 부족 또는 수리 불가 시 환불 또는 부분 환불"
        ],
        footer: "보증 처리 방법은 결함의 성격, 부품 수급, 재고 상태, 모델 지속 여부에 따라 달라질 수 있습니다."
      },
      {
        id: 6,
        title: "6. 보증 및 환불 신청 절차",
        list: [
          "주문번호, 제품 모델명, 증상 설명과 함께 고객지원에 문의합니다.",
          "문제 확인을 위해 사진, 영상, 로그 또는 추가 정보를 요청할 수 있습니다.",
          "회사가 필요하다고 판단하는 경우 제품 회수를 요청할 수 있습니다.",
          "검수 후 보증 대상 여부와 처리 방식을 안내합니다."
        ]
      },
      {
        id: 7,
        title: "7. 배송 정책 및 비용",
        list: [
          "국내 일반 배송은 무상으로 제공합니다.",
          "해외 주문의 최초 발송에 필요한 국제 배송비는 이용자가 부담합니다.",
          "회사가 승인한 보증 수리, 초기 불량, 교환 처리 건의 해외 반송비는 AirVent가 부담합니다.",
          "보증 제외 사유로 판정된 경우, 점검비, 수리비, 부품비 및 추가 배송비는 이용자에게 청구될 수 있습니다.",
          "배송지 오류 또는 이용자 부재로 인한 반송 및 재배송 비용은 이용자가 부담합니다."
        ]
      },
      {
        id: 8,
        title: "8. 설치 및 사용 환경 관련 주의",
        list: [
          "제품은 제품 설명서, 안전 가이드, 전원 규격 및 권장 사용 환경에 맞게 설치·사용해야 합니다.",
          "회사 또는 회사가 지정한 설치 지원이 제공되는 경우, 설치 하자에 대한 별도 기준이 적용될 수 있습니다.",
          "이용자 임의 설치 또는 외부 시공으로 인한 문제는 보증 범위에서 제외될 수 있습니다."
        ]
      },
      {
        id: 9,
        title: "9. 소프트웨어, 펌웨어, 테스트넷 기능",
        content: "제품은 소프트웨어, 펌웨어, 대시보드, 계정 시스템, 네트워크 기능, 테스트넷 기능 또는 제3자 블록체인 인프라와 함께 작동할 수 있습니다. 다만 다음 사항은 제한적 하드웨어 보증과 구분됩니다.",
        list: [
          "베타 기능, 테스트넷 기능, 포인트, 리워드 또는 토큰 관련 기능은 변경·중단될 수 있습니다.",
          "네트워크 혼잡, 제3자 지갑 문제, RPC 장애, 체인 포크, 브리지 오류, 토큰 가치 변동 등은 하드웨어 보증의 대상이 아닙니다.",
          "회사는 합리적인 범위에서 업데이트와 버그 수정을 제공할 수 있으나, 특정 기능의 영구적 유지나 경제적 가치 발생을 보장하지 않습니다."
        ]
      },
      {
        id: 10,
        title: "10. 소비자 권리",
        content: "본 보증정책은 관련 법령상 소비자에게 인정되는 권리 또는 소비자분쟁해결기준상 더 유리한 보상 기준을 배제하기 위한 것이 아닙니다. 본 정책과 관련 법령 또는 적용 가능한 소비자 보호 기준이 충돌하는 경우, 소비자에게 더 유리한 기준이 우선할 수 있습니다."
      },
      {
        id: 11,
        title: "11. 문의처",
        contactGroups: [
          { label: "Service", value: "AirVent" },
          { label: "Website", value: "airvent.ai", link: "https://airvent.ai" },
          { label: "Email", value: "info@airventinc.co.kr", link: "mailto:info@airventinc.co.kr" }
        ]
      }
    ]
  },
  en: {
    back: "Back to Main",
    title: "Warranty, Refund & Shipping Policy",
    updated: "Last Updated: March 12, 2026",
    intro: "This policy describes the limited hardware warranty coverage, refund procedures, and shipping conditions for products sold by AirVent. This policy does not limit any mandatory consumer rights granted by applicable laws.",
    sections: [
      {
        id: 1,
        title: "1. Limited Hardware Warranty",
        content: "AirVent provides a limited warranty for manufacturing defects or hardware failures occurring under normal use for a period of 1 year from the delivery date or proof of purchase, whichever is verifiable. This warranty may follow more favorable terms if a longer period is promised on product pages, packaging, or separate notices."
      },
      {
        id: 2,
        title: "2. Coverage",
        content: "The following issues occurring under normal use within the warranty period are covered:",
        list: [
          "Hardware defects preventing the device from powering on",
          "Manufacturing defects where core functions do not operate",
          "Assembly defects or component failures existing from the time of shipment",
          "Abnormal operation of sensors, screen, buttons, ports, or wireless modules",
          "Initial damage during transit, if confirmed"
        ]
      },
      {
        id: 3,
        title: "3. Exclusions",
        content: "The following cases may not be covered by the free warranty to the extent permitted by law:",
        list: [
          "User negligence, impact, water damage, drops, fire, overvoltage, contamination, or corrosion",
          "Abnormal power usage, improper installation environment, or exceeding recommended usage",
          "Unauthorized disassembly, modification, repair, or use of non-certified parts",
          "Software hacking, rooting, firmware manipulation, or installation of unofficial programs",
          "Natural wear of consumables, cosmetic wear, scratches, discoloration, or stains",
          "Force majeure, power outages, lightning, communication failures, or external service outages",
          "Wallets, blockchain networks, testnets, third-party apps, or server failures",
          "Minor cosmetic differences unrelated to the product's normal functionality"
        ]
      },
      {
        id: 4,
        title: "4. Dead on Arrival (DOA) & Refunds",
        content: "Major hardware issues, failure to power on, severe damage, or misdelivery discovered immediately after receipt can be processed as DOA.",
        list: [
          "The deadline for reporting DOA is within 7 days of product receipt.",
          "If confirmed as DOA, exchange or redelivery will be prioritized. Repair or refund may be offered if stock is unavailable.",
          "For change-of-mind refunds, packaging must be intact and resalable. The user bears round-trip shipping costs.",
          "Additional data (photos, videos, order number, serial info) may be requested to verify DOA status."
        ]
      },
      {
        id: 5,
        title: "5. Warranty Service Methods",
        content: "The company may process warranty claims in one of the following ways after verification:",
        list: [
          "Free repair",
          "Provision of a replacement of the same or equivalent performance",
          "Replacement of specific parts",
          "Refund or partial refund if out of stock or irreparable"
        ],
        footer: "Processing methods may vary based on defect nature, parts availability, inventory, and model continuity."
      },
      {
        id: 6,
        title: "6. Application Procedure",
        list: [
          "Contact support with your order number, model name, and symptom description.",
          "Provide requested photos, videos, logs, or additional info for verification.",
          "The company may request product return if deemed necessary.",
          "Status and processing method will be guided after inspection."
        ]
      },
      {
        id: 7,
        title: "7. Shipping Policy & Costs",
        list: [
          "Standard domestic shipping is provided free of charge.",
          "International shipping for initial orders is borne by the user.",
          "Return shipping for authorized warranty repairs/DOA exchanges is borne by AirVent.",
          "Inspection, repair, parts, and additional shipping fees may be charged if deemed out-of-warranty.",
          "Users bear costs for returns/redelivery due to address errors or recipient absence."
        ]
      },
      {
        id: 8,
        title: "8. Installation & Environment",
        list: [
          "Products must be installed/used according to manuals, safety guides, and power specifications.",
          "Separate standards may apply for installation defects if support was provided/designated by the company.",
          "Issues arising from unauthorized installation or external construction are excluded."
        ]
      },
      {
        id: 9,
        title: "9. Software, Firmware & Testnet",
        content: "Products work with software, firmware, dashboards, networks, and blockchain infrastructure. Note that:",
        list: [
          "Beta features, testnets, points, rewards, or token-related features may change or stop.",
          "Network congestion, wallet issues, RPC failures, forks, bridge errors, or token volatility are not covered.",
          "The company provides reasonable updates but does not guarantee permanent feature availability or economic value."
        ]
      },
      {
        id: 10,
        title: "10. Consumer Rights",
        content: "This policy does not exclude rights or compensation standards mandated by applicable laws. If this policy conflicts with mandatory consumer protection standards, the more favorable standard for the consumer applies."
      },
      {
        id: 11,
        title: "11. Contact",
        contactGroups: [
          { label: "Service", value: "AirVent" },
          { label: "Website", value: "airvent.ai", link: "https://airvent.ai" },
          { label: "Email", value: "info@airventinc.co.kr", link: "mailto:info@airventinc.co.kr" }
        ]
      }
    ]
  },
  ja: {
    back: "メインに戻る",
    title: "保証、払い戻し、および配送に関するポリシー",
    updated: "最終更新日: 2026年3月12日",
    intro: "本ポリシーは、AirVentが販売する製品の限定的ハードウェア保証範囲、払い戻し手続き、および配送条件について説明するものです。本ポリシーは、関連法令に定める消費者の強行規定上の権利を制限しません。",
    sections: [
      {
        id: 1,
        title: "1. 限定的ハードウェア保証",
        content: "AirVentは、元の購入者に対し、配送完了日または購入証明日から1年間、通常の動作環境で発生した製造上の欠陥またはハードウェアの不具合について限定的な保証を提供します。製品ページ等でより長い期間が約束されている場合は、その有利な基準に従います。"
      },
      {
        id: 2,
        title: "2. 保証対象",
        content: "保証期間内の通常使用中に発生した以下の問題は、保証の対象となる場合があります。",
        list: [
          "電源が入らないハードウェアの欠陥",
          "基本機能が動作しない製造上の欠陥",
          "出荷時点から存在した組み立て不良または部品の欠陥",
          "センサー、画面、ボタン、無線モジュール等の異常動作",
          "配送中に発生した初期破損であることが確認された場合"
        ]
      },
      {
        id: 3,
        title: "3. 保証の対象外",
        content: "以下の場合、法令で許容される範囲において、無償保証の対象とならない場合があります。",
        list: [
          "不注意、衝撃、浸水、落下、火災、過電圧、汚染、腐食",
          "異常な電源使用、不適切な設置環境、推奨範囲外の使用",
          "無断分解、改造、修理、または非公認部品の使用",
          "ハッキング、ルート化、ファームウェア改ざん、非公式ソフトの使用",
          "消耗品の自然な消耗、外観の摩耗、傷、変色",
          "天災地変、停電、通信障害、外部サービス障害",
          "ウォレット、ブロックチェーン、テストネット、サードパーティの障害",
          "製品の正常な機能とは無関係な軽微な外観上の違い"
        ]
      },
      {
        id: 4,
        title: "4. 初期不良（DOA）および払い戻し",
        content: "製品受領直後に発見された重大な異常、電源が入らない、深刻な破損等は初期不良として受け付けられます。",
        list: [
          "申告期限は製品受領日から7日以内です。",
          "初期不良と確認された場合、交換または再配送を優先し、在庫がない場合は修理または払い戻しを行います。",
          "自己都合による払い戻しの場合、未開封・再販可能である必要があり、往復送料は利用者が負担します。",
          "初期不良の確認のため、写真や注文番号等の追加資料をお願いする場合があります。"
        ]
      },
      {
        id: 5,
        title: "5. 保証サービスの方式",
        content: "当社は保証対象の有無を確認した後、以下のいずれかの方法で処理を行います。",
        list: [
          "無償修理",
          "同一または同等の性能の代替品の提供",
          "代替部品の交換",
          "在庫不足または修理不可の場合、払い戻しまたは一部払い戻し"
        ],
        footer: "処理方法は欠陥の性質、部品供給、在庫状況、モデルの継続性により異なる場合があります。"
      },
      {
        id: 6,
        title: "6. 申請手続き",
        list: [
          "注文番号、モデル名、症状を添えてサポートにお問い合わせください。",
          "確認のため、写真、動画、ログ等の提供をお願いする場合があります。",
          "必要と判断した場合、製品の回収をお願いする場合があります。",
          "検査後、保証の有無と処理方法についてご案内します。"
        ]
      },
      {
        id: 7,
        title: "7. 配送ポリシーおよび費用",
        list: [
          "国内標準配送は無償です。",
          "海外注文の初回発送に必要な国際配送料は利用者が負担します。",
          "承認された保証修理や交換に伴う海外返送費用はAirVentが負担します。",
          "保証対象外と判定された場合、諸費用および追加配送料を利用者に請求する場合があります。",
          "住所の間違い等による返送・再配送の費用は利用者が負担します。"
        ]
      },
      {
        id: 8,
        title: "8. 設置および利用環境",
        list: [
          "説明書、安全ガイド、電源規格に従って使用する必要があります。",
          "当社が指定した設置サポート以外での工事に起因する問題は対象外です。"
        ]
      },
      {
        id: 9,
        title: "9. ソフトウェア、ファームウェア、テストネット",
        content: "製品はソフトウェア、ネットワーク、ブロックチェーンとともに動作します。以下にご注意ください。",
        list: [
          "ベータ機能、テストネット、リワード等は変更・停止される場合があります。",
          "ネットワーク混雑、ウォレットの問題、トークンの価値変動は保証外です。",
          "合理的な範囲で更新を提供しますが、特定機能の永続的な維持を保証するものではありません。"
        ]
      },
      {
        id: 10,
        title: "10. 消費者の権利",
        content: "本ポリシーは法令により認められた権利を排除するものではありません。強制的な消費者保護基準が優先されます。"
      },
      {
        id: 11,
        title: "11. お問い合わせ先",
        contactGroups: [
          { label: "サービス", value: "AirVent" },
          { label: "ウェブサイト", value: "airvent.ai", link: "https://airvent.ai" },
          { label: "メール", value: "info@airventinc.co.kr", link: "mailto:info@airventinc.co.kr" }
        ]
      }
    ]
  },
  "zh-TW": {
    back: "返回首頁",
    title: "保固、退款及運送政策",
    updated: "最後更新日期：2026年3月12日",
    intro: "本政策說明 AirVent 銷售產品之有限硬體保固範圍、退款程序及運送條件。本政策不限制法律賦予消費者的任何強制性權利。",
    sections: [
      {
        id: 1,
        title: "1. 有限硬體保固",
        content: "AirVent 自送達日或購買憑證日起 1 年內，針對正常使用下發生的製造缺陷或硬體故障提供有限保固。若產品頁面等處承諾更長期限，則按有利於消費者的標準執行。"
      },
      {
        id: 2,
        title: "2. 保固範圍",
        content: "保固期內正常使用下發生的下列問題均屬保固範圍：",
        list: [
          "導致設備無法開機的硬體缺陷",
          "核心功能無法運作的製造缺陷",
          "出貨時即存在的組裝不良或零件缺陷",
          "傳感器、螢幕、按鈕、無線模組的運作異常",
          "經確認為運送途中發生的初始毀損"
        ]
      },
      {
        id: 3,
        title: "3. 非保固範圍",
        content: "在法律允許範圍內，下列情況可能不在免費保固範圍內：",
        list: [
          "使用者疏忽、撞擊、浸水、掉落、火災、電壓過高、污染或腐蝕",
          "電源使用異常、安裝環境不當或超過建議範圍",
          "未經授權的拆解、改裝、維修或使用非原廠零件",
          "駭客攻擊、Root、韌體竄改或安裝非官方程式",
          "耗材自然耗損、外觀磨損、刮痕、褪色或污垢",
          "天災人禍、停電、通訊中斷或外部服務中斷",
          "錢包、區塊鏈、測試網、第三方應用或伺服器故障",
          "與產品正常功能無關的輕微外觀差異"
        ]
      },
      {
        id: 4,
        title: "4. 新品不良 (DOA) 及退款",
        content: "收貨後立即發現的重大異常、無法開機、嚴重損壞等可按 DOA 處理。",
        list: [
          "申報期限為收貨後 7 日內。",
          "若確認為 DOA，將優先提供更換，若無庫存則進行維修或退款。",
          "因個人因素退款，包裝須完整且可再次銷售，使用者須承擔來回運費。",
          "可能需要提供照片、訂單編號等額外資料以核實狀態。"
        ]
      },
      {
        id: 5,
        title: "5. 保固服務方式",
        content: "公司在核實資格後，會採取以下方式之一處理：",
        list: [
          "免費維修",
          "提供相同或同等性能的替換品",
          "更換特定零件",
          "若無庫存或無法維修，則提供退款或部分退款"
        ],
        footer: "處理方式可能因缺陷性質、零件供應、庫存及產品週期而異。"
      },
      {
        id: 6,
        title: "6. 申請程序",
        list: [
          "請聯繫客服並附上訂單編號、型號及問題描述。",
          "請提供要求的照片、影片、日誌等以便核實。",
          "公司若認為必要，可能會要求收回產品。",
          "檢測後將告知保固資格及處理方式。"
        ]
      },
      {
        id: 7,
        title: "7. 運送政策及費用",
        list: [
          "免費提供國內標準運送。",
          "初始訂單的國際運費由使用者負擔。",
          "經授權的維修或 DOA 更換之退貨運費由 AirVent 負擔。",
          "若判定為非保固案件，可能收取檢測費、維修費及額外運費。",
          "因地址錯誤等導致的退件或重寄費用由使用者負擔。"
        ]
      },
      {
        id: 8,
        title: "8. 安裝及環境",
        list: [
          "須依照說明書、安全指南及電源規範使用。",
          "非公司指定之安裝支援所引起的各項問題不屬保固範圍。"
        ]
      },
      {
        id: 9,
        title: "9. 軟體、韌體及測試網",
        content: "產品需配合軟體、網路及區塊鏈基礎設施運作。請注意：",
        list: [
          "測試功能、測試網、獎勵等可能隨時變更或停止。",
          "網路壅塞、錢包問題、代幣價值波動不屬保固範圍。",
          "公司提供合理更新，但不保證特定功能的永久可用性。"
        ]
      },
      {
        id: 10,
        title: "10. 消費者權利",
        content: "本政策不排除法律賦予消費者的權利。強制性消費者保護標準優先適用。"
      },
      {
        id: 11,
        title: "11. 聯繫方式",
        contactGroups: [
          { label: "服務", value: "AirVent" },
          { label: "網站", value: "airvent.ai", link: "https://airvent.ai" },
          { label: "電子郵件", value: "info@airventinc.co.kr", link: "mailto:info@airventinc.co.kr" }
        ]
      }
    ]
  }
};

export default function WarrantyPage() {
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
              {section.list && (
                <ul className={`${idx === 5 ? 'list-decimal' : 'list-disc'} space-y-2 pl-6`}>
                  {section.list.map((item: string, lIdx: number) => (
                    <li key={lIdx}>{item}</li>
                  ))}
                </ul>
              )}
              {section.footer && <p className="mt-4">{section.footer}</p>}
              {section.contactGroups && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="space-y-3">
                    {section.contactGroups.map((group: any, gIdx: number) => (
                      <p key={gIdx} className="flex items-center gap-4">
                        <span className="w-20 text-sm font-bold text-slate-500 uppercase">{group.label}</span>
                        {group.link ? (
                          <a href={group.link} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30">
                            {group.value}
                          </a>
                        ) : (
                          <span className="text-white font-semibold">{group.value}</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
