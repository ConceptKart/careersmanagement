"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { CloseIcon, NAV_ICONS } from "@/components/admin/icons";
import { ADMIN_NAV, isAdminNavActive } from "@/lib/admin/nav";

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
  roles: string[];
};

export function Sidebar({ open, onClose, email, roles }: Props) {
  const pathname = usePathname();
  const roleLabel =
    roles.filter((role) => role !== "user").join(" · ") || "staff";

  return (
    <>
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`admin-sidebar${open ? " open" : ""}`}
        id="adminSidebar"
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-header">
          <Link href="/admin" onClick={onClose} className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">CK</span>
            <span>Admin Panel</span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_NAV.map((section) => (
            <div key={section.title}>
              <div className="nav-section">{section.title}</div>
              {section.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href, item.exact);
                const Icon = NAV_ICONS[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : undefined}
                    onClick={onClose}
                  >
                    {Icon ? <Icon /> : null}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="user-info">
            <div className="user-email">{email}</div>
            <div className="user-roles">{roleLabel}</div>
          </div>
          <LogoutButton className="btn" label="Sign out" />
        </div>
      </aside>
    </>
  );
}
