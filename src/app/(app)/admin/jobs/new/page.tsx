import type { Metadata } from "next";
import { createJobAction } from "@/actions/admin-jobs";
import { PageHeader } from "@/components/admin/PageHeader";
import { JobForm } from "@/components/jobs/admin/JobForm";

export const metadata: Metadata = {
  title: "New Job",
  description: "Create a new open role.",
};

export default function AdminNewJobPage() {
  return (
    <>
      <PageHeader
        title="Create new job"
        description="Add a new open role."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Jobs", href: "/admin/jobs" },
          { label: "New" },
        ]}
      />

      <div className="card admin-job-form-card">
        <JobForm
          mode="create"
          cancelHref="/admin/jobs"
          submitAction={createJobAction}
          defaultValues={{
            title: "",
            department: "",
            location: "",
            jobType: "full_time",
            description: "",
            requirements: "",
            keyResponsibilities: "",
            salaryOffered: "",
            screeningKeywords: "",
            isActive: true,
          }}
        />
      </div>
    </>
  );
}
