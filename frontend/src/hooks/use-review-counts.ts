"use client";
import { useEffect, useState } from "react";
import { getAllIdeas } from "@/services/ideaService";
import { getApprovedManagerApprovals } from "@/services/managerApprovalService";
import { useAuthStore } from "@/stores/auth.store";
import { hasMinRole, Roles } from "@/constants/roles";

export interface ReviewCounts {
  manager: number;
  management: number;
  total: number;
}

export function useReviewCounts(): ReviewCounts {
  const { userProfile } = useAuthStore();
  const [counts, setCounts] = useState<ReviewCounts>({ manager: 0, management: 0, total: 0 });

  useEffect(() => {
    if (!hasMinRole(userProfile?.role ?? "", Roles.L1_REVIEWER)) return;

    Promise.all([getAllIdeas(), getApprovedManagerApprovals()])
      .then(([ideas, approvals]) => {
        const managerCount = ideas.filter((i) => i.status === "submitted").length;
        const managementCount = approvals.length;
        setCounts({ manager: managerCount, management: managementCount, total: managerCount + managementCount });
      })
      .catch(() => {/* silent */});
  }, [userProfile?.role]);

  return counts;
}
