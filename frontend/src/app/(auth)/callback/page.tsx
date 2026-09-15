"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setErrorMsg("No token received from Microsoft login. Please try again.");
      return;
    }

    (async () => {
      try {
        // Temporarily store the token so the /me request can attach it
        useAuthStore.getState().setAuth(token, {
          userId: "", username: "", name: "", email: "",
          department: "", function: "", location: "", manager: "", role: "",
        });

        // Fetch the full profile and overwrite the placeholder
        const profile = await authService.getMe();
        useAuthStore.getState().setAuth(token, profile);

        // Replace the callback URL so the token is not kept in browser history
        router.replace("/submit");
      } catch {
        useAuthStore.getState().clearAuth();
        setErrorMsg("Sign-in failed. Please try again.");
      }
    })();
  }, [searchParams, router]);

  if (errorMsg) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", gap: 12, padding: 24,
        textAlign: "center",
      }}>
        <AlertCircle style={{ width: 32, height: 32, color: "var(--color-destructive, #ef4444)" }} />
        <p style={{ maxWidth: 400, color: "var(--color-foreground)" }}>{errorMsg}</p>
        <a href="/login" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", gap: 10,
    }}>
      <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
      <span>Completing sign-in…</span>
    </div>
  );
}
