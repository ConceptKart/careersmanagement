type LogContext = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "secret",
  "authorization",
  "cookie",
  "AUTH_SECRET",
  "DATABASE_URL",
]);

function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.has(key) || /password|secret|token/i.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Server-side logging helper. Never logs secrets; keeps messages structured.
 */
export const logger = {
  error(scope: string, err: unknown, context?: LogContext) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    const digest =
      err instanceof Error && "digest" in err
        ? String((err as Error & { digest?: string }).digest ?? "")
        : undefined;
    console.error(
      JSON.stringify({
        level: "error",
        scope,
        message,
        ...(digest ? { digest } : {}),
        ...(sanitizeContext(context) ?? {}),
      }),
    );
  },

  warn(scope: string, message: string, context?: LogContext) {
    console.warn(
      JSON.stringify({
        level: "warn",
        scope,
        message,
        ...(sanitizeContext(context) ?? {}),
      }),
    );
  },

  info(scope: string, message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "production") return;
    console.info(
      JSON.stringify({
        level: "info",
        scope,
        message,
        ...(sanitizeContext(context) ?? {}),
      }),
    );
  },
};
