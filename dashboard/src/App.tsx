import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[App] Auth event: ${event}`);
      if (session) {
        if (location.pathname === "/login") {
          const params = new URLSearchParams(location.search);
          const next = params.get("next") || "/";
          console.log("[App] User authenticated, redirecting to", next);
          navigate(next);
        } else if (location.pathname === "/" && new URLSearchParams(location.search).get("next")) {
          // After OAuth callback lands on /?next=/node - redirect to next
          const next = new URLSearchParams(location.search).get("next") || "/";
          console.log("[App] OAuth callback with next, redirecting to", next);
          navigate(next);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

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
