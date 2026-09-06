"use client";

import Link from "next/link";
import { ShieldOff } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { ROLE_LABELS } from "@/constants/roles";

export default function ForbiddenPage() {
  const { userProfile } = useAuthStore();
  const roleLabel =
    userProfile?.role
      ? ROLE_LABELS[userProfile.role as keyof typeof ROLE_LABELS] ?? userProfile.role
      : "Unknown";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
        <ShieldOff className="h-8 w-8" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your current role ({" "}
          <span className="font-medium text-amber-brand">{roleLabel}</span>{" "}
          ) does not have permission to view this page.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/my-ideas"
          className="rounded-lg bg-amber-brand px-4 py-2 text-sm font-semibold text-amber-dim transition-opacity hover:opacity-90"
        >
          My Ideas
        </Link>
      </div>
    </div>
  );
}
