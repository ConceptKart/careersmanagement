export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

/** Mirrors PHP includes/admin-sidebar.php (+ Settings placeholder). */
export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    title: "People",
    items: [
      { href: "/admin/employees", label: "Employees" },
      { href: "/admin/employee-documents", label: "Employee Documents" },
      { href: "/admin/company-documents", label: "Company Documents" },
      { href: "/admin/salary", label: "Salary Records" },
      { href: "/admin/achievements", label: "Achievements" },
      { href: "/admin/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Recruiting",
    items: [
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/applications", label: "Applications" },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

export function isAdminNavActive(pathname: string, href: string, exact = false): boolean {
  if (exact) {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
