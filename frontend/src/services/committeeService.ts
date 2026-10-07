import { apiClient } from "@/lib/api/axiosInstance";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface CommitteeStatus {
  is_committee_lead: boolean;
  is_committee_member: boolean;
  is_committee: boolean;
}

export async function getMyCommitteeStatus(): Promise<CommitteeStatus> {
  const { data } = await apiClient.get<ApiEnvelope<CommitteeStatus>>("/users/me/committee-status");
  return data.data;
}
