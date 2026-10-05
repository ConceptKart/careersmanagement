import { Breadcrumbs, type BreadcrumbItem } from "@/components/admin/Breadcrumbs";

type Props = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, breadcrumbs, actions }: Props) {
  return (
    <div className="admin-page-header">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="admin-page-header-row">
        <div>
          <h1>{title}</h1>
          {description ? <p className="text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
