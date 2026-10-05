"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { resolvePostLoginPath } from "@/lib/auth/redirects";
import { loginSchema } from "@/validators/auth.schema";

type Props = {
  callbackUrl?: string;
  sessionMessage?: string;
};

export function LoginForm({ callbackUrl, sessionMessage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"email" | "password", string>>
  >({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const nextErrors: Partial<Record<"email" | "password", string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          nextErrors[field] ??= issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      const session = await getSession();
      const roles = session?.user?.roles ?? [];
      const destination = resolvePostLoginPath(roles, callbackUrl);
      router.replace(destination);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="login-card auth-login-form" noValidate>
      {sessionMessage ? (
        <div className="alert alert-error" role="alert">
          {sessionMessage}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input${fieldErrors.email ? " error" : ""}`}
          autoComplete="email"
          autoFocus
          disabled={pending}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email ? (
          <div className="form-error" id="email-error">
            {fieldErrors.email}
          </div>
        ) : null}
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <div className="auth-password-field">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            className={`form-input${fieldErrors.password ? " error" : ""}`}
            autoComplete="current-password"
            disabled={pending}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={pending}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {fieldErrors.password ? (
          <div className="form-error" id="password-error">
            {fieldErrors.password}
          </div>
        ) : null}
      </div>

      <label className="auth-remember-me">
        <input type="checkbox" name="remember" disabled={pending} />
        <span>Remember me</span>
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
