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

const BUBBLES = [
  { size: 28, left: "5%",  delay: "0s",   duration: "8s",  color: "rgba(210, 100, 220, 0.18)" },
  { size: 36, left: "12%", delay: "1.2s", duration: "10s", color: "rgba(140, 200, 80,  0.18)" },
  { size: 22, left: "20%", delay: "2.5s", duration: "7s",  color: "rgba(210, 100, 220, 0.14)" },
  { size: 44, left: "28%", delay: "0.5s", duration: "11s", color: "rgba(140, 200, 80,  0.2)"  },
  { size: 30, left: "36%", delay: "3.1s", duration: "9s",  color: "rgba(210, 100, 220, 0.16)" },
  { size: 52, left: "45%", delay: "1.8s", duration: "12s", color: "rgba(140, 200, 80,  0.15)" },
  { size: 20, left: "53%", delay: "4.2s", duration: "8s",  color: "rgba(210, 100, 220, 0.2)"  },
  { size: 38, left: "61%", delay: "0.9s", duration: "10s", color: "rgba(140, 200, 80,  0.18)" },
  { size: 26, left: "68%", delay: "2.7s", duration: "7s",  color: "rgba(210, 100, 220, 0.16)" },
  { size: 48, left: "75%", delay: "5.0s", duration: "11s", color: "rgba(140, 200, 80,  0.18)" },
  { size: 18, left: "82%", delay: "1.5s", duration: "9s",  color: "rgba(210, 100, 220, 0.18)" },
  { size: 34, left: "88%", delay: "3.8s", duration: "10s", color: "rgba(140, 200, 80,  0.2)"  },
  { size: 56, left: "93%", delay: "0.3s", duration: "13s", color: "rgba(210, 100, 220, 0.12)" },
  { size: 24, left: "8%",  delay: "6.5s", duration: "8s",  color: "rgba(140, 200, 80,  0.15)" },
  { size: 40, left: "42%", delay: "7.2s", duration: "9s",  color: "rgba(210, 100, 220, 0.16)" },
  { size: 46, left: "58%", delay: "4.7s", duration: "11s", color: "rgba(140, 200, 80,  0.18)" },
  { size: 20, left: "72%", delay: "2.1s", duration: "7s",  color: "rgba(210, 100, 220, 0.2)"  },
  { size: 60, left: "15%", delay: "8.0s", duration: "12s", color: "rgba(140, 200, 80,  0.14)" },
];

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

      {/* ── Bubbles background ──────────────────────────────── */}
      <div className={styles.bubbles} aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className={styles.bubble}
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              background: b.color,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>

      {/* ── Main card ───────────────────────────────────────── */}
      <div className={styles.card}>

        {/* Logo + title */}
        <div className={styles.logoArea}>
          <img src="/idealogo.png" alt="Idea Logo" 
          width={100}
          height={100}/>
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
