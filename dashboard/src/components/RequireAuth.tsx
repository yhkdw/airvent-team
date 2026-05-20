import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RequireAuth() {
  const loc = useLocation();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    let settled = false;
    const finish = (value: boolean) => {
      if (!mounted) return;
      settled = true;
      setAuthed(value);
    };

    // 1. 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      finish(!!session);
    }).catch(err => {
      console.error("[AuthDebug] Session error:", err);
      finish(false);
    });

    const timeout = window.setTimeout(() => {
      if (!settled) {
        console.warn("[AuthDebug] Session check timed out; redirecting to login.");
        finish(false);
      }
    }, 3000);

    // 2. 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      finish(!!session);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-slate-500 text-xs animate-pulse">인증 세션 확인 중...</div>
        {import.meta.env.DEV && (
          <button
            onClick={() => setAuthed(true)}
            className="mt-8 text-[10px] text-slate-800 hover:text-slate-600 underline"
          >
            [Debug] Bypass Auth
          </button>
        )}
      </div>
    );
  }

  if (!authed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
