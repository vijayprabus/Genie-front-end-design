import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar.tsx";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary.tsx";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto" id="main-content">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
