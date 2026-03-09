import React from 'react';
import { MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
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
          개인정보 처리방침
        </h1>
        
        <div className="max-w-none">
          <p className="text-lg text-slate-400 mb-8 border-l-4 border-cyan-500 pl-4 py-1">
            본 개인정보 처리방침은 AirVent DePIN 프로젝트가 사용자 정보를 어떻게 수집하고 이용하는지를 설명합니다.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="text-slate-300 mb-4">
            AirVent DePIN 서비스는 소셜 로그인(예: 카카오 로그인) 기능을 위해 플랫폼 심사 규정을 준수하며 서비스 제공에 필수적인 최소한의 정보만을 수집합니다.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-8">
            <li><strong>필수 수집 항목:</strong> 카카오 계정 식별자(ID), 이메일 주소</li>
            <li><strong>선택 수집 항목:</strong> (없음)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. 개인정보 수집 및 이용 목적</h2>
          <p className="text-slate-300 mb-4">
            수집된 개인정보는 다음의 목적을 위해서만 이용됩니다.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-8">
            <li>회원 가입 의사 확인, 본인 식별 및 인증, 회원 자격 유지 및 관리</li>
            <li>서비스 부정이용 방지와 비인가 사용 방지</li>
            <li>에어벤트 노드 기기 연동 및 채굴/리워드(AIVT) 식별을 위한 고유 계정 생성</li>
          </ul>

          <p className="text-sm text-slate-500 mt-16 pt-8 border-t border-white/10">
            시행일자: 2026년 3월 9일
          </p>
        </div>
      </main>
    </div>
  );
}
