import { apiClient } from "@/lib/api/axiosInstance";
import type { ManagerApprovalResponse } from "@/types/managerApproval";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function getApprovedManagerApprovals(): Promise<ManagerApprovalResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<ManagerApprovalResponse[]>>(
    "/manager-approvals?decision=approved"
  );
  return data.data;
}

export async function getAllManagerApprovals(): Promise<ManagerApprovalResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<ManagerApprovalResponse[]>>("/manager-approvals");
  return data.data;
}
