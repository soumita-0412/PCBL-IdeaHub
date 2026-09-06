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
} from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/stores/auth.store";
import { Roles } from "@/constants/roles";
import { ROLE_LABELS } from "@/constants/roles";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  minRole?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Submit Idea",
    href: "/submit",
    icon: <Plus className="h-4 w-4" />,
  },
  {
    label: "My Ideas",
    href: "/my-ideas",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Review",
    href: "/review",
    icon: <ClipboardCheck className="h-4 w-4" />,
    minRole: Roles.L1_REVIEWER,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <BarChart2 className="h-4 w-4" />,
    minRole: Roles.L1_REVIEWER,
  },
  {
    label: "Repository",
    href: "/repository",
    icon: <Archive className="h-4 w-4" />,
    minRole: Roles.L1_REVIEWER,
  },
];

function UserChip({ profile }: { profile: { name: string; role: string } }) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "bg-amber-500",
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-rose-500",
  ];
  const colorIdx =
    profile.name.charCodeAt(0) % colors.length;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
          colors[colorIdx],
        )}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role}
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();

  return (
    <aside className="flex h-screen w-[200px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-brand/20 text-amber-brand">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">IdeaPortal</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Innovation Hub</p>
        </div>
      </div>

      {/* ── Spacer ────────────────────────────────────────── */}
      <div className="mx-3 mb-3 h-px bg-border" />

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isRestricted = !!item.minRole;

          const linkContent = (
            <Link
              key={item.href}
              href={isRestricted && userProfile ? item.href : (isRestricted ? "#" : item.href)}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-active font-semibold text-amber-brand"
                  : "text-muted-foreground hover:bg-sidebar-active/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  isActive ? "text-amber-brand" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-brand px-1.5 text-[10px] font-bold text-amber-dim">
                  {item.badge}
                </span>
              )}
              {isRestricted && !isActive && (
                <Lock className="h-3 w-3 opacity-40" />
              )}
            </Link>
          );

          return linkContent;
        })}
      </nav>

      {/* ── User ──────────────────────────────────────────── */}
      <div className="mx-3 mb-1 h-px bg-border" />
      {userProfile && <UserChip profile={userProfile} />}
      <div className="pb-2" />
    </aside>
  );
}
