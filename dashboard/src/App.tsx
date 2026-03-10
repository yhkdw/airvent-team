import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import NaverCallbackPage from "./pages/NaverCallbackPage";
import TermsPage from "./pages/TermsPage";
import JudgeDemo from "./pages/JudgeDemo";
import NodeDetailPage from "./pages/NodeDetailPage";
import RequireAuth from "./components/RequireAuth";

// Dashboard tabs
import OverviewTab from "./pages/dashboard/OverviewTab";
import AirQualityTab from "./pages/dashboard/AirQualityTab";
import RewardsTab from "./pages/dashboard/RewardsTab";
import WalletTab from "./pages/dashboard/WalletTab";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[App] Auth event: ${event}`);

      // Only act on explicit sign-in events (not INITIAL_SESSION which fires on every page load)
      if (event === "SIGNED_IN" && session) {
        const currentPath = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");

        console.log(`[App] SIGNED_IN event at ${currentPath}, next: ${next}`);

        if (next) {
          console.log("[App] Redirecting to next:", next);
          navigate(next, { replace: true });
        } else if (currentPath === "/login" || currentPath === "/dashboard" || currentPath.startsWith("/auth/")) {
          console.log(`[App] Auto-redirecting from ${currentPath} to /`);
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
      <Route path="/auth/naver/callback" element={<NaverCallbackPage />} />
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

// Wrapper to pass context to RewardsTab
import { useOutletContext } from "react-router-dom";
function RewardsTabWrapper() {
  const { onReward } = useOutletContext<{ onReward: (amt: number) => void }>();
  return <RewardsTab onReward={onReward} />;
}
