import React from 'react';
import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      <main className="mx-auto max-w-3xl px-6 py-24 sm:px-12 sm:py-32">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <MoveLeft className="h-4 w-4" />
            메인으로 돌아가기
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-8">
          이용약관
        </h1>
        
        <div className="max-w-none">
          <p className="text-lg text-slate-400 mb-8 border-l-4 border-cyan-500 pl-4 py-1">
            환영합니다. 본 약관은 AirVent DePIN 서비스의 이용 조건 및 절차를 규정합니다.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">제 1 조 (목적)</h2>
          <p className="text-slate-300 mb-4">
            본 약관은 "AirVent DePIN" (이하 "회사")가 제공하는 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리와 의무, 책임 사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">제 2 조 (회원가입 및 계정 연동)</h2>
          <p className="text-slate-300 mb-4">
            이용자는 본 약관 및 개인정보 처리방침에 동의하고 카카오 등의 소셜 로그인 계정 연동을 완료함으로써 서비스를 정상적으로 이용할 수 있습니다.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">제 3 조 (면책조항)</h2>
          <p className="text-slate-300 mb-8">
            본 서비스는 DePIN 네트워크 생태계 구성을 위한 목적으로 제공되며, 측정된 공기질 데이터의 절대적인 정확성을 보증하지는 않습니다.
          </p>

          <p className="text-sm text-slate-500 mt-16 pt-8 border-t border-white/10">
            시행일자: 2026년 3월 9일
          </p>
        </div>
      </main>
    </div>
  );
}