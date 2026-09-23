const FLAGS = {
  FEATURE_JOBS_ENABLED: true,
  FEATURE_EMAIL_NOTIFICATIONS: false,
  FEATURE_USAGE_LIMITS: true,
} as const;

type FeatureFlag = keyof typeof FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envValue = process.env[flag];
  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1";
  }
  return FLAGS[flag];
}
