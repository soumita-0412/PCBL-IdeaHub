/**
 * TanStack Query key factory.
 * Centralised here so invalidation is consistent across the app.
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideas.all })
 */

export const QUERY_KEYS = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
} as const;
