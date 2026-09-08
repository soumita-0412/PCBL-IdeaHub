import { apiClient } from "@/lib/api/axiosInstance";

export interface MatrixOption {
  label: string;
  weight: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  department: string;
  matrix: MatrixOption[];
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  department: string;
  matrix: MatrixOption[];
}

export interface CategoryUpdate {
  name?: string;
  department?: string;
  matrix?: MatrixOption[];
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
