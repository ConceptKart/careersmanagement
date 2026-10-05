import Link from "next/link";
import {
  ApplicationsIcon,
  EmployeesIcon,
  JobsIcon,
} from "@/components/admin/icons";

const ACTIONS = [
  {
    href: "/admin/jobs/new",
    title: "Create Job",
    description: "Post a new open role.",
    icon: JobsIcon,
  },
  {
    href: "/admin/applications",
    title: "Manage Applications",
    description: "Review candidate pipelines.",
    icon: ApplicationsIcon,
  },
  {
    href: "/admin/employees/new",
    title: "Add Employee",
    description: "Create an employee record.",
    icon: EmployeesIcon,
  },
  {
    href: "/admin/employees",
    title: "Manage Employees",
    description: "View and edit employee records.",
    icon: EmployeesIcon,
  },
] as const;

export function QuickActions() {
  return (
    <div className="quick-links">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href} className="quick-link">
            <Icon size={20} />
            <h3 className="mt-3 font-semibold">{action.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
