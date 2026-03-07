import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginWithEmail, loginWithSocial, isAuthed } from "../auth";

export default function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isAuthed().then(authed => {
      if (authed) {
        console.log("[Login] Already authenticated, redirecting to /dashboard");
        nav("/dashboard");
      }
    });
  }, [nav]);

  const handleSocialLogin = async (provider: 'google' | 'twitter' | 'naver' | 'kakao') => {
    const { error } = await loginWithSocial(provider);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
        <div className="text-xs text-emerald-400 font-semibold tracking-wider mb-2">{t("login.access_control")}</div>
        <h1 className="text-2xl font-bold mt-2 text-slate-100">{t("login.title")}</h1>
        <p className="text-sm text-slate-400 mt-2">
          {t("login.description")}
        </p>

        {/* Social Logins */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-slate-800 py-3 text-sm font-bold hover:bg-white/10 transition group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('twitter')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-slate-800 py-3 text-sm font-bold hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter)
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('naver')}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#03C75A]/10 border border-[#03C75A]/30 py-3 text-sm font-bold hover:bg-[#03C75A]/20 transition text-[#03C75A]"
            >
              <span className="text-[10px] font-black mr-0.5">N</span>
              Naver
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#FEE500]/10 border border-[#FEE500]/30 py-3 text-sm font-bold hover:bg-[#FEE500]/20 transition text-[#FEE500]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.315 6.055-.18.665-.65 2.4-0.745 2.77-.115.46.12.455.255.365.105-.07 1.685-1.14 2.365-1.6l1.24.18c.515.06 1.035.1 1.57.1 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
              </svg>
              Kakao
            </button>
          </div>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{t("login.email_login")}</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);
            const { error: loginErr } = await loginWithEmail(email, password);
            setLoading(false);
            if (loginErr) {
              setError(loginErr.message || t("login.error_unauthorized"));
            } else {
              nav("/dashboard");
            }
          }}
        >
          <label className="block">
            <div className="text-sm text-slate-300 mb-1.5 font-medium">{t("login.email_label")}</div>
            <input
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-300 mb-1.5 font-medium">{t("login.password_label")}</div>
            <input
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={loading}
            />
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
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3.5 mt-2 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? t("login.signing_in") : t("login.sign_in")}
          </button>

          <div className="flex items-center justify-center mt-8">
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest underline underline-offset-4">
              ← {t("login.back_to_home")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

