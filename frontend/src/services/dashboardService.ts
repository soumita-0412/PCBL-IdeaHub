import { apiClient } from "@/lib/api/axiosInstance";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface MonthlyCount {
  month: string;
  year: number;
  count: number;
}

export interface FunnelItem {
  category: string;
  submitted: number;
  l1_approved: number;
  l2_approved: number;
}

export interface DashboardStats {
  total_submitted: number;
  manager_approved: number;
  group_approved: number;
  implemented: number;
  monthly_submissions: MonthlyCount[];
  by_function_funnel: FunnelItem[];
}

export interface RecentIdeaItem {
  id: string;
  submission_number: string;
  idea_title: string | null;
  category: string;
  submitter_name: string;
  status: string;
  l1_decision: string | null;
  l2_score: number | null;
  created_at: string;
}

export interface PaginatedIdeas {
  items: RecentIdeaItem[];
  total: number;
  page: number;
  pages: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<ApiEnvelope<DashboardStats>>("/dashboard/stats");
  return data.data;
}

export async function getRecentIdeas(page = 1, limit = 5): Promise<PaginatedIdeas> {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedIdeas>>("/dashboard/ideas", {
    params: { page, limit },
  });
  return data.data;
}
