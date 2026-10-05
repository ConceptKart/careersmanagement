import { PageHeader } from "@/components/admin/PageHeader";

type Props = {
  title: string;
  description: string;
};

/** Placeholder page body for admin sections not yet migrated (Phase 4C+). */
export function AdminComingSoon({ title, description }: Props) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: title },
        ]}
      />
      <div className="card admin-coming-soon">
        <h2>Coming soon</h2>
        <p className="text-muted-foreground">
          This section will be migrated in a later phase. Navigation and layout are
          ready so you can explore the admin shell.
        </p>
      </div>
    </>
  );
}
