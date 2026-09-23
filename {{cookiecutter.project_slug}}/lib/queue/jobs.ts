import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";

export interface JobData {
  jobId: string;
  userId: string;
  type: string;
  input: Record<string, unknown>;
  userPlan?: string;
}

let jobQueue: Queue<JobData> | null = null;

export function getJobQueue(): Queue<JobData> {
  if (!jobQueue) {
    jobQueue = new Queue<JobData>("jobs", {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return jobQueue;
}

export async function dispatchJob(data: JobData): Promise<void> {
  const queue = getJobQueue();

  // Use jobId as BullMQ jobId for idempotency — prevents duplicate processing
  await queue.add("process-job", data, {
    jobId: data.jobId,
  });
}

export async function cancelJob(jobId: string): Promise<void> {
  const queue = getJobQueue();
  const job = await queue.getJob(jobId);
  if (job) {
    const state = await job.getState();
    if (state === "waiting" || state === "delayed") {
      await job.remove();
    } else if (state === "active") {
      await job.moveToFailed(new Error("Cancelled by user"), "0", true);
    }
  }
}
