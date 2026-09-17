import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SessionExpiryWatcher />
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
