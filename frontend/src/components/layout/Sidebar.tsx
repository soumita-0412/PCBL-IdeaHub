"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  FileText,
  ClipboardCheck,
  BarChart2,
  Archive,
  Lock,
  Lightbulb,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Users,
  Building2,
  Bell,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { Roles, ROLE_LABELS, hasMinRole, type Role } from "@/constants/roles";
import { useReviewCounts } from "@/hooks/use-review-counts";
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

const REVIEW_SUB_ITEMS = [
  { label: "Review as Manager",    href: "/review?mode=manager",    icon: <Users size={13} /> },
  { label: "Review as Management", href: "/review?mode=management", icon: <Building2 size={13} /> },
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
  const [reviewExpanded, setReviewExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  // Auto-expand Review sub-menu when on the review page
  useEffect(() => {
    if (pathname.startsWith("/review")) {
      setReviewExpanded(true);
    }
  }, [pathname]);

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
  const reviewLocked = !hasMinRole(userRole, Roles.L1_REVIEWER);
  const searchParams = useSearchParams();
  const isOnReview = pathname.startsWith("/review");
  const reviewCounts = useReviewCounts();

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

        {/* Review — expandable item */}
        {collapsed ? (
          /* Collapsed: single icon linking to /review */
          <Link
            href={reviewLocked ? "#" : "/review"}
            title={`Review${reviewCounts.total > 0 ? ` (${reviewCounts.total} pending)` : ""}`}
            className={`${styles.navItem} ${isOnReview ? styles.navItemActive : ""} ${reviewLocked ? styles.navItemLocked : ""} ${styles.navItemCollapsed}`}
            tabIndex={reviewLocked ? -1 : undefined}
          >
            <span className={styles.navIconWrap}>
              <ClipboardCheck size={16} />
              {!reviewLocked && reviewCounts.total > 0 && (
                <span className={styles.navIconBadge}>
                  {reviewCounts.total > 99 ? "99+" : reviewCounts.total}
                </span>
              )}
            </span>
          </Link>
        ) : (
          <>
            {/* Review parent toggle */}
            <button
              type="button"
              onClick={() => !reviewLocked && setReviewExpanded((v) => !v)}
              className={`${styles.navItem} ${styles.navToggle} ${isOnReview ? styles.navItemActive : ""} ${reviewLocked ? styles.navItemLocked : ""}`}
              tabIndex={reviewLocked ? -1 : undefined}
              title={reviewLocked ? "Review (locked)" : undefined}
            >
              <span className={styles.navIcon}><ClipboardCheck size={16} /></span>
              <span className={styles.navLabel}>Review</span>
              {reviewLocked ? (
                <span className={styles.navLock}><Lock size={12} /></span>
              ) : (
                <>
                  {reviewCounts.total > 0 && (
                    <BellBadge count={reviewCounts.total} size={13} />
                  )}
                  <span className={`${styles.navChevron} ${reviewExpanded ? styles.navChevronOpen : ""}`}>
                    <ChevronDown size={13} />
                  </span>
                </>
              )}
            </button>

            {/* Sub-items */}
            {reviewExpanded && !reviewLocked && (
              <div className={styles.subNav}>
                {REVIEW_SUB_ITEMS.map((sub) => {
                  const isManagementMode = searchParams.get("mode") === "management";
                  const isSubActive = isOnReview &&
                    (sub.href.includes("mode=management") ? isManagementMode : !isManagementMode);
                  const subCount = sub.href.includes("mode=management")
                    ? reviewCounts.management
                    : reviewCounts.manager;

                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`${styles.subNavItem} ${isSubActive ? styles.subNavItemActive : ""}`}
                    >
                      <span className={styles.subNavIcon}>{sub.icon}</span>
                      <span className={styles.subNavLabel}>{sub.label}</span>
                      {subCount > 0 && (
                        <BellBadge count={subCount} size={12} />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Dashboard, Admin Dashboard */}
        {NAV_ITEMS_BOTTOM.map((item) => {
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
