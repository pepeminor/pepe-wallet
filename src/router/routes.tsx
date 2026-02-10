import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { OnboardingPage } from '@/pages/Onboarding';
import { DashboardPage } from '@/pages/Dashboard';
import { SendPage } from '@/pages/Send';
import { ReceivePage } from '@/pages/Receive';
import { SwapPage } from '@/pages/Swap';
import { HistoryPage } from '@/pages/History';
import { SettingsPage } from '@/pages/Settings';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isInitialized = useStore((s) => s.isInitialized);
  if (!isInitialized) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const isInitialized = useStore((s) => s.isInitialized);
  if (isInitialized) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <OnboardingGuard>
            <AuthLayout>
              <OnboardingPage />
            </AuthLayout>
          </OnboardingGuard>
        }
      />
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/send/:tokenMint?" element={<SendPage />} />
        <Route path="/receive" element={<ReceivePage />} />
        <Route path="/swap/:inputMint?/:outputMint?" element={<SwapPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
