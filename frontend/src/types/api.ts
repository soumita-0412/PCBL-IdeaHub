import type { AxiosResponse } from "axios";

/** Typed wrapper around an Axios response. */
export type ApiResponse<T> = AxiosResponse<T>;

/** HTTP methods the API client supports. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Params passed to list/search endpoints. */
export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
