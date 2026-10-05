"use client";

import { MenuIcon } from "@/components/admin/icons";
import { LogoutButton } from "@/components/auth/LogoutButton";

type Props = {
  email: string;
  fullName?: string | null;
  onMenuClick: () => void;
};

export function PortalHeader({ email, fullName, onMenuClick }: Props) {
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
          <span className="admin-topbar-email">{fullName ?? email}</span>
          <span className="admin-topbar-roles">{email}</span>
        </div>
      </div>
      <div className="admin-topbar-actions">
        <LogoutButton className="btn btn-secondary btn-sm" />
      </div>
    </header>
  );
}
