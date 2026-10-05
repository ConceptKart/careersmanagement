"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  AchievementsIcon,
  CloseIcon,
  DashboardIcon,
  DocsIcon,
  EmployeesIcon,
  FeedbackIcon,
} from "@/components/admin/icons";
import { isPortalNavActive, PORTAL_NAV } from "@/lib/portal/nav";
import { isStaffAdmin } from "@/lib/auth/roles";
import type { ReactNode } from "react";

type IconFn = (props: { size?: number }) => ReactNode;

const PORTAL_ICONS: Record<string, IconFn> = {
  "/portal": DashboardIcon,
  "/portal/profile": EmployeesIcon,
  "/portal/salary": DocsIcon,
  "/portal/documents": DocsIcon,
  "/portal/achievements": AchievementsIcon,
  "/portal/history": DocsIcon,
  "/portal/company-documents": DocsIcon,
  "/portal/feedback": FeedbackIcon,
};

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
  roles: string[];
};

export function PortalSidebar({ open, onClose, email, roles }: Props) {
  const pathname = usePathname();
  const staff = isStaffAdmin(roles);

  return (
    <>
      <div
        className={`sidebar-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`admin-sidebar${open ? " open" : ""}`}
        id="portalSidebar"
        aria-label="Portal navigation"
      >
        <div className="admin-sidebar-header">
          <Link href="/portal" onClick={onClose} className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">CK</span>
            <span>My Portal</span>
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
          {PORTAL_NAV.map((section) => (
            <div key={section.title}>
              <div className="nav-section">{section.title}</div>
              {section.items.map((item) => {
                const active = isPortalNavActive(pathname, item.href, item.exact);
                const Icon = PORTAL_ICONS[item.href];
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
            <div className="user-roles">Employee portal</div>
          </div>
          {staff ? (
            <Link href="/admin" className="btn" onClick={onClose} style={{ marginBottom: "0.5rem" }}>
              Switch to Admin
            </Link>
          ) : null}
          <LogoutButton className="btn" label="Sign out" />
        </div>
      </aside>
    </>
  );
}
