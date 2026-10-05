import { z } from "zod";

/** Entity IDs are UUID / 36-char strings in this schema. */
export const entityIdSchema = z
  .string()
  .trim()
  .min(1, "Invalid ID")
  .max(36, "Invalid ID");
