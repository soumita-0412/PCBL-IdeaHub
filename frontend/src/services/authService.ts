import { apiClient } from "@/lib/api/axiosInstance";
import { useAuthStore } from "@/stores/auth.store";
import type { TokenResponse, UserProfile } from "@/types/auth";

function mapProfile(raw: TokenResponse["user"]): UserProfile {
  return {
    userId: raw.user_id,
    username: raw.username,
    name: raw.name,
    email: raw.email,
    department: raw.department,
    function: raw.function,
    location: raw.location,
    manager: raw.manager,
    role: raw.role,
  };
}

export const authService = {
  async login(username: string, password: string): Promise<void> {
    const { data } = await apiClient.post<TokenResponse>("/auth/login", {
      username,
      password,
    });
    const profile = mapProfile(data.user);
    useAuthStore.getState().setAuth(data.access_token, profile);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always clear client-side state, even if the request fails
      useAuthStore.getState().clearAuth();
    }
  },

  async getMe(): Promise<UserProfile> {
    const { data } = await apiClient.get<TokenResponse["user"]>("/auth/me");
    return mapProfile(data);
  },
};
