"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { getPlanLimits } from "@/lib/plans";
import { dispatchJob, cancelJob } from "@/lib/queue/jobs";
import { getRedis } from "@/lib/redis";
import { audit } from "@/lib/audit";
import { enforceRateLimit } from "@/lib/rate-limit";

type ActionResult = { success: true; data?: unknown } | { success: false; error: string };

export async function submitJob(
  type: string,
  input: Record<string, unknown>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await enforceRateLimit(`job:${session.user.id}`, 10, 60);
  } catch {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  // Get user plan
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) return { success: false, error: "User not found" };

  const limits = getPlanLimits(user.plan);

  // Check concurrent jobs
  const runningJobs = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.userId, session.user.id),
        sql`${jobs.status} IN ('queued', 'running')`
      )
    );

  if (runningJobs.length >= limits.concurrentJobs) {
    return {
      success: false,
      error: `You have ${limits.concurrentJobs} jobs already in progress. Wait for one to finish.`,
    };
  }

  // Create job record
  const [job] = await db
    .insert(jobs)
    .values({
      userId: session.user.id,
      type,
      input,
      status: "queued",
    })
    .returning();

  // Dispatch to BullMQ
  await dispatchJob({
    jobId: job.id,
    userId: session.user.id,
    type,
    input,
    userPlan: user.plan ?? "free",
  });

  await audit({
    userId: session.user.id,
    action: "job.submit",
    resourceType: "job",
    resourceId: job.id,
    metadata: { type },
  });

  revalidatePath("/dashboard");

  return { success: true, data: { jobId: job.id } };
}

export async function cancelJobAction(jobId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Look up job — verify ownership + cancellable status
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, session.user.id)),
  });

  if (!job) return { success: false, error: "Job not found" };
  if (job.status !== "queued" && job.status !== "running") {
    return { success: false, error: "Job cannot be cancelled" };
  }

  // Update DB: status = cancelled, completedAt = now
  await db
    .update(jobs)
    .set({ status: "cancelled", completedAt: new Date() })
    .where(eq(jobs.id, jobId));

  // Try to remove/fail the BullMQ job
  try {
    await cancelJob(jobId);
  } catch {
    // Job may already be gone — that's fine
  }

  // Set Redis cancel flag for worker to detect mid-job (10 min TTL)
  const redis = getRedis();
  await redis.set(`job:${jobId}:cancel`, "1", "EX", 600);

  // Publish cancelled status to Redis for SSE
  await redis.publish(
    `job:${jobId}:progress`,
    JSON.stringify({ status: "cancelled", progress: 0, message: "Job cancelled" })
  );

  await audit({
    userId: session.user.id,
    action: "job.cancel",
    resourceType: "job",
    resourceId: jobId,
  });

  revalidatePath("/dashboard");

  return { success: true };
}

export async function getJobStatus(jobId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, session.user.id)),
  });

  if (!job) return { success: false, error: "Job not found" };

  return {
    success: true,
    data: {
      id: job.id,
      status: job.status,
      type: job.type,
      progress: job.progress,
      output: job.output,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    },
  };
}
