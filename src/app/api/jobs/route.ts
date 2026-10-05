import { NextResponse } from "next/server";
import { jobsService } from "@/services/jobs.service";

/** PHP reference: GET /api/jobs.php */
export async function GET() {
  try {
    const jobs = await jobsService.listPublic({ q: "", dept: "", loc: "", type: "" });
    return NextResponse.json({
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department,
        location: j.location,
        job_type: j.jobType,
        description: j.description,
        created_at: j.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
