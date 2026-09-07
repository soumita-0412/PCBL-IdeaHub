"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  FileText,
  ClipboardCheck,
  BarChart2,
  Archive,
  Lock,
  Lightbulb,
  LogOut,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { Roles, ROLE_LABELS } from "@/constants/roles";
import styles from "./sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Submit Idea", href: "/submit", icon: <Plus size={16} /> },
  { label: "My Ideas",    href: "/my-ideas", icon: <FileText size={16} /> },
  { label: "Review",      href: "/review",   icon: <ClipboardCheck size={16} />, minRole: Roles.L1_REVIEWER },
  { label: "Dashboard",   href: "/dashboard", icon: <BarChart2 size={16} />,     minRole: Roles.L1_REVIEWER },
  { label: "Repository",  href: "/repository", icon: <Archive size={16} />,      minRole: Roles.L1_REVIEWER },
];

const AVATAR_COLORS = [
  "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#f43f5e",
];

function UserChip({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  const label = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role;

  return (
    <div className={styles.userChip}>
      <div className={styles.userAvatar} style={{ background: color }}>
        {initials}
      </div>
      <div style={{ minWidth: 0 }}>
        <p className={styles.userName}>{name}</p>
        <p className={styles.userRole}>{label}</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();
  const { logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Lightbulb size={16} />
        </div>
        <div>
          <p className={styles.brandName}>IdeaPortal</p>
          <p className={styles.brandSub}>Innovation Hub</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isRestricted = !!item.minRole;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {isRestricted && !isActive && (
                <span className={styles.navLock}>
                  <Lock size={12} />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user chip + sign out */}
      <div className={styles.footer}>
        <div className={styles.userDivider} />
        {userProfile && <UserChip name={userProfile.name} role={userProfile.role} />}
        <button className={styles.signOutBtn} onClick={logout}>
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
