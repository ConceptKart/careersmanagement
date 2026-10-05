"use client";

import { MenuIcon } from "@/components/admin/icons";
import { LogoutButton } from "@/components/auth/LogoutButton";

type Props = {
  email: string;
  roles: string[];
  onMenuClick: () => void;
};

export function Topbar({ email, roles, onMenuClick }: Props) {
  const roleLabel =
    roles.filter((role) => role !== "user").join(" · ") || "staff";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <MenuIcon size={22} />
        </button>
        <div className="admin-topbar-user">
          <span className="admin-topbar-email">{email}</span>
          <span className="admin-topbar-roles">{roleLabel}</span>
        </div>
      </div>

      <div className="admin-topbar-actions">
        <LogoutButton className="btn btn-secondary btn-sm" />
      </div>
    </header>
  );
}
