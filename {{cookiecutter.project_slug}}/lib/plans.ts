import config from "@/config";
import type { PlanTier, PlanConfig } from "@/types/config";

export function getPlanConfig(tier: PlanTier): PlanConfig {
  const plan = config.stripe.plans.find((p) => p.tier === tier);
  if (!plan) throw new Error(`Unknown plan: ${tier}`);
  return plan;
}

export function getPlanLimits(tier: PlanTier) {
  return getPlanConfig(tier).limits;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
