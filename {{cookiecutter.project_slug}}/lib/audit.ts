import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

interface AuditEntry {
  userId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function audit(entry: AuditEntry) {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  } catch (e) {
    // Audit logging should never break the main flow
    console.error("Audit log failed:", e);
  }
}
