"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore, isTokenExpired, tokenExpiresIn } from "@/stores/auth.store";

/**
 * Invisible component that sets a precise timer to redirect the user to /login
 * the moment their access token expires — even if they are idle on the page.
 * Place this inside any authenticated layout.
 */
export function SessionExpiryWatcher() {
  const { accessToken, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken || isTokenExpired(accessToken)) return;

    const ms = tokenExpiresIn(accessToken);
    if (ms <= 0) return;

    const timer = setTimeout(() => {
      clearAuth();
      router.replace("/login");
    }, ms);

    return () => clearTimeout(timer);
  }, [accessToken, clearAuth, router]);

  return null;
}
