"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  FileText,
  BarChart2,
  Archive,
  Lock,
  Lightbulb,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  Building2,
  Bell,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { Roles, ROLE_LABELS, hasMinRole, type Role } from "@/constants/roles";
import { useReviewCounts } from "@/hooks/use-review-counts";
import { useCommitteeStatus } from "@/hooks/use-committee-status";
import styles from "./sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole?: string;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS_TOP: NavItem[] = [
  { label: "Submit Idea",      href: "/submit",     icon: <Plus size={16} /> },
  { label: "My Ideas",         href: "/my-ideas",   icon: <FileText size={16} /> },
  { label: "Repository",       href: "/repository", icon: <Archive size={16} />,   minRole: Roles.L1_REVIEWER },
];

const NAV_ITEMS_BOTTOM: NavItem[] = [
  { label: "Idea Submission Dashboard",        href: "/dashboard",  icon: <BarChart2 size={16} /> },
  { label: "Admin Dashboard",  href: "/admin",      icon: <Settings size={16} />,  minRole: Roles.ADMIN },
];


function BellBadge({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className={styles.bellBadgeWrap}>
      <Bell size={size} />
      <span className={styles.bellBadgeCount}>{count > 99 ? "99+" : count}</span>
    </span>
  );
}

function UserCard({ name, role, collapsed }: { name: string; role: string; collapsed: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const label = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role;
  const { logout } = useAuth();

  if (collapsed) {
    return (
      <button
        className={styles.footerCardCollapsed}
        onClick={() => void logout()}
        title={`${name} — Sign out`}
      >
        <div className={styles.userAvatar}>{initials}</div>
      </button>
    );
  }

  return (
    <div className={styles.footerCard}>
      <div className={styles.userAvatar}>{initials}</div>
      <div className={styles.userInfo}>
        <p className={styles.userName}>{name}</p>
        <p className={styles.userRole}>{label}</p>
      </div>
      <button className={styles.settingsBtn} onClick={() => void logout()} title="Sign out">
        <LogOut size={15} />
      </button>
    </div>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  };

  const userRole = userProfile?.role ?? "";
  const isManager = hasMinRole(userRole, Roles.L1_REVIEWER);
  const committeeStatus = useCommitteeStatus();
  // Super admin bypasses committee DB check and gets full access to both modes
  const canAccessManagement = committeeStatus.is_committee || userRole === Roles.SUPER_ADMIN;
  const searchParams = useSearchParams();
  const isOnReview = pathname.startsWith("/review");
  const reviewCounts = useReviewCounts({ isManager, isCommittee: canAccessManagement });
  const isManagerModeActive = isOnReview && searchParams.get("mode") === "manager";
  const isManagementModeActive = isOnReview && searchParams.get("mode") === "management";

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""} ${mobileOpen ? styles.sidebarMobileOpen : ""}`}>

      {/* Toggle button */}
      <button
        className={`${styles.toggleBtn} ${collapsed ? styles.toggleBtnCentered : ""}`}
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Brand */}
      <div className={`${styles.brand} ${collapsed ? styles.brandCollapsed : ""}`}>
        <div className={styles.brandIcon}>
          <Lightbulb size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className={styles.brandName}>IdeaHub</p>
            <p className={styles.brandSub}>Innovation Hub</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!collapsed && <span className={styles.navSection}>Navigation</span>}
      <nav className={styles.nav}>

        {/* Submit Idea, My Ideas, Repository */}
        {NAV_ITEMS_TOP.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isLocked = !!item.minRole && !hasMinRole(userRole, item.minRole as Role);

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : item.href}
              title={collapsed ? item.label : undefined}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""} ${isLocked ? styles.navItemLocked : ""} ${collapsed ? styles.navItemCollapsed : ""}`}
              tabIndex={isLocked ? -1 : undefined}
            >
              {collapsed ? (
                <span className={styles.navIconWrap}>{item.icon}</span>
              ) : (
                <>
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isLocked && <span className={styles.navLock}><Lock size={12} /></span>}
                </>
              )}
            </Link>
          );
        })}

        {/* Review as Manager — visible to managers only */}
        {isManager && (
          collapsed ? (
            <Link
              href="/review?mode=manager"
              title={`Review as Manager${reviewCounts.manager > 0 ? ` (${reviewCounts.manager} pending)` : ""}`}
              className={`${styles.navItem} ${isManagerModeActive ? styles.navItemActive : ""} ${styles.navItemCollapsed}`}
            >
              <span className={styles.navIconWrap}>
                <Users size={16} />
                {reviewCounts.manager > 0 && (
                  <span className={styles.navIconBadge}>
                    {reviewCounts.manager > 99 ? "99+" : reviewCounts.manager}
                  </span>
                )}
              </span>
            </Link>
          ) : (
            <Link
              href="/review?mode=manager"
              className={`${styles.navItem} ${isManagerModeActive ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}><Users size={16} /></span>
              <span className={styles.navLabel}>Review as Manager</span>
              {reviewCounts.manager > 0 && <BellBadge count={reviewCounts.manager} size={13} />}
            </Link>
          )
        )}

        {/* Review as Management — visible to committee leads/members and super admin */}
        {canAccessManagement && (
          collapsed ? (
            <Link
              href="/review?mode=management"
              title={`Review as Management${reviewCounts.management > 0 ? ` (${reviewCounts.management} pending)` : ""}`}
              className={`${styles.navItem} ${isManagementModeActive ? styles.navItemActive : ""} ${styles.navItemCollapsed}`}
            >
              <span className={styles.navIconWrap}>
                <Building2 size={16} />
                {reviewCounts.management > 0 && (
                  <span className={styles.navIconBadge}>
                    {reviewCounts.management > 99 ? "99+" : reviewCounts.management}
                  </span>
                )}
              </span>
            </Link>
          ) : (
            <Link
              href="/review?mode=management"
              className={`${styles.navItem} ${isManagementModeActive ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}><Building2 size={16} /></span>
              <span className={styles.navLabel}>Review as Management</span>
              {reviewCounts.management > 0 && <BellBadge count={reviewCounts.management} size={13} />}
            </Link>
          )
        )}

        {/* Dashboard (committee/super admin only), Admin Dashboard */}
        {NAV_ITEMS_BOTTOM.filter((item) =>
          item.href !== "/dashboard" || canAccessManagement
        ).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isLocked = !!item.minRole && !hasMinRole(userRole, item.minRole as Role);

          return (
            <Link
              key={item.href}
              href={isLocked ? "#" : item.href}
              title={collapsed ? item.label : undefined}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""} ${isLocked ? styles.navItemLocked : ""} ${collapsed ? styles.navItemCollapsed : ""}`}
              tabIndex={isLocked ? -1 : undefined}
            >
              {collapsed ? (
                <span className={styles.navIconWrap}>{item.icon}</span>
              ) : (
                <>
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isLocked && <span className={styles.navLock}><Lock size={12} /></span>}
                </>
              )}
            </Link>
          );
        })}

      </nav>

      {/* Footer user card */}
      <div className={`${styles.footer} ${collapsed ? styles.footerCollapsed : ""}`}>
        {userProfile && (
          <UserCard name={userProfile.name} role={userProfile.role} collapsed={collapsed} />
        )}
      </div>
    </aside>
  );
}
