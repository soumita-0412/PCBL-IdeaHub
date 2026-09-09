"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import styles from "./login.module.css";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.username, data.password);
      router.replace("/dashboard");
    } catch {
      setServerError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className={styles.page}>

      {/* ── Main card ───────────────────────────────────────── */}
      <div className={styles.card}>

        {/* Logo + title */}
        <div className={styles.logoArea}>
          <svg
            className={styles.logoIcon}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="56" height="56" rx="14" fill="rgba(137,8,146,0.1)" />
            <path d="M28 11a10 10 0 0 1 6.5 17.5V33H21.5v-4.5A10 10 0 0 1 28 11z" fill="#890892" opacity="0.85" />
            <rect x="22" y="33" width="12" height="3" rx="1.5" fill="#890892" opacity="0.6" />
            <rect x="24" y="36" width="8" height="2.5" rx="1.25" fill="#890892" opacity="0.4" />
            <circle cx="28" cy="24" r="3.5" fill="#81c451" opacity="0.45" />
            <path d="M28 7V5M36.5 9.5l1.5-1.5M41 19h2M36.5 28.5l1.5 1.5M19.5 9.5L18 8M15 19h-2M19.5 28.5L18 30" stroke="#81c451" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <h1 className={styles.title}>Idea Portal</h1>
          <p className={styles.subtitle}>Innovation Hub</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>

          {serverError && (
            <div role="alert" className={styles.serverError}>
              <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Username */}
          <div className={styles.fieldGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              {...register("username")}
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder="Enter your username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              className={cn(styles.input, errors.username && styles.inputError)}
            />
            {errors.username && (
              <p id="username-error" className={styles.errorText}>{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(styles.input, errors.password && styles.inputError)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                className={styles.passwordToggle}
              >
                {showPassword
                  ? <EyeOff style={{ width: 16, height: 16 }} aria-hidden="true" />
                  : <Eye    style={{ width: 16, height: 16 }} aria-hidden="true" />
                }
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className={styles.errorText}>{errors.password.message}</p>
            )}
          </div>

          {/* Sign In */}
          <button type="submit" disabled={isSubmitting} className={styles.signInBtn}>
            {isSubmitting ? (
              <>
                <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Microsoft SSO — disabled until Phase 2 */}
        <button
          type="button"
          disabled
          title="Microsoft SSO coming soon"
          className={styles.msBtn}
        >
          <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#f25022" d="M1 1h9v9H1z" />
            <path fill="#00a4ef" d="M11 1h9v9h-9z" />
            <path fill="#7fba00" d="M1 11h9v9H1z" />
            <path fill="#ffb900" d="M11 11h9v9h-9z" />
          </svg>
          Sign in with Microsoft
          <span className={styles.msBadge}>Coming soon</span>
        </button>
      </div>
    </div>
  );
}
