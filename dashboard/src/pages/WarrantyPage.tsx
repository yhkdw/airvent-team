import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function WarrantyPage() {
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
            보증, 환불 및 배송 정책
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            최종 업데이트일: 2026년 3월 12일
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300 md:text-lg">
            본 정책은 AirVent가 판매하는 노드 제품 및 관련 액세서리에 대한
            제한적 하드웨어 보증 범위, 환불 절차 및 배송 조건을 설명합니다. 
            본 정책은 관련 법령상 소비자에게 부여되는 강행규정상 권리를 제한하지 않습니다.
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">1. 제한적 하드웨어 보증</h2>
            <p className="mb-4">
              AirVent는 별도 표시가 없는 한, 원구매자에게 배송 완료일 또는 구매
              증빙일 중 확인 가능한 기준일로부터 <strong className="text-emerald-400">1년</strong> 동안
              정상적인 사용 조건에서 발생한 제조상 결함 또는 하드웨어 하자에
              대해 제한적 보증을 제공합니다.
            </p>
            <p>
              이 보증은 제품 페이지, 포장, 보증서 또는 별도 공지에서 더 긴
              보증기간을 약속한 경우 그 더 유리한 기준을 따를 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">2. 보증 대상</h2>
            <p className="mb-4">
              보증기간 내 정상 사용 중 발생한 다음과 같은 문제는 보증 대상이 될
              수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>전원이 정상적으로 켜지지 않는 하드웨어 결함</li>
              <li>기본 기능이 작동하지 않는 제조상 결함</li>
              <li>출고 시점부터 존재한 조립 불량 또는 부품 결함</li>
              <li>센서, 화면, 버튼, 포트, 무선 연결 모듈 등의 비정상 동작</li>
              <li>배송 중 발생한 초기 파손으로 확인되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">3. 보증에서 제외되는 경우</h2>
            <p className="mb-4">
              다음과 같은 경우에는 관련 법령상 허용되는 범위에서 무상보증 대상이
              아닐 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>이용자 과실, 충격, 침수, 낙하, 화재, 과전압, 오염, 부식</li>
              <li>비정상적인 전원 사용, 부적절한 설치 환경, 권장 사용 범위 초과</li>
              <li>무단 분해, 개조, 수리 또는 비공인 부품 사용</li>
              <li>소프트웨어 해킹, 루팅, 펌웨어 변조, 비공식 프로그램 설치</li>
              <li>소모품의 자연 소모, 외관상 마모, 스크래치, 변색, 오염</li>
              <li>천재지변, 정전, 낙뢰, 통신장애, 외부 서비스 장애</li>
              <li>지갑, 블록체인 네트워크, 테스트넷, 제3자 앱 또는 서버 장애</li>
              <li>제품의 정상 기능과 무관한 경미한 외관상 차이</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">4. 초기 불량(DOA) 및 환불</h2>
            <p className="mb-4">
              제품 수령 직후 발견되는 중대한 하드웨어 이상, 전원 불능, 심각한
              파손 또는 오배송은 초기 불량으로 접수될 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                초기 불량 접수 기한은 <strong className="text-emerald-400">제품 수령일로부터 7일 이내</strong>입니다.
              </li>
              <li>
                초기 불량으로 확인되면 우선적으로 교환 또는 재배송을 제공할 수
                있으며, 재고가 없으면 수리 또는 환불로 처리할 수 있습니다.
              </li>
              <li>
                단순 변심에 의한 환불의 경우, 제품 포장이 훼손되지 않고 재판매가 가능한 상태여야 하며 왕복 배송비는 이용자가 부담합니다.
              </li>
              <li>
                초기 불량 여부 확인을 위해 사진, 영상, 주문번호, 시리얼 정보
                또는 제품 상태 확인이 필요한 추가 자료를 요청할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">5. 보증 서비스 방식</h2>
            <p className="mb-4">
              회사는 보증 대상 여부를 확인한 후 다음 중 하나의 방식으로 처리할
              수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>무상 수리</li>
              <li>동일 또는 동등 성능의 교체품 제공</li>
              <li>대체 부품 교환</li>
              <li>재고 부족 또는 수리 불가 시 환불 또는 부분 환불</li>
            </ul>
            <p className="mt-4">
              보증 처리 방법은 결함의 성격, 부품 수급, 재고 상태, 모델 지속
              여부에 따라 달라질 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">6. 보증 및 환불 신청 절차</h2>
            <ol className="list-decimal space-y-2 pl-6">
              <li>주문번호, 제품 모델명, 증상 설명과 함께 고객지원에 문의합니다.</li>
              <li>문제 확인을 위해 사진, 영상, 로그 또는 추가 정보를 요청할 수 있습니다.</li>
              <li>회사가 필요하다고 판단하는 경우 제품 회수를 요청할 수 있습니다.</li>
              <li>검수 후 보증 대상 여부와 처리 방식을 안내합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">7. 배송 정책 및 비용</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>국내 일반 배송은 무상으로 제공합니다.</li>
              <li>해외 주문의 최초 발송에 필요한 국제 배송비는 이용자가 부담합니다.</li>
              <li>회사가 승인한 보증 수리, 초기 불량, 교환 처리 건의 해외 반송비는 AirVent가 부담합니다.</li>
              <li>보증 제외 사유로 판정된 경우, 점검비, 수리비, 부품비 및 추가 배송비는 이용자에게 청구될 수 있습니다.</li>
              <li>배송지 오류 또는 이용자 부재로 인한 반송 및 재배송 비용은 이용자가 부담합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">8. 설치 및 사용 환경 관련 주의</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>제품은 제품 설명서, 안전 가이드, 전원 규격 및 권장 사용 환경에 맞게 설치·사용해야 합니다.</li>
              <li>회사 또는 회사가 지정한 설치 지원이 제공되는 경우, 설치 하자에 대한 별도 기준이 적용될 수 있습니다.</li>
              <li>이용자 임의 설치 또는 외부 시공으로 인한 문제는 보증 범위에서 제외될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">9. 소프트웨어, 펌웨어, 테스트넷 기능</h2>
            <p className="mb-4">
              제품은 소프트웨어, 펌웨어, 대시보드, 계정 시스템, 네트워크 기능,
              테스트넷 기능 또는 제3자 블록체인 인프라와 함께 작동할 수
              있습니다. 다만 다음 사항은 제한적 하드웨어 보증과 구분됩니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>베타 기능, 테스트넷 기능, 포인트, 리워드 또는 토큰 관련 기능은 변경·중단될 수 있습니다.</li>
              <li>네트워크 혼잡, 제3자 지갑 문제, RPC 장애, 체인 포크, 브리지 오류, 토큰 가치 변동 등은 하드웨어 보증의 대상이 아닙니다.</li>
              <li>회사는 합리적인 범위에서 업데이트와 버그 수정을 제공할 수 있으나, 특정 기능의 영구적 유지나 경제적 가치 발생을 보장하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">10. 소비자 권리</h2>
            <p>
              본 보증정책은 관련 법령상 소비자에게 인정되는 권리 또는
              소비자분쟁해결기준상 더 유리한 보상 기준을 배제하기 위한 것이
              아닙니다. 본 정책과 관련 법령 또는 적용 가능한 소비자 보호 기준이
              충돌하는 경우, 소비자에게 더 유리한 기준이 우선할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">11. 문의처</h2>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="space-y-3">
                <p className="flex items-center gap-4">
                  <span className="w-20 text-sm font-bold text-slate-500 uppercase">Service</span>
                  <span className="text-white font-semibold">AirVent</span>
                </p>
                <p className="flex items-center gap-4">
                  <span className="w-20 text-sm font-bold text-slate-500 uppercase">Website</span>
                  <a href="https://airvent.ai" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30">
                    airvent.ai
                  </a>
                </p>
                <p className="flex items-center gap-4">
                  <span className="w-20 text-sm font-bold text-slate-500 uppercase">Email</span>
                  <a href="mailto:info@airventinc.co.kr" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30">
                    info@airventinc.co.kr
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
