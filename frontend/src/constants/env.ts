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
  // Each variable must be referenced explicitly so Next.js can inline
  // NEXT_PUBLIC_* values at build time. Passing process.env as a whole
  // object prevents the bundler from replacing them, causing Zod to
  // fall back to defaults in the client bundle.
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
    NEXT_PUBLIC_AZURE_TENANT_ID: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
    NEXT_PUBLIC_AZURE_REDIRECT_URI: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
    NEXT_PUBLIC_AZURE_POST_LOGOUT_REDIRECT_URI:
      process.env.NEXT_PUBLIC_AZURE_POST_LOGOUT_REDIRECT_URI,
    NEXT_PUBLIC_ENABLE_DEVTOOLS: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS,
    NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS:
      process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  });
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
