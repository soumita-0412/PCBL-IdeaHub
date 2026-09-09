import { apiClient } from "@/lib/api/axiosInstance";
import type { GroupReviewResponse } from "@/types/groupReview";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function getGroupReviews(): Promise<GroupReviewResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<GroupReviewResponse[]>>("/group-reviews");
  return data.data;
}
