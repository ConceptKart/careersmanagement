import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaffAdmin } from "@/lib/auth/roles";
import { sanitizeDownloadFilename } from "@/lib/uploads/document-file";
import { applicationsService } from "@/services/applications.service";
import { companyDocumentsService } from "@/services/company-documents.service";
import { employeesService } from "@/services/employees.service";

/**
 * Protected file download — mirrors PHP api/download.php.
 * GET /api/admin/downloads?type=resumes|documents|company-documents&file=...
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isStaffAdmin(session.user.roles ?? [])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "";
  const file = searchParams.get("file") ?? "";

  if (!type || !file) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (
    type !== "resumes" &&
    type !== "documents" &&
    type !== "company-documents"
  ) {
    return NextResponse.json({ error: "Invalid type" }, { status: 403 });
  }

  const result =
    type === "resumes"
      ? await applicationsService.downloadResume(file)
      : type === "company-documents"
        ? await companyDocumentsService.downloadDocument(file)
        : await employeesService.downloadDocument(file);

  if (!result) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const disposition = searchParams.get("download") === "1" ? "attachment" : "inline";
  const filename = sanitizeDownloadFilename(result.filename);

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Length": String(result.size),
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
