import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { saveNickname } from "../auth";

export default function OnboardingPage() {
  const nav = useNavigate();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 로그인 안 된 상태면 로그인으로
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) nav("/login");
    });
  }, [nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) { setError("닉네임을 입력해주세요."); return; }
    if (nickname.trim().length < 2) { setError("닉네임은 2자 이상이어야 합니다."); return; }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { nav("/login"); return; }

    const { error: saveErr } = await saveNickname(session.user.id, nickname.trim());
    setLoading(false);

    if (saveErr) {
      console.error("[Onboarding] Save error:", saveErr);
      if (saveErr.message.includes("unique") || saveErr.code === "23505") {
        setError("이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.");
      } else if (saveErr.message.includes("406") || saveErr.code === "PGRST106") {
        setError("데이터베이스 설정 문제(profiles 테이블 부재)가 감지되었습니다. 관리자에게 문의하거나 SQL 스크립트를 실행해주세요.");
      } else {
        setError(saveErr.message);
      }
    } else {
      nav("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👋</div>
          <div className="text-xs text-emerald-400 font-semibold tracking-wider mb-2">ALMOST THERE</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">거의 다 됐어요!</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            AirVent에서 사용할 닉네임을 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <div className="text-sm text-slate-300 mb-1.5 font-medium">닉네임</div>
            <input
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="사용할 닉네임을 입력하세요"
              maxLength={20}
              autoFocus
              disabled={loading}
            />
            <div className="text-right text-xs text-slate-600 mt-1">{nickname.length}/20</div>
          </label>

          {error && (
            <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || nickname.trim().length < 2}
            className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3.5 mt-2 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? "저장 중..." : "시작하기 →"}
          </button>
        </form>
      </div>
    </div>
  );
}
