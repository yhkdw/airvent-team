import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { getNickname } from "./auth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import JudgeDemo from "./pages/JudgeDemo";
import NodeDetailPage from "./pages/NodeDetailPage";
import OnboardingPage from "./pages/OnboardingPage";
import RequireAuth from "./components/RequireAuth";

// Dashboard tabs
import OverviewTab from "./pages/dashboard/OverviewTab";
import AirQualityTab from "./pages/dashboard/AirQualityTab";
import RewardsTab from "./pages/dashboard/RewardsTab";
import WalletTab from "./pages/dashboard/WalletTab";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[App] Auth event: ${event}`);

      const hasAccessToken = window.location.hash.includes("access_token");
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        if (event === "INITIAL_SESSION" && !hasAccessToken) return; // 일반 페이지 로드 무시

        const currentPath = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");

        console.log(`[App] ${event} at ${currentPath}, next: ${next}, hasToken: ${hasAccessToken}`);

        // 닉네임 확인 — 없으면 온보딩으로
        const nickname = await getNickname(session.user.id);
        if (!nickname) {
          console.log("[App] No nickname found, redirecting to /onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }

        if (next) {
          navigate(next, { replace: true });
        } else if (currentPath === "/login" || currentPath === "/dashboard" || currentPath.startsWith("/auth/") || hasAccessToken) {
          navigate("/", { replace: true });
        }
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/node" element={<NodeDetailPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<OverviewTab />} />
          <Route path="air-quality" element={<AirQualityTab />} />
          <Route path="rewards" element={<RewardsTabWrapper />} />
          <Route path="wallet" element={<WalletTab />} />
        </Route>
      </Route>

      <Route path="/judge" element={<JudgeDemo />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { useOutletContext } from "react-router-dom";
function RewardsTabWrapper() {
  const { onReward } = useOutletContext<{ onReward: (amt: number) => void }>();
  return <RewardsTab onReward={onReward} />;
}
