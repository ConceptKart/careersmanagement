import {
  feedbackRepository,
  type AdminFeedbackListResult,
} from "@/repositories/feedback.repository";
import type { AdminFeedbackListFilters } from "@/validators/admin-feedback.schema";

export class FeedbackService {
  async getFeedback(
    filters: AdminFeedbackListFilters,
  ): Promise<AdminFeedbackListResult> {
    return feedbackRepository.findAdminList(filters);
  }

  async respond(feedbackId: string, hrResponse: string) {
    return feedbackRepository.respond(feedbackId, hrResponse);
  }
}

export const feedbackService = new FeedbackService();
