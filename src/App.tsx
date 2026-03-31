import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip.tsx";
import { AppLayout } from "@/shared/components/layout/AppLayout.tsx";
import { useAuthStore } from "@/modules/auth/store/authStore.ts";

const Login = lazy(() => import("@/modules/auth/pages/LoginPage/index.tsx"));
const Signup = lazy(() => import("@/modules/auth/pages/SignupPage/index.tsx"));
const ForgotPassword = lazy(() => import("@/modules/auth/pages/ForgotPasswordPage/index.tsx"));
const Analytics = lazy(() => import("@/modules/analytics/pages/AnalyticsComingSoonPage.tsx"));
const MarketplaceBrowse = lazy(() => import("@/modules/marketplace/pages/MarketplaceBrowsePage.tsx"));
const MarketplaceAgents = lazy(() => import("@/modules/marketplace/pages/MarketplaceAgentsPage.tsx"));
const GenieLayout = lazy(() => import("@/shared/components/layout/GenieLayout"));
const SettingsLayout = lazy(() => import("@/modules/settings/components/SettingsLayout"));
const GeneralTab = lazy(() => import("@/modules/settings/components/general/GeneralTab"));
const MembersTab = lazy(() => import("@/modules/settings/components/members/MembersTab"));
const TeamsTab = lazy(() => import("@/modules/settings/components/teams/TeamsTab"));
const NotificationsTab = lazy(() => import("@/modules/settings/components/notifications/NotificationsTab"));
const BillingTab = lazy(() => import("@/modules/settings/components/billing/BillingTab"));
const ApiTab = lazy(() => import("@/modules/settings/components/api/ApiTab"));
const ModelsTab = lazy(() => import("@/modules/settings/components/models/ModelsTab"));
const IntegrationsTab = lazy(() => import("@/modules/settings/components/integrations/IntegrationsTab"));
const IntegrationsV2 = lazy(() => import("@/modules/settings/components/integrations/IntegrationsV2"));
const IntegrationsV3 = lazy(() => import("@/modules/settings/components/integrations/IntegrationsV3"));
const IntegrationsV4 = lazy(() => import("@/modules/settings/components/integrations/IntegrationsV4"));
const IntegrationsV5 = lazy(() => import("@/modules/settings/components/integrations/IntegrationsV5"));
const AppsTab = lazy(() => import("@/modules/settings/components/integrations/AppsTab"));
const DataTab = lazy(() => import("@/modules/settings/components/integrations/DataTab"));
const HomePage = lazy(() => import("@/modules/home/components/HomePage"));
const ProfilePage = lazy(() => import("@/modules/profile/components/ProfilePage"));
const RolesPage = lazy(() => import("@/modules/roles/components/RolesPage"));
const RoleDetailPage = lazy(() => import("@/modules/roles/components/RoleDetailPage"));
const FleetViewPage = lazy(() => import("@/modules/workers/components/fleet/FleetViewPage"));
const KycWorkerLayout = lazy(() => import("@/modules/workers/components/KycWorkerLayout"));
const KycActivityTab = lazy(() => import("@/modules/workers/components/kyc/ActivityTab"));
const KycRecordsTab = lazy(() => import("@/modules/workers/components/kyc/RecordsTab"));
const KycConfigTab = lazy(() => import("@/modules/workers/components/kyc/ConfigurationTab"));
const IndexPage = lazy(() => import("@/pages/Index.tsx"));
const NotFound = lazy(() => import("@/pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 5 * 60 * 1000,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

/** Auth guard for Genie routes — GenieLayout handles the sidebar */
function GenieProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <GenieLayout />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes (old AppLayout) */}
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/marketplace/browse" element={<ProtectedRoute><MarketplaceBrowse /></ProtectedRoute>} />
      <Route path="/marketplace/agents" element={<ProtectedRoute><MarketplaceAgents /></ProtectedRoute>} />

      {/* Genie routes — shared sidebar, only content swaps */}
      <Route element={<GenieProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/roles/:roleId" element={<RoleDetailPage />} />
        <Route path="/workers" element={<FleetViewPage />} />
        <Route path="/workers/kyc" element={<KycWorkerLayout />}>
          <Route index element={<Navigate to="activity" replace />} />
          <Route path="activity" element={<KycActivityTab />} />
          <Route path="records" element={<KycRecordsTab />} />
          <Route path="configuration" element={<KycConfigTab />} />
        </Route>
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<GeneralTab />} />
          <Route path="members" element={<MembersTab />} />
          <Route path="teams" element={<TeamsTab />} />
          <Route path="notifications" element={<NotificationsTab />} />
          <Route path="billing" element={<BillingTab />} />
          <Route path="api" element={<ApiTab />} />
          <Route path="models" element={<ModelsTab />} />
          <Route path="integrations" element={<IntegrationsTab />} />
          <Route path="integrations-v2" element={<IntegrationsV2 />} />
          <Route path="integrations-v3" element={<IntegrationsV3 />} />
          <Route path="integrations-v4" element={<IntegrationsV4 />} />
          <Route path="integrations-v5" element={<IntegrationsV5 />} />
          <Route path="apps" element={<AppsTab />} />
          <Route path="data" element={<DataTab />} />
        </Route>
      </Route>

      {/* Index & fallback */}
      <Route path="/" element={<IndexPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
