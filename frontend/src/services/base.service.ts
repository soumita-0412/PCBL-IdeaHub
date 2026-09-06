import type { AxiosRequestConfig } from "axios";

import { apiClient } from "@/lib/axios";
import type { ListParams, PaginatedResponse } from "@/types";

export class BaseService<T> {
  constructor(protected readonly resource: string) {}

  protected async get<R = T>(
    path = "",
    config?: AxiosRequestConfig
  ): Promise<R> {
    const { data } = await apiClient.get<R>(`${this.resource}${path}`, config);
    return data;
  }

  protected async list(params?: ListParams): Promise<PaginatedResponse<T>> {
    const { data } = await apiClient.get<PaginatedResponse<T>>(this.resource, {
      params,
    });
    return data;
  }

  protected async post<B, R = T>(body: B, path = ""): Promise<R> {
    const { data } = await apiClient.post<R>(`${this.resource}${path}`, body);
    return data;
  }

  protected async put<B, R = T>(id: string, body: B): Promise<R> {
    const { data } = await apiClient.put<R>(`${this.resource}/${id}`, body);
    return data;
  }

  protected async patch<B, R = T>(id: string, body: B): Promise<R> {
    const { data } = await apiClient.patch<R>(`${this.resource}/${id}`, body);
    return data;
  }

  protected async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.resource}/${id}`);
  }
}
