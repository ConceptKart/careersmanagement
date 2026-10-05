import type { ApplicationStatus } from "@prisma/client";

export type TimelineStageState = "completed" | "current" | "upcoming" | "rejected";

export type TimelineStage = {
  id: string;
  label: string;
  state: TimelineStageState;
};

const POSITIVE_STAGES: Array<{ id: string; label: string }> = [
  { id: "submitted", label: "Application Submitted" },
  { id: "hr_review", label: "HR Review" },
  { id: "resume_screening", label: "Resume Screening" },
  { id: "technical_evaluation", label: "Technical Evaluation" },
  { id: "interview_scheduled", label: "Interview Scheduled" },
  { id: "final_review", label: "Final Review" },
  { id: "selected", label: "Selected" },
];

/** Map DB status to the active positive pipeline index (0–6). */
const STATUS_INDEX: Record<ApplicationStatus, number> = {
  new: 0,
  in_review: 1,
  shortlisted: 3,
  interview_scheduled: 4,
  hired: 6,
  rejected: -1,
};

export function buildStatusTimeline(status: ApplicationStatus): TimelineStage[] {
  if (status === "rejected") {
    return [
      { id: "submitted", label: "Application Submitted", state: "completed" },
      { id: "hr_review", label: "HR Review", state: "completed" },
      { id: "rejected", label: "Rejected", state: "rejected" },
    ];
  }

  const activeIndex = STATUS_INDEX[status];

  return POSITIVE_STAGES.map((stage, index) => {
    let state: TimelineStageState = "upcoming";
    if (index < activeIndex) state = "completed";
    else if (index === activeIndex) state = "current";
    return { ...stage, state };
  });
}

export function getNextSteps(status: ApplicationStatus): string {
  switch (status) {
    case "new":
      return "Our team will review your application shortly.";
    case "in_review":
      return "Your application is under HR review. We will update you once screening begins.";
    case "shortlisted":
      return "You have been shortlisted. Our recruiting team will contact you about next steps.";
    case "interview_scheduled":
      return "Your interview has been scheduled. Please check your email for date and time details.";
    case "hired":
      return "Congratulations! Our HR team will reach out with onboarding details.";
    case "rejected":
      return "Thank you for your interest. We encourage you to apply for other open roles.";
    default:
      return "Our team will be in touch with updates.";
  }
}
