import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginWithEmail, signUpWithEmail, loginWithSocial, isAuthed } from "../auth";

type SocialProvider = "google" | "twitter";
type Mode = "login" | "signup" | "verify";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isAuthed().then(authed => {
      if (authed) nav(nextPath);
    });
  }, [nav]);

  const handleSocialLogin = async (provider: SocialProvider) => {
    setError("");
    // Pass current i18n language to persist through social auth
    const currentLang = i18n.language || "ko";
    const langParam = currentLang.startsWith("ko") ? "ko" : currentLang.startsWith("ja") ? "ja" : currentLang.startsWith("zh") ? "zh-TW" : "en";
    
    const { error } = await loginWithSocial(provider, nextPath !== "/" ? nextPath : undefined, langParam);
    if (error) setError(error.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: loginErr } = await loginWithEmail(email, password);
    setLoading(false);
    if (loginErr) setError(loginErr.message || t("login.error_unauthorized"));
    else nav(nextPath);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nickname.trim()) { setError("닉네임을 입력해주세요."); return; }
    if (nickname.trim().length < 2) { setError("닉네임은 2자 이상이어야 합니다."); return; }
    if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    setLoading(true);
    const { error: signUpErr } = await signUpWithEmail(email, password, nickname.trim());
    setLoading(false);
    if (signUpErr) setError(signUpErr.message);
    else setMode("verify");
  };

  const SocialButtons = () => (
    <div className="space-y-3 mb-6">
      <button
        type="button"
        onClick={() => handleSocialLogin("google")}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/5 border border-slate-800 py-3 text-sm font-bold hover:bg-white/10 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google로 계속하기
      </button>
      <button
        type="button"
        onClick={() => handleSocialLogin("twitter")}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/5 border border-slate-800 py-3 text-sm font-bold hover:bg-white/10 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X로 계속하기
      </button>
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">또는 이메일로</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>
    </div>
  );

  // ── 이메일 인증 안내 화면 ──
  if (mode === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-8 shadow-xl backdrop-blur-sm text-center">
          <div className="text-5xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">이메일을 확인해주세요</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            <span className="text-emerald-400 font-semibold">{email}</span>로
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            인증 메일을 보냈습니다. 메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-500 mb-6">
            메일이 보이지 않으면 스팸함을 확인해주세요.
          </div>
          <button
            onClick={() => setMode("login")}
            className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3 hover:bg-emerald-400 transition"
          >
            로그인 화면으로
          </button>
          <Link to="/" className="block mt-4 text-xs font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest underline underline-offset-4">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">

        {/* 탭 */}
        <div className="flex rounded-xl bg-slate-800/50 p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === "login" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === "signup" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            회원가입
          </button>
        </div>

        <SocialButtons />

        {/* 로그인 폼 */}
        {mode === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">이메일</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </label>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">비밀번호</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </label>
            {error && <ErrorBox message={error} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3.5 mt-2 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        )}

        {/* 회원가입 폼 */}
        {mode === "signup" && (
          <form className="space-y-4" onSubmit={handleSignUp}>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">닉네임</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력하세요"
                maxLength={20}
                disabled={loading}
              />
              <div className="text-right text-xs text-slate-600 mt-1">{nickname.length}/20</div>
            </label>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">이메일</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </label>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">비밀번호</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6자 이상"
                autoComplete="new-password"
                disabled={loading}
              />
            </label>
            <label className="block">
              <div className="text-sm text-slate-300 mb-1.5 font-medium">비밀번호 확인</div>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />
            </label>
            {error && <ErrorBox message={error} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 text-slate-950 font-extrabold py-3.5 mt-2 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "처리 중..." : "가입하기"}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center mt-6">
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest underline underline-offset-4">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-xl px-4 py-3 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}
