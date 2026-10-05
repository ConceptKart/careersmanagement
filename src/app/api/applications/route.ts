import { NextResponse } from "next/server";
import { statusService } from "@/services/status.service";
import { checkStatusLookupSchema } from "@/validators/status.schema";

/**
 * Secure status lookup API — requires application ID and email.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = checkStatusLookupSchema.safeParse({
    applicationId: params.get("applicationId") ?? "",
    email: params.get("email") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Valid application ID and email are required" }, { status: 400 });
  }

  try {
    const result = await statusService.lookup(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const app = result.application;
    return NextResponse.json({
      application: {
        id: app.id,
        name: app.name,
        status: app.status,
        created_at: app.createdAt,
        updated_at: app.updatedAt,
        job_title: app.job.title,
        department: app.job.department,
        location: app.job.location,
        screening_summary: app.screeningSummary,
      },
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
