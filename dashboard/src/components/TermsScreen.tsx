import React, { useState } from 'react';

export function TermsScreen({ onAgree, onBack }: { onAgree: () => void, onBack: () => void }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const allChecked = checked1 && checked2;

  const checkboxClass = "mt-0.5 h-6 w-6 shrink-0 rounded-md border-2 border-slate-600 bg-slate-900 appearance-none checked:bg-emerald-500 checked:border-emerald-500 relative flex items-center justify-center after:content-[''] after:hidden checked:after:block after:absolute after:w-1.5 after:h-3 after:border-r-2 after:border-b-2 after:border-slate-950 after:rotate-45 after:-translate-y-0.5 transition-all cursor-pointer shadow-inner";

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ height: '100%', minHeight: '400px' }}>
      
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-white tracking-wide">약관 동의</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-white">환영합니다!</h2>
          <p className="text-sm text-slate-400 mt-1">이 기능은 카카오 비즈 앱 등록을 위해 데모입니다. 체크해야 진행됩니다.</p>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-slate-900 border border-slate-800 p-4 cursor-pointer hover:border-slate-700 transition group">
          <input type="checkbox" checked={checked1} onChange={() => setChecked1(!checked1)} className={checkboxClass} />
          <div className="flex-1">
            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">[필수] 서비스 이용약관 동의</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">AirVent DePIN 약관 동의 (<a href="/terms" target="_blank" className="text-cyan-500 hover:underline">보기</a>)</p>
          </div>
        </label>
        
        <label className="flex items-start gap-3 rounded-xl bg-slate-900 border border-slate-800 p-4 cursor-pointer hover:border-slate-700 transition group">
          <input type="checkbox" checked={checked2} onChange={() => setChecked2(!checked2)} className={checkboxClass} />
          <div className="flex-1">
            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">[필수] 개인정보 수집 동의</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">식별자 및 이메일 수집 동의 (<a href="/privacy" target="_blank" className="text-cyan-500 hover:underline">보기</a>)</p>
          </div>
        </label>
      </div>
      
      <div className="p-6 pt-2 border-t border-slate-800">
        <button
          disabled={!allChecked}
          onClick={(e) => { e.preventDefault(); if (allChecked) onAgree(); }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all transform ${allChecked ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:-translate-y-0.5' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
        >
          {allChecked ? '동의하고 로그인' : '항목에 동의해 주세요'}
        </button>
      </div>
    </div>
  );
}
