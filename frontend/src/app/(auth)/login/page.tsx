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

/* ── Floating decorative background elements ───────────────────
   These mimic the frosted-glass mini-cards from the design.
   All are purely visual, positioned with absolute CSS.
─────────────────────────────────────────────────────────────── */
const FLOAT_CARDS = [
  { top: "4%",  left: "3%",  size: 72, icon: "bar",    anim: styles.floatA, delay: "0s"    },
  { top: "9%",  left: "32%", size: 60, icon: "line",   anim: styles.floatB, delay: "1.2s"  },
  { top: "6%",  left: "68%", size: 64, icon: "area",   anim: styles.floatC, delay: "0.6s"  },
  { top: "6%",  left: "85%", size: 56, icon: "bar2",   anim: styles.floatD, delay: "2s"    },
  { top: "33%", left: "2%",  size: 64, icon: "donut",  anim: styles.floatB, delay: "0.8s"  },
  { top: "38%", left: "88%", size: 58, icon: "line",   anim: styles.floatA, delay: "1.5s"  },
  { top: "55%", left: "28%", size: 56, icon: "bar",    anim: styles.floatC, delay: "0.3s"  },
  { top: "60%", left: "72%", size: 62, icon: "area",   anim: styles.floatD, delay: "1s"    },
  { top: "78%", left: "5%",  size: 60, icon: "donut",  anim: styles.floatE, delay: "0.5s"  },
  { top: "80%", left: "42%", size: 54, icon: "bar2",   anim: styles.floatB, delay: "1.8s"  },
  { top: "82%", left: "80%", size: 66, icon: "bar",    anim: styles.floatF, delay: "0.9s"  },
];

const FLOAT_DOTS = [
  { top: "20%", left: "18%", size: 10, anim: styles.floatC, delay: "0.4s"  },
  { top: "15%", left: "55%", size: 8,  anim: styles.floatA, delay: "1.1s"  },
  { top: "48%", left: "14%", size: 14, anim: styles.floatD, delay: "0.7s"  },
  { top: "52%", left: "60%", size: 10, anim: styles.floatB, delay: "1.6s"  },
  { top: "70%", left: "90%", size: 12, anim: styles.floatE, delay: "0.2s"  },
  { top: "88%", left: "22%", size: 8,  anim: styles.floatC, delay: "1.3s"  },
  { top: "25%", left: "78%", size: 16, anim: styles.floatF, delay: "0.6s"  },
];

function ChartIcon({ type, size }: { type: string; size: number }) {
  const s = size - 20;
  const col1 = "#a855f7";
  const col2 = "#22c55e";

  if (type === "bar") return (
    <svg width={s} height={s} viewBox="0 0 32 28" fill="none">
      <rect x="2"  y="12" width="7" height="16" rx="2" fill={col1} opacity="0.8" />
      <rect x="12" y="6"  width="7" height="22" rx="2" fill={col1} />
      <rect x="22" y="16" width="7" height="12" rx="2" fill={col1} opacity="0.6" />
      <path d="M2 4 L14 1 L28 8" stroke={col2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  if (type === "bar2") return (
    <svg width={s} height={s} viewBox="0 0 32 28" fill="none">
      <rect x="2"  y="18" width="6" height="10" rx="1.5" fill={col1} opacity="0.7" />
      <rect x="10" y="10" width="6" height="18" rx="1.5" fill={col1} />
      <rect x="18" y="14" width="6" height="14" rx="1.5" fill={col1} opacity="0.85" />
      <rect x="26" y="6"  width="6" height="22" rx="1.5" fill={col1} opacity="0.65" />
    </svg>
  );

  if (type === "line") return (
    <svg width={s} height={s} viewBox="0 0 36 28" fill="none">
      <polyline points="2,22 10,14 18,16 26,8 34,4" stroke={col2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="2"  cy="22" r="2.5" fill={col2} />
      <circle cx="18" cy="16" r="2.5" fill={col2} />
      <circle cx="34" cy="4"  r="2.5" fill={col2} />
    </svg>
  );

  if (type === "area") return (
    <svg width={s} height={s} viewBox="0 0 36 28" fill="none">
      <path d="M2 24 L10 16 L18 18 L26 10 L34 6 L34 26 L2 26 Z" fill={col1} opacity="0.25" />
      <polyline points="2,24 10,16 18,18 26,10 34,6" stroke={col1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );

  if (type === "donut") return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke={col1} strokeWidth="5" strokeDasharray="50 32" strokeLinecap="round" />
      <circle cx="16" cy="16" r="13" stroke={col2} strokeWidth="5" strokeDasharray="30 52" strokeLinecap="round" strokeDashoffset="-50" />
    </svg>
  );

  return null;
}

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

      {/* ── Floating decorative background ──────────────────── */}
      <div className={styles.decorLayer} aria-hidden="true">
        {FLOAT_CARDS.map((el, i) => (
          <div
            key={i}
            className={cn(styles.floatCard, el.anim)}
            style={{
              top: el.top,
              left: el.left,
              width: el.size,
              height: el.size,
              animationDelay: el.delay,
            }}
          >
            <ChartIcon type={el.icon} size={el.size} />
          </div>
        ))}
        {FLOAT_DOTS.map((dot, i) => (
          <div
            key={i}
            className={cn(styles.floatDot, dot.anim)}
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* ── Main card ───────────────────────────────────────── */}
      <div className={styles.card}>

        {/* Logo + title */}
        <div className={styles.logoArea}>
          {/* Chart-with-arrow logo SVG */}
          <svg
            className={styles.logoIcon}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="56" height="56" rx="14" fill="rgba(139,92,246,0.12)" />
            <rect x="10" y="32" width="8"  height="14" rx="2" fill="#7c3aed" opacity="0.75" />
            <rect x="22" y="24" width="8"  height="22" rx="2" fill="#7c3aed" />
            <rect x="34" y="28" width="8"  height="18" rx="2" fill="#7c3aed" opacity="0.85" />
            <path d="M10 28 L22 18 L34 22 L46 10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M40 8 L46 8 L46 14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
