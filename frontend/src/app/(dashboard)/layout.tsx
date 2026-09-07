import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className={styles.shell}>
        <Sidebar />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
