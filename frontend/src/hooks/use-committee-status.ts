"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getMyCommitteeStatus, type CommitteeStatus } from "@/services/committeeService";

export interface CommitteeStatusWithReady extends CommitteeStatus {
  isReady: boolean;
}

const INITIAL: CommitteeStatusWithReady = {
  is_committee_lead: false,
  is_committee_member: false,
  is_committee: false,
  isReady: false,
};

export function useCommitteeStatus(): CommitteeStatusWithReady {
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<CommitteeStatusWithReady>(INITIAL);

  const fetchStatus = useCallback(() => {
    if (!isAuthenticated) {
      setStatus(INITIAL);
      return;
    }
    getMyCommitteeStatus()
      .then((data) => setStatus({ ...data, isReady: true }))
      .catch(() => setStatus({ ...INITIAL, isReady: true }));
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return status;
}
