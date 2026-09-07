import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";
import { Sidebar } from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SessionExpiryWatcher />
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
