import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getNickname } from "../auth";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const next = params.get("next") || "/";
      const lang = params.get("lang");
      const withLang = (path: string) => {
        if (!lang) return path;
        return path.includes("?") ? `${path}&lang=${lang}` : `${path}?lang=${lang}`;
      };

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (!session) {
        setError("인증 세션을 찾지 못했습니다. 이메일 링크가 만료되었거나 이미 사용되었을 수 있습니다.");
        return;
      }

      const { data: nickname, error: nicknameErr } = await getNickname(session.user.id);
      if (cancelled) return;

      if (!nickname && !nicknameErr) {
        navigate(withLang("/onboarding"), { replace: true });
        return;
      }

      navigate(withLang(next), { replace: true });
    };

    finish();

    return () => {
      cancelled = true;
    };
  }, [navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-8 shadow-xl text-center">
        <h1 className="text-xl font-bold mb-4">{error ? "이메일 인증 실패" : "이메일 인증 처리 중"}</h1>
        {error ? (
          <div className="space-y-5">
            <p className="text-sm text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-xl px-4 py-3">
              {error}
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3 hover:bg-emerald-400 transition"
            >
              로그인으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">인증 세션을 확인하고 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
