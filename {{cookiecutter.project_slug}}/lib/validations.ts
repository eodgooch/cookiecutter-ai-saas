import { z } from "zod";

export const emailSchema = z
  .email("Invalid email address")
  .min(3, "Email is too short")
  .max(320, "Email is too long");

export const jobInputSchema = z.object({
  type: z.string().min(1, "Job type is required"),
  params: z.record(z.string(), z.unknown()).optional(),
});

export const contactTypes = ["support", "feedback"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
  email: z.email("Invalid email address").trim().max(254, "Email is too long"),
  type: z.enum(contactTypes),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(160, "Subject is too long"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(5000, "Message is too long"),
});

export type ContactInput = z.infer<typeof contactSchema>;
