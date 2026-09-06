"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 45%, #c4b5fd 100%)",
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-2xl shadow-violet-300/40">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Idea Portal</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Credential form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              {...register("username")}
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder="Enter your username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              className={cn(
                "h-11 w-full rounded-lg border bg-gray-50 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:bg-white focus:outline-none focus:ring-2",
                errors.username
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-violet-400 focus:ring-violet-200",
              )}
            />
            {errors.username && (
              <p id="username-error" className="text-xs text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  "h-11 w-full rounded-lg border bg-gray-50 px-3.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:bg-white focus:outline-none focus:ring-2",
                  errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:border-violet-400 focus:ring-violet-200",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Sign in with Microsoft — disabled until SSO is wired up */}
        <button
          type="button"
          disabled
          title="Microsoft SSO login — coming soon"
          className="relative flex h-11 w-full cursor-not-allowed select-none items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-400"
        >
          {/* Microsoft 4-square logo */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 21 21"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path fill="#f25022" d="M1 1h9v9H1z" />
            <path fill="#00a4ef" d="M11 1h9v9h-9z" />
            <path fill="#7fba00" d="M1 11h9v9H1z" />
            <path fill="#ffb900" d="M11 11h9v9h-9z" />
          </svg>
          Sign in with Microsoft
          <span className="absolute right-3 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-500">
            Coming soon
          </span>
        </button>
      </div>
    </div>
  );
}
