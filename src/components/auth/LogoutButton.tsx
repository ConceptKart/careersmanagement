"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "btn btn-secondary btn-sm",
  label = "Sign out",
}: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      {label}
    </button>
  );
}
