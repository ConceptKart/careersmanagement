export type PortalNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export type PortalNavSection = {
  title: string;
  items: PortalNavItem[];
};

/** Mirrors PHP includes/portal-sidebar.php */
export const PORTAL_NAV: PortalNavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/portal", label: "Dashboard", exact: true }],
  },
  {
    title: "My Info",
    items: [
      { href: "/portal/profile", label: "Profile" },
      { href: "/portal/salary", label: "Salary" },
      { href: "/portal/documents", label: "Documents" },
      { href: "/portal/achievements", label: "Achievements" },
      { href: "/portal/history", label: "History" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/portal/company-documents", label: "Company Docs" },
      { href: "/portal/feedback", label: "Feedback" },
    ],
  },
];

export function isPortalNavActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (exact) {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
