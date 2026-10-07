"use client";
import { useCallback, useEffect, useState } from "react";
import { getAllIdeas } from "@/services/ideaService";
import { getApprovedManagerApprovals } from "@/services/managerApprovalService";

export const REVIEW_COUNTS_CHANGED = "review-counts-changed";

export interface ReviewCounts {
  manager: number;
  management: number;
  total: number;
}

export function useReviewCounts({
  isManager,
  isCommittee,
}: {
  isManager: boolean;
  isCommittee: boolean;
}): ReviewCounts {
  const [counts, setCounts] = useState<ReviewCounts>({ manager: 0, management: 0, total: 0 });

  const fetchCounts = useCallback(() => {
    if (!isManager && !isCommittee) return;

    const managerFetch = isManager ? getAllIdeas() : Promise.resolve([]);
    const committeeFetch = isCommittee ? getApprovedManagerApprovals() : Promise.resolve([]);

    Promise.all([managerFetch, committeeFetch])
      .then(([ideas, approvals]) => {
        const managerCount = isManager ? ideas.filter((i) => i.status === "submitted").length : 0;
        const managementCount = isCommittee ? approvals.length : 0;
        setCounts({ manager: managerCount, management: managementCount, total: managerCount + managementCount });
      })
      .catch(() => {/* silent */});
  }, [isManager, isCommittee]);

  useEffect(() => {
    fetchCounts();

    const interval = setInterval(fetchCounts, 30_000);
    window.addEventListener(REVIEW_COUNTS_CHANGED, fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener(REVIEW_COUNTS_CHANGED, fetchCounts);
    };
  }, [fetchCounts]);

  return counts;
}
