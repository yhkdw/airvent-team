import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      <main className="mx-auto max-w-4xl px-6 py-16 md:px-8">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            <MoveLeft className="h-4 w-4" />
            메인으로 돌아가기
          </Link>
        </div>

        <header className="mb-12 border-b border-slate-800 pb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-500">
            AirVent
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            이용약관
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            최종 업데이트일: 2026년 3월 12일
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300 md:text-lg">
            본 이용약관(이하 “약관”)은 AirVent 및 관련 서비스 운영 주체
            (이하 “회사”, “AirVent”, “서비스”)가 제공하는 웹사이트, 계정,
            소프트웨어, 애플리케이션, 노드 제품, 테스트넷 기능, 커뮤니티 기능
            및 관련 서비스의 이용 조건을 정합니다. 서비스를 이용하거나,
            계정을 생성하거나, 노드를 구매 또는 예약하거나, 지갑을 연결하거나,
            테스트넷에 참여하는 경우 귀하는 본 약관에 동의하는 것으로 봅니다.
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">1. 약관의 적용 범위</h2>
            <p>
              본 약관은 AirVent 웹사이트, 노드 판매 또는 예약, 계정 서비스,
              소프트웨어, 펌웨어, 대시보드, 테스트넷 기능, 베타 기능,
              지갑 연동 기능, 커뮤니티 기능 및 회사가 별도로 제공하는 관련
              서비스에 적용됩니다. 특정 서비스에 별도 조건이 있는 경우,
              해당 별도 조건이 본 약관에 우선할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">2. 자격 및 지역 제한</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                귀하는 귀하가 거주하는 지역에서 서비스 이용 및 계약 체결이
                가능한 법적 연령과 능력을 갖추고 있어야 합니다.
              </li>
              <li>
                귀하는 제재 대상자, 금지된 단체, 또는 관련 법령상 거래가
                제한되는 자가 아니어야 합니다.
              </li>
              <li>
                귀하는 서비스 이용, 노드 구매, 디지털 자산 사용, 지갑 연결,
                테스트넷 참여가 귀하의 관할 지역 법률에 위반되지 않음을
                스스로 확인해야 합니다.
              </li>
              <li>
                회사는 특정 국가, 지역, 지갑 주소, IP 또는 사용자에 대해
                서비스 접근, 구매, 배송, 테스트넷 참여 또는 디지털 기능 제공을
                제한하거나 거절할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">3. 계정 및 보안</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                일부 기능은 계정 생성이 필요할 수 있습니다. 귀하는 정확하고
                최신의 정보를 제공해야 합니다.
              </li>
              <li>
                귀하는 계정, 비밀번호, 인증 수단 및 연결된 이메일의 보안을
                스스로 유지할 책임이 있습니다.
              </li>
              <li>
                회사는 계정 보안, 부정 사용 방지, 법적 준수 또는 운영상 필요에
                따라 본인확인 또는 추가 정보를 요구할 수 있습니다.
              </li>
              <li>
                귀하의 계정 또는 인증 수단이 무단 사용되었다고 판단되는 경우
                즉시 회사에 알려야 합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">4. 지갑 연결 및 디지털 자산</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                서비스의 일부 기능은 외부 지갑 또는 블록체인 계정 연결을
                요구하거나 허용할 수 있습니다.
              </li>
              <li>
                회사가 명시적으로 수탁(custodial) 서비스를 제공한다고 밝히지
                않는 한, 귀하의 지갑은 비수탁 방식으로 간주되며, 개인키,
                시드 문구, 서명 행위 및 지갑 보안에 대한 책임은 전적으로
                귀하에게 있습니다.
              </li>
              <li>
                회사는 귀하의 개인키, 시드 문구 또는 지갑 접근 권한을
                복구해드릴 수 없으며, 귀하의 지갑 손실 또는 오사용에 대해
                책임지지 않습니다.
              </li>
              <li>
                귀하는 블록체인 네트워크 수수료, 가스비, 슬리피지, 브리지,
                RPC, 노드, 검증자, 지갑 제공자, 거래소 또는 기타 제3자
                인프라와 관련된 비용과 위험을 부담합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              5. 노드 제품, 예약 주문 및 구매
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                회사는 노드 제품 또는 관련 액세서리를 판매, 예약 판매,
                한정 수량 판매 또는 베타 형태로 제공할 수 있습니다.
              </li>
              <li>
                제품의 가격, 사양, 구성품, 제공 시기, 배송 가능 국가 및
                판매 조건은 수시로 변경될 수 있습니다.
              </li>
              <li>
                예약 주문 또는 초기 판매의 경우, 실제 출고 시점, 하드웨어
                사양, 패키지 구성, 펌웨어 기능 및 지원 범위는 변경될 수
                있습니다.
              </li>
              <li>
                회사는 주문 수락 전후를 불문하고 재고 부족, 결제 문제,
                배송 제한, 규제 준수, 의심 거래, 오기재, 시스템 오류 또는
                기타 합리적 사유로 주문을 거절, 제한 또는 취소할 수 있습니다.
              </li>
              <li>
                주문이 취소되는 경우, 관련 법령 또는 별도 환불정책에 따라
                결제금 환급 여부 및 방식이 결정됩니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              6. 결제, 세금 및 암호화폐 결제
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                귀하는 주문 시 표시되는 가격, 수수료, 세금, 배송비 및 기타
                부대비용을 부담해야 합니다.
              </li>
              <li>
                법령 또는 회사가 명시적으로 허용하는 경우를 제외하고,
                암호화폐 또는 디지털 자산으로 이루어진 결제는 최종적일 수
                있으며, 처리 완료 후 취소 또는 되돌리기가 제한될 수 있습니다.
              </li>
              <li>
                귀하는 잘못된 지갑 주소, 잘못된 네트워크 선택, 잘못된 자산 전송,
                브리지 오류, 지갑 오조작 등으로 발생한 손실을 스스로 부담합니다.
              </li>
              <li>
                귀하는 서비스 이용, 제품 구매, 토큰 수령 또는 디지털 자산
                거래와 관련하여 적용되는 세금 신고 및 납부 의무를 스스로
                부담합니다.
              </li>
              <li>
                회사는 법률, 결제사 요구, 제재 준수 또는 사기 방지 목적으로
                결제를 보류하거나 추가 정보를 요청할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              7. 배송, 통관, 수입규제 및 수출통제
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                제품 배송 가능 여부는 국가, 지역, 운송사, 통관 규정,
                수출통제 및 제재 요건에 따라 달라질 수 있습니다.
              </li>
              <li>
                귀하는 귀하 지역에서 제품 수입, 통관, 전파 인증, 전기 인증,
                사용 허가 또는 기타 규제 요구사항이 있는지 확인할 책임이
                있습니다.
              </li>
              <li>
                관세, 부가세, 수입세, 통관 수수료 및 관련 비용은 별도 고지가
                없는 한 귀하가 부담합니다.
              </li>
              <li>
                회사는 규제 또는 물류 사유로 특정 지역에 배송하지 않거나
                이미 접수된 주문이라도 배송을 중단할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              8. 환불, 반품, 교환 및 보증
            </h2>
            <p className="mb-4">
              제품의 환불, 반품, 교환, 초기 불량, 배송 파손, 보증 기간 및
              제한 사항은 별도의 환불정책, 배송정책, 보증정책 또는
              제품별 안내에 따릅니다. 다만, 관련 법령상 강행규정이 있는 경우
              해당 법령이 우선 적용됩니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                베타 제품, 테스트넷 번들, 한정판, 조립 후 제품, 사용자 과실
                손상 또는 명시적으로 환불 제한이 고지된 항목은 별도 조건이
                적용될 수 있습니다.
              </li>
              <li>
                디지털 콘텐츠, 소프트웨어 라이선스, 활성화 코드, 지갑 기능,
                테스트넷 참여 권한 등은 환불 대상에서 제외될 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              9. 테스트넷, 베타 기능, 포인트 및 향후 기능
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                서비스의 일부 기능은 테스트넷, 베타, 프리뷰, 실험 기능 또는
                제한된 조기 접근 형태로 제공될 수 있습니다.
              </li>
              <li>
                이러한 기능은 예고 없이 변경, 지연, 중단, 초기화(reset),
                폐기되거나 상용 기능으로 이어지지 않을 수 있습니다.
              </li>
              <li>
                테스트넷 토큰, 테스트 포인트, 대기순번, 배지, 등급, 기여도,
                화이트리스트 우선권 또는 유사한 지표는 법적으로 보장된 재산권,
                투자상품, 예금, 적립금 또는 상환권을 의미하지 않습니다.
              </li>
              <li>
                회사가 명시적으로 확정하지 않는 한, 테스트넷 활동이 향후
                토큰, 보상, 에어드롭, 수익, 지분 또는 경제적 이익으로
                전환된다고 보장하지 않습니다.
              </li>
              <li>
                테스트넷 또는 베타 기능에서의 오류, 데이터 손실, 기능 중단,
                리더보드 변경, 포인트 소멸 또는 운영정책 변경이 발생할 수
                있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              10. 리워드, 토큰 및 수익 관련 고지
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                서비스 내 설명, 커뮤니티 공지, 웹사이트 콘텐츠 또는 마케팅
                자료는 법률상 명시적으로 요구되는 공시가 없는 한 투자 자문,
                금융 자문, 법률 자문, 세무 자문 또는 증권·투자 권유를
                구성하지 않습니다.
              </li>
              <li>
                회사는 노드 운영, 데이터 기여, 네트워크 참여 또는 토큰 관련
                활동에 대해 일정한 가격 상승, 수익률, 수익 회수 기간 또는
                경제적 성과를 보장하지 않습니다.
              </li>
              <li>
                토큰 또는 디지털 자산이 도입되는 경우에도, 해당 자산의
                가치, 유동성, 상장 여부, 거래 가능성, 규제 지위 또는
                이용 가능 지역은 보장되지 않습니다.
              </li>
              <li>
                회사는 사기, 시장 변동성, 보안 사고, 체인 포크, 프로토콜
                변경, 브리지 장애, 규제 변경 또는 제3자 서비스 중단으로
                발생하는 손실에 대해 책임을 제한할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              11. 제3자 서비스 및 블록체인 인프라
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                서비스는 제3자 지갑, 블록체인 네트워크, 노드 운영자, RPC,
                브리지, 거래소, 결제대행사, 물류업체, 분석도구, 호스팅,
                로그인 제공자 또는 커뮤니티 플랫폼과 연동될 수 있습니다.
              </li>
              <li>
                이러한 제3자 서비스는 회사의 통제 밖에 있으며, 회사는 그
                가용성, 보안, 적법성, 지속성 또는 성능을 보장하지 않습니다.
              </li>
              <li>
                귀하와 제3자 서비스 간의 관계는 해당 제3자 약관과 정책에
                따르며, 회사는 제3자 서비스로 인한 손실에 대해 책임지지
                않을 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              12. 허용되지 않는 이용행위
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>법령, 제재, 수출통제 또는 규제 회피 목적의 이용</li>
              <li>사기, 자금세탁, 불법 자금 이전 또는 제재 회피 행위</li>
              <li>서비스, 계정, 지갑 기능 또는 노드 운영 로직의 악용</li>
              <li>봇, 스크립트, 자동화 또는 우회 수단을 통한 부정 참여</li>
              <li>허위 계정 생성, 다중 계정 남용, 리워드 농사 행위</li>
              <li>리버스 엔지니어링, 취약점 악용, 무단 접근 시도</li>
              <li>지식재산권, 초상권, 프라이버시 또는 타인의 권리 침해</li>
              <li>서비스 운영을 방해하거나 다른 이용자에게 피해를 주는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">13. KYC, AML 및 준법 협조</h2>
            <p className="mb-4">
              회사는 관련 법령, 규제 준수, 제재 스크리닝, 사기 방지, 리스크
              관리 또는 특정 기능 제공을 위해 귀하에게 추가 정보, 신원확인,
              주소확인, 지갑 확인 또는 거래 관련 자료를 요청할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                귀하가 요청된 정보를 제공하지 않거나, 제공된 정보가
                부정확하다고 판단되는 경우, 회사는 서비스 제공을 제한,
                보류 또는 종료할 수 있습니다.
              </li>
              <li>
                회사는 법률상 허용되는 범위에서 제재 목록 확인, 지갑 주소
                위험평가 또는 거래 모니터링을 수행할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">14. 지식재산권</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                서비스, 웹사이트, 소프트웨어, 디자인, 상표, 로고, 문구,
                이미지, 콘텐츠 및 관련 자료에 대한 권리는 회사 또는 정당한
                권리자에게 귀속됩니다.
              </li>
              <li>
                본 약관은 귀하에게 서비스 이용을 위한 제한적, 비독점적,
                취소 가능한 권한만 부여하며, 명시되지 않은 권리는 모두
                회사에 유보됩니다.
              </li>
              <li>
                귀하는 회사의 사전 서면 동의 없이 콘텐츠를 복제, 배포,
                수정, 판매, 재라이선스 또는 상업적으로 이용할 수 없습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              15. 이용자 제공 콘텐츠 및 피드백
            </h2>
            <p className="mb-4">
              귀하가 서비스에 게시, 제출 또는 전송하는 피드백, 제안,
              문의, 리뷰, 사진, 데이터 또는 기타 자료가 있는 경우, 귀하는
              해당 자료에 대한 필요한 권리를 보유하고 있어야 합니다.
            </p>
            <p>
              귀하는 회사가 서비스 운영, 품질 개선, 고객지원, 제품 개발,
              문서화 및 홍보 목적으로 그러한 자료를 사용할 수 있는 비독점적,
              전 세계적, 무상, 서브라이선스 가능한 범위의 권한을 부여합니다.
              다만 개인정보는 개인정보처리방침에 따라 처리됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">16. 서비스 변경 및 종료</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                회사는 서비스의 전부 또는 일부를 언제든지 변경, 업데이트,
                중단, 제한 또는 종료할 수 있습니다.
              </li>
              <li>
                하드웨어, 소프트웨어, 펌웨어, API, 리워드 구조, 테스트넷 규칙,
                자격 기준, 지원 기기, 지원 지역 또는 네트워크 구조는 수시로
                변경될 수 있습니다.
              </li>
              <li>
                회사는 운영상 필요, 보안, 법률 준수, 규제 대응 또는 사업적
                판단에 따라 기능 또는 프로젝트 방향을 조정할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">17. 계정 제한 및 해지</h2>
            <p className="mb-4">
              회사는 다음과 같은 경우 사전 통지 없이 서비스 접근, 주문,
              계정, 테스트넷 참여, 리워드 또는 기타 기능을 제한, 보류,
              중단 또는 해지할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>본 약관 또는 관련 정책 위반</li>
              <li>사기, 제재, 법률 위반 또는 의심 거래</li>
              <li>다중 계정 남용 또는 부정한 리워드 획득 시도</li>
              <li>서비스 안정성 또는 다른 이용자 보호가 필요한 경우</li>
              <li>법령, 규제기관, 수사기관 또는 법원의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">18. 면책사항</h2>
            <p className="mb-4">
              관련 법령상 허용되는 최대한의 범위에서, 서비스와 제품은
              “있는 그대로” 및 “제공 가능한 상태로” 제공될 수 있으며,
              회사는 상품성, 특정 목적 적합성, 비침해, 중단 없는 제공,
              오류 없음, 보안성, 가치 유지, 수익성 또는 제3자 시스템과의
              완전한 호환성에 관한 명시적·묵시적 보증을 하지 않습니다.
            </p>
            <p>
              특히 회사는 블록체인 네트워크, 제3자 지갑, 브리지, 거래소,
              토큰 시장, 가격 변동, 규제 변화, 해킹, 체인 포크, 노드 장애,
              통신 장애, 전력 문제 또는 외부 서비스 중단으로 인한 손실을
              보장하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">19. 책임 제한</h2>
            <p className="mb-4">
              관련 법령상 허용되는 범위에서, 회사 및 그 임직원, 파트너,
              공급업체, 계열사는 간접손해, 특별손해, 부수손해, 결과손해,
              데이터 손실, 이익 손실, 기회 손실, 자산 가치 하락, 디지털 자산
              손실, 사업 중단 또는 평판 손상에 대해 책임지지 않습니다.
            </p>
            <p>
              관련 법령상 허용되는 범위에서, 회사의 총 책임 한도는 문제 발생
              직전 12개월 동안 귀하가 회사에 실제로 지급한 금액 또는
              미화 100달러 상당액 중 더 큰 금액을 초과하지 않습니다.
              다만 일부 지역은 특정 책임 제한을 허용하지 않을 수 있으므로,
              해당 경우 법령상 허용되는 범위까지만 적용됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">20. 귀하의 보상 책임</h2>
            <p>
              귀하는 귀하의 약관 위반, 법령 위반, 지갑 사용, 제3자 권리 침해,
              부정행위 또는 귀하가 제출한 자료로 인해 발생하는 청구, 손해,
              책임, 비용 및 합리적인 변호사 비용으로부터 회사를 방어,
              면책 및 보호해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              21. 소비자 보호 및 강행규정
            </h2>
            <p>
              귀하가 소비자인 경우, 귀하의 거주지 법률상 강행규정에 따른
              권리는 본 약관에 의해 배제되지 않습니다. 본 약관의 어떤 조항도
              관련 법령상 배제할 수 없는 소비자 권리를 제한하려는 것으로
              해석되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">22. 준거법 및 분쟁 해결</h2>
            <p className="mb-4">
              본 약관은 대한민국 법률에 따라 해석되고 적용됩니다.
              다만 귀하가 소비자인 경우, 귀하의 거주지 법률상 강행규정이
              우선 적용될 수 있습니다.
            </p>
            <p>
              본 약관 또는 서비스와 관련하여 발생하는 분쟁은 관련 법령상
              허용되는 범위에서 대한민국 서울 소재 관할 법원을 제1심의
              전속적 또는 비전속적 관할 법원으로 할 수 있습니다. 단,
              소비자 보호법상 별도의 관할 규정이 있는 경우에는 그 규정이
              우선할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">23. 약관 변경</h2>
            <p>
              회사는 서비스, 사업 모델, 기술, 법률 또는 운영 환경의 변화에
              따라 본 약관을 수정할 수 있습니다. 중요한 변경이 있는 경우
              웹사이트 게시, 이메일 또는 기타 합리적인 방식으로 안내할 수
              있습니다. 변경 후 서비스를 계속 이용하면 개정 약관에 동의한
              것으로 간주될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">24. 분리 가능성 및 전체 합의</h2>
            <p className="mb-4">
              본 약관의 일부 조항이 무효 또는 집행 불가능하더라도 나머지
              조항의 효력은 계속 유지됩니다.
            </p>
            <p>
              본 약관과 개인정보처리방침, 환불정책, 배송정책, 제품별 안내,
              별도 공지 및 명시적으로 참조된 정책은 귀하와 회사 간의 전체
              합의를 구성합니다.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-800">
            <h2 className="mb-6 text-2xl font-bold text-white">25. 문의처</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="mb-3">
                <span className="font-semibold text-slate-200">서비스명:</span> AirVent
              </p>
              <p className="mb-3">
                <span className="font-semibold text-slate-200">웹사이트:</span>{" "}
                <a
                  href="https://airvent.ai"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  airvent.ai
                </a>
              </p>
              <p>
                <span className="font-semibold text-slate-200">이메일:</span>{" "}
                <a
                  href="mailto:info@airventinc.co.kr"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  info@airventinc.co.kr
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
