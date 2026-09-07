import { apiClient } from "@/lib/api/axiosInstance";
import type { IdeaCreate, IdeaListItem, IdeaResponse } from "@/types/idea";

interface Apienvelope<T> {
  success: boolean;
  data: T;
}

export async function submitIdea(payload: IdeaCreate): Promise<IdeaResponse> {
  const { data } = await apiClient.post<Apienvelope<IdeaResponse>>("/ideas", payload);
  return data.data;
}

export async function getMyIdeas(): Promise<IdeaListItem[]> {
  const { data } = await apiClient.get<Apienvelope<IdeaListItem[]>>("/ideas/mine");
  return data.data;
}

export async function getIdeaById(id: string): Promise<IdeaResponse> {
  const { data } = await apiClient.get<Apienvelope<IdeaResponse>>(`/ideas/${id}`);
  return data.data;
}
