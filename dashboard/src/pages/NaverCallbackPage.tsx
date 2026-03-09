import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NaverCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("네이버 로그인 처리 중...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The edge function redirects here with the magic link hash fragment
    
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session) {
          setStatus("로그인 완료! 대시보드로 이동합니다.");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1000);
        } else {
            // Listen for the hash exchange to finish
            const { data: listener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
                if (event === 'SIGNED_IN' && session) {
                    setStatus("로그인 완료! 대시보드로 이동합니다.");
                    navigate("/dashboard", { replace: true });
                }
            });
            
            // Timeout if it takes too long
            setTimeout(() => {
                // If it times out, the user probably wasn't redirected with a valid hash
                // Or maybe auth is delayed
            }, 6000);
        }
      } catch (err: any) {
        setError(err.message || "로그인 중 오류가 발생했습니다.");
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-8 shadow-xl backdrop-blur-sm text-center">
        <h2 className="text-xl font-bold mb-4">{error ? "로그인 실패" : "로그인 진행 중"}</h2>
        {error ? (
           <div className="text-rose-400 text-sm mt-4 bg-rose-950/50 p-4 rounded-xl border border-rose-900/50">
               {error}
               <button onClick={() => navigate('/login')} className="mt-4 block w-full px-4 py-2 bg-slate-800 rounded-xl text-white font-bold hover:bg-slate-700 transition">다시 로그인하기</button>
           </div>
        ) : (
           <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm animate-pulse">{status}</p>
           </div>
        )}
      </div>
    </div>
  );
}
