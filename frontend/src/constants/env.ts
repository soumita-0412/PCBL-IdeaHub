import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "uat", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("0.0.0"),

  // Default to localhost so the app works with no .env.local in development
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000"),
  NEXT_PUBLIC_API_VERSION: z.string().default("v1"),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(30000),

  // Azure AD — Phase 2+ SSO, optional in Phase 1 (pickle auth)
  NEXT_PUBLIC_AZURE_CLIENT_ID: z.string().optional().default(""),
  NEXT_PUBLIC_AZURE_TENANT_ID: z.string().optional().default(""),
  NEXT_PUBLIC_AZURE_REDIRECT_URI: z.string().optional().default(""),
  NEXT_PUBLIC_AZURE_POST_LOGOUT_REDIRECT_URI: z.string().optional().default(""),

  NEXT_PUBLIC_ENABLE_DEVTOOLS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("warn"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    console.error("❌ Invalid environment variables:", issues);
    throw new Error(
      `Invalid env vars: ${Object.keys(issues).join(", ")} — check .env.local`,
    );
  }
  return parsed.data;
}

export const env: Env = validateEnv();
