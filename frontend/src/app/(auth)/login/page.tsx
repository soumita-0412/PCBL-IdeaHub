"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { env } from "@/constants/env";
import { cn } from "@/lib/utils";
import styles from "./login.module.css";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const CAROUSEL_IMAGES = ["/idea1.png", "/idea2.png", "/idea3.png"];

const SSO_AUTHORIZE_URL = `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/sso/authorize`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

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

  const onSsoLogin = () => {
    // Full browser navigation — backend handles the entire OAuth dance
    window.location.href = SSO_AUTHORIZE_URL;
  };

  return (
    <div className={styles.page}>

      {/* ── Corner blobs ──────────────────────────────────────── */}
      <div className={styles.blobTopLeft}     aria-hidden="true" />
      <div className={styles.blobBottomLeft}  aria-hidden="true" />
      <div className={styles.blobBottomRight} aria-hidden="true" />

      {/* ── Left panel — form ──────────────────────────────────── */}
      <div className={styles.leftPanel}>
        <div className={styles.formContainer}>

          <div className={styles.logoArea}>
            <img src="/idealogo.png" alt="Idea Logo" width={72} height={72} />
          </div>

          <h1 className={styles.welcome}>Welcome</h1>
          <p className={styles.subtitle}>Sign in to Idea Portal</p>

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

          {/* Microsoft SSO — navigates to backend; OAuth dance happens server-side */}
          <button
            type="button"
            onClick={onSsoLogin}
            disabled={isSubmitting}
            className={styles.msBtn}
          >
            <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#f25022" d="M1 1h9v9H1z" />
              <path fill="#00a4ef" d="M11 1h9v9h-9z" />
              <path fill="#7fba00" d="M1 11h9v9H1z" />
              <path fill="#ffb900" d="M11 11h9v9h-9z" />
            </svg>
            Sign in with Microsoft
          </button>

        </div>
      </div>

      {/* ── Right panel — carousel ─────────────────────────────── */}
      <div className={styles.rightPanel}>
        <div className={styles.carouselCard}>
          <div className={styles.carousel}>
            <div
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_IMAGES.map((src, i) => (
                <div key={i} className={styles.carouselSlide}>
                  <img src={src} alt={`Idea showcase ${i + 1}`} className={styles.carouselImage} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dots}>
            {CAROUSEL_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(styles.dot, i === currentSlide && styles.dotActive)}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative accent corner */}
        <div className={styles.accentCorner} aria-hidden="true" />
      </div>

    </div>
  );
}
