import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
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
            개인정보처리방침
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            최종 업데이트일: 2026년 3월 12일
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300 md:text-lg">
            AirVent 및 관련 서비스(이하 “회사”, “AirVent”, “서비스”)는 이용자의
            개인정보를 중요하게 생각합니다. 본 개인정보처리방침은 AirVent
            웹사이트, 계정 서비스, 노드 관련 서비스, 고객지원 및 기타 관련
            애플리케이션 이용 과정에서 회사가 어떤 정보를 수집하고, 어떻게
            사용하며, 누구와 공유하고, 얼마 동안 보관하는지 설명합니다. 또한
            이용자가 자신의 개인정보에 대해 행사할 수 있는 권리와 선택권도
            안내합니다.
          </p>
        </header>

        <div className="space-y-12 leading-relaxed text-slate-400">
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">1. 수집하는 개인정보</h2>
            <p className="mb-4">
              회사는 서비스 제공 과정에서 다음과 같은 정보를 수집할 수 있습니다.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-200">
                  1) 이용자가 직접 제공하는 정보
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>이름 또는 닉네임</li>
                  <li>이메일 주소</li>
                  <li>비밀번호 또는 인증 관련 정보</li>
                  <li>국가 또는 지역 정보</li>
                  <li>고객지원 문의 내용</li>
                  <li>노드 구매, 예약, 신청 또는 계정 등록 과정에서 입력한 정보</li>
                  <li>뉴스레터, 대기자 명단, 이벤트 등록 과정에서 제출한 정보</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-200">
                  2) 서비스 이용 과정에서 자동 수집되는 정보
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>IP 주소</li>
                  <li>브라우저 종류 및 기기 정보</li>
                  <li>운영체제 정보</li>
                  <li>접속 일시</li>
                  <li>방문 페이지 및 클릭 기록</li>
                  <li>쿠키 및 유사 기술을 통한 이용 정보</li>
                  <li>로그 데이터 및 오류 기록</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-200">
                  3) 제3자 인증 또는 외부 서비스 연동 시 수집되는 정보
                </h3>
                <p>
                  회사는 계정 생성 및 로그인 편의를 위해 제3자 인증 제공자 또는
                  외부 플랫폼을 사용할 수 있습니다. 이 경우 회사는 해당 인증
                  제공자로부터 이용자 식별, 계정 생성 또는 서비스 제공에 필요한
                  최소한의 정보만 받을 수 있습니다.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-200">
                  4) 선택적으로 수집될 수 있는 정보
                </h3>
                <p className="mb-3">
                  서비스 기능에 따라 다음 정보가 추가로 처리될 수 있습니다.
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>지갑 주소 또는 블록체인 계정 식별자</li>
                  <li>노드 식별 정보</li>
                  <li>주문, 결제, 배송 관련 정보</li>
                  <li>마케팅 수신 동의 여부</li>
                  <li>베타 테스트 또는 테스트넷 참여 정보</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">2. 개인정보의 이용 목적</h2>
            <p className="mb-3">
              회사는 수집한 정보를 다음 목적 범위 내에서 이용할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>계정 생성, 로그인, 본인 확인 및 계정 관리</li>
              <li>웹사이트 및 서비스 운영</li>
              <li>노드 신청, 구매, 예약, 배송 및 관련 고객지원 제공</li>
              <li>테스트넷, 베타 프로그램 및 커뮤니티 운영</li>
              <li>서비스 품질 개선, 오류 분석, 보안 강화</li>
              <li>공지사항, 업데이트, 이벤트, 프로모션 안내</li>
              <li>이용자 문의 대응 및 분쟁 처리</li>
              <li>법적 의무 준수 및 권리 보호</li>
              <li>부정 이용, 사기, 보안 위협 탐지 및 방지</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              3. 개인정보의 처리 근거
            </h2>
            <p className="mb-3">
              회사는 적용되는 법령에 따라 다음과 같은 근거에 따라 개인정보를
              처리할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>이용자와의 계약 이행 또는 계약 체결 전 조치</li>
              <li>회사의 정당한 이익</li>
              <li>이용자의 동의</li>
              <li>법적 의무 준수</li>
              <li>이용자 또는 공공의 중대한 이익 보호가 필요한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              4. 쿠키 및 유사 기술
            </h2>
            <p className="mb-4">
              회사는 웹사이트 운영, 로그인 유지, 트래픽 분석, 사용자 경험
              개선을 위해 쿠키 및 유사 기술을 사용할 수 있습니다.
            </p>
            <p>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수
              있습니다. 다만 일부 기능은 쿠키가 비활성화되면 정상적으로 작동하지
              않을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              5. 개인정보의 공유 및 제공
            </h2>
            <p className="mb-3">
              회사는 다음 경우에 개인정보를 제3자와 공유할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                호스팅, 인증, 분석, 이메일 발송, 고객지원, 결제, 물류 등 서비스
                운영에 필요한 외부 서비스 제공업체
              </li>
              <li>이용자가 연동을 요청하거나 동의한 외부 플랫폼</li>
              <li>법령에 따라 요구되거나, 적법한 요청에 대응해야 하는 경우</li>
              <li>
                회사의 권리, 재산, 안전 또는 이용자 보호가 필요한 경우
              </li>
              <li>
                합병, 인수, 자산 양도 등 기업 구조 변경 과정에서 필요한 경우
              </li>
            </ul>
            <p className="mt-4 text-emerald-400 font-medium">
              회사는 서비스 제공에 필요한 범위를 초과하여 개인정보를 판매하지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">6. 국제 이전</h2>
            <p>
              AirVent는 글로벌 서비스 운영 과정에서 개인정보를 이용자가 거주하는
              국가 외의 국가로 이전하거나 저장할 수 있습니다. 이 경우 회사는
              적용되는 법령에 따라 적절한 보호조치를 마련하기 위해 합리적인
              노력을 기울입니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">7. 보관 기간</h2>
            <p className="mb-3">
              회사는 개인정보를 수집 목적 달성에 필요한 기간 동안만 보관합니다.
              다만 다음 경우에는 더 오래 보관할 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>법령상 보존 의무가 있는 경우</li>
              <li>
                분쟁 해결, 계약 이행, 보안 대응 또는 내부 기록 보관이 필요한 경우
              </li>
              <li>이용자가 별도 동의한 경우</li>
            </ul>
            <p className="mt-4">
              보관이 더 이상 필요하지 않은 개인정보는 합리적인 절차에 따라
              삭제하거나 익명화합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">8. 이용자의 권리</h2>
            <p className="mb-3">
              적용되는 법령에 따라 이용자는 다음 권리를 가질 수 있습니다.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>자신의 개인정보에 대한 열람 요청</li>
              <li>부정확한 정보의 정정 요청</li>
              <li>삭제 요청</li>
              <li>처리 제한 요청</li>
              <li>처리 반대</li>
              <li>동의 철회</li>
              <li>데이터 이동 요청</li>
              <li>마케팅 수신 거부</li>
            </ul>
            <p className="mt-4">
              회사는 관련 법령 및 서비스 운영상 필요한 범위에서 이러한 요청을
              검토하고 처리합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              9. 아동의 개인정보
            </h2>
            <p>
              AirVent 서비스는 관련 법령상 보호가 필요한 아동을 대상으로
              설계되지 않았습니다. 회사는 법적으로 허용되지 않는 방식으로 아동의
              개인정보를 고의로 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">10. 보안</h2>
            <p>
              회사는 개인정보의 분실, 오용, 무단 접근, 공개, 변경 또는 파기를
              방지하기 위해 합리적인 기술적·관리적 보호조치를 시행합니다. 다만
              어떤 시스템도 절대적으로 안전하다고 보장할 수는 없습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              11. 제3자 사이트 및 서비스
            </h2>
            <p>
              서비스에는 제3자 웹사이트, 플랫폼 또는 서비스로 연결되는 링크가
              포함될 수 있습니다. 회사는 해당 제3자 서비스의 개인정보 처리
              관행에 대해 책임지지 않으며, 이용자는 각 서비스의 정책을 별도로
              확인해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">12. 정책 변경</h2>
            <p>
              회사는 사업, 기술, 법률 또는 운영상의 변화에 따라
              본 개인정보처리방침을 수정할 수 있습니다. 중요한 변경이 있는 경우
              웹사이트 또는 적절한 수단을 통해 안내합니다. 상단의 “최종
              업데이트일”은 최근 개정일을 의미합니다.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-800">
            <h2 className="mb-6 text-2xl font-bold text-white">13. 문의처</h2>
            <p className="mb-4">
              개인정보처리방침 또는 개인정보 처리와 관련하여 문의하려면 아래로
              연락해 주시기 바랍니다.
            </p>
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
