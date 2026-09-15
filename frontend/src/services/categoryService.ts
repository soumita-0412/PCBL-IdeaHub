import { apiClient } from "@/lib/api/axiosInstance";

export interface MatrixOption {
  label: string;
  weight: number;
}

export interface CommitteePerson {
  user_id: string;
  name: string;
  email: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  department: string;
  matrix: MatrixOption[];
  committee_lead: CommitteePerson | null;
  committee_members: CommitteePerson[];
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  department: string;
  matrix: MatrixOption[];
  committee_lead: CommitteePerson | null;
  committee_members: CommitteePerson[];
}

export interface CategoryUpdate {
  name?: string;
  department?: string;
  matrix?: MatrixOption[];
  committee_lead?: CommitteePerson | null;
  committee_members?: CommitteePerson[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function getCategories(): Promise<CategoryResponse[]> {
  const { data } = await apiClient.get<ApiEnvelope<CategoryResponse[]>>("/categories");
  return data.data;
}

export async function createCategory(payload: CategoryCreate): Promise<CategoryResponse> {
  const { data } = await apiClient.post<ApiEnvelope<CategoryResponse>>("/categories", payload);
  return data.data;
}

export async function updateCategory(id: string, payload: CategoryUpdate): Promise<CategoryResponse> {
  const { data } = await apiClient.put<ApiEnvelope<CategoryResponse>>(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function searchUsers(q: string): Promise<CommitteePerson[]> {
  const { data } = await apiClient.get<ApiEnvelope<CommitteePerson[]>>("/users/search", {
    params: { q },
  });
  return data.data;
}
