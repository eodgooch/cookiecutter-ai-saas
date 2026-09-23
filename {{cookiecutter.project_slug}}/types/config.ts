export type Theme = "light" | "dark" | "";

export type PlanTier = "free" | "pro" | "enterprise";

export interface PlanConfig {
  tier: PlanTier;
  isFeatured?: boolean;
  priceId: string;
  name: string;
  description?: string;
  price: number;
  priceAnchor?: number;
  interval: "month" | "year";
  limits: {
    jobsPerMonth: number;
    concurrentJobs: number;
    features: string[];
  };
  features: {
    name: string;
    included: boolean;
  }[];
}

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  stripe: {
    plans: PlanConfig[];
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail: string;
  };
  colors: {
    theme: Theme;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}
