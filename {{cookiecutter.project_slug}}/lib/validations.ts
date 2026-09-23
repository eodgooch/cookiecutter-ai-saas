import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(3, "Email is too short")
  .max(320, "Email is too long");

export const jobInputSchema = z.object({
  type: z.string().min(1, "Job type is required"),
  params: z.record(z.unknown()).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: emailSchema,
  type: z.string().min(1, "Type is required"),
  subject: z.string().min(1, "Subject is required").max(500),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});
