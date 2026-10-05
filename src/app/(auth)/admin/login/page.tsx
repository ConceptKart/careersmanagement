import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { sanitizeCallbackUrl } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Admin sign in — Concept Kart Careers",
  description: "Sign in to the Concept Kart Careers admin panel and employee portal",
};

const SESSION_MESSAGES: Record<string, string> = {
  SessionRequired: "Your session has expired. Please sign in again.",
  CredentialsSignin: "Invalid email or password.",
};

type Props = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl) ?? undefined;
  const sessionMessage = params.error ? SESSION_MESSAGES[params.error] : undefined;

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="text-center" style={{ marginBottom: "2rem" }}>
          <div className="login-logo">CK</div>
          <h1 style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 700 }}>
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Concept Kart Careers admin panel
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} sessionMessage={sessionMessage} />
      </div>
    </div>
  );
}
