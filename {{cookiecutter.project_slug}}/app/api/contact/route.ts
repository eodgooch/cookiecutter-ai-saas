import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import config from "@/config";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  type: z.enum(["support", "feedback"]),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(20).max(5000),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limited = await checkRateLimit(`contact:${ip}`, 5, 60 * 10);
  if (limited) return limited;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form input" }, { status: 400 });
  }

  const { name, email, type, subject, message } = parsed.data;

  try {
    await db.insert(contactSubmissions).values({
      name,
      email,
      type,
      subject,
      message,
    });

    await resend.emails.send({
      from: config.resend.fromNoReply,
      to: config.resend.supportEmail,
      replyTo: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      text: [
        `Type: ${type}`,
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send failed:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
