"use client";
import { useCallback, useEffect, useState } from "react";
import { getAllIdeas } from "@/services/ideaService";
import { getApprovedManagerApprovals } from "@/services/managerApprovalService";
import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, Roles } from "@/constants/roles";

export const REVIEW_COUNTS_CHANGED = "review-counts-changed";

export interface ReviewCounts {
  manager: number;
  management: number;
  total: number;
}

export function useReviewCounts(): ReviewCounts {
  const { userProfile } = useAuthStore();
  const [counts, setCounts] = useState<ReviewCounts>({ manager: 0, management: 0, total: 0 });

  const fetchCounts = useCallback(() => {
    if (!hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER)) return;

    Promise.all([getAllIdeas(), getApprovedManagerApprovals()])
      .then(([ideas, approvals]) => {
        const managerCount = ideas.filter((i) => i.status === "submitted").length;
        const managementCount = approvals.length;
        setCounts({ manager: managerCount, management: managementCount, total: managerCount + managementCount });
      })
      .catch(() => {/* silent */});
  }, [userProfile?.role]);

  useEffect(() => {
    fetchCounts();

    // Poll every 30 s so the badge stays fresh without a page reload
    const interval = setInterval(fetchCounts, 30_000);

    // Immediately refresh when a review action fires this event
    window.addEventListener(REVIEW_COUNTS_CHANGED, fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener(REVIEW_COUNTS_CHANGED, fetchCounts);
    };
  }, [fetchCounts]);

  return counts;
}
