import { isAxiosError } from "axios";

import type { ApiError } from "@/types";

export function useApiError() {
  const parseError = (error: unknown): ApiError => {
    if (isAxiosError<ApiError>(error) && error.response?.data) {
      return error.response.data;
    }
    if (error instanceof Error) {
      return { detail: error.message };
    }
    return { detail: "An unexpected error occurred." };
  };

  return { parseError };
}
