/**
 * Axios instance with auth and error interceptors.
 *
 * - Attaches Bearer token from the auth store to every request.
 * - On 401: clears auth state and redirects to /login.
 * - On 403: redirects to /forbidden.
 */
import axios from "axios";

import { env } from "@/constants/env";
import { useAuthStore, isTokenExpired } from "@/stores/auth.store";

export const apiClient = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/${env.NEXT_PUBLIC_API_VERSION}`,
  timeout: env.NEXT_PUBLIC_API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach token before every request; reject immediately if token is expired
apiClient.interceptors.request.use((config) => {
  const { accessToken, clearAuth } = useAuthStore.getState();
  if (accessToken) {
    if (isTokenExpired(accessToken)) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired. Please log in again."));
    }
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/forbidden";
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);
