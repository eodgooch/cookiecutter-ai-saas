import { ConfigProps } from "./types/config";

const config = {
  appName: "__PROJECT_NAME__",
  appDescription: "__PROJECT_DESCRIPTION__",
  domainName: "__DOMAIN_NAME__",
  stripe: {
    plans: [
      {
        tier: "free",
        priceId: "",
        name: "Free",
        description: "Get started for free",
        price: 0,
        interval: "year",
        limits: {
          jobsPerMonth: 100,
          concurrentJobs: 1,
          features: [],
        },
        features: [
          { name: "1 item", included: true },
          { name: "100 API calls/month", included: true },
          { name: "Basic features", included: true },
          { name: "Premium features", included: false },
          { name: "History", included: false },
        ],
      },
      {
        tier: "pro",
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "production"
            ? "price_REPLACE_WITH_LIVE_PRICE_ID"
            : "price_REPLACE_WITH_TEST_PRICE_ID",
        name: "Pro",
        description: "For power users",
        price: 99,
        interval: "year",
        limits: {
          jobsPerMonth: 5000,
          concurrentJobs: 3,
          features: ["premium", "history"],
        },
        features: [
          { name: "10 items", included: true },
          { name: "5,000 API calls/month", included: true },
          { name: "All basic features", included: true },
          { name: "Premium features", included: true },
          { name: "Full history", included: true },
        ],
      },
      {
        tier: "enterprise",
        priceId:
          process.env.NODE_ENV === "production"
            ? "price_REPLACE_WITH_LIVE_PRICE_ID"
            : "price_REPLACE_WITH_TEST_PRICE_ID",
        name: "Enterprise",
        description: "For growing teams",
        price: 249,
        interval: "year",
        limits: {
          jobsPerMonth: 50000,
          concurrentJobs: 10,
          features: ["premium", "history", "scheduled", "emailNotifications"],
        },
        features: [
          { name: "100 items", included: true },
          { name: "50,000 API calls/month", included: true },
          { name: "All features included", included: true },
          { name: "Scheduled tasks", included: true },
          { name: "Email notifications", included: true },
          { name: "Priority support", included: true },
        ],
      },
    ],
  },
  resend: {
    fromNoReply: "__PROJECT_NAME__ <noreply@__DOMAIN_NAME__>",
    fromAdmin: "__PROJECT_NAME__ <hello@__DOMAIN_NAME__>",
    supportEmail: "support@__DOMAIN_NAME__",
  },
  colors: {
    theme: "dark",
    main: "__PRIMARY_COLOR__",
  },
  auth: {
    loginUrl: "/sign-in",
    callbackUrl: "/dashboard",
  },
} satisfies ConfigProps;

export default config;
