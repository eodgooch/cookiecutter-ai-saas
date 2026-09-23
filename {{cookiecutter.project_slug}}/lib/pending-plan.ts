const PENDING_PLAN_COOKIE = "pending_plan_id";
const ONE_HOUR_SECONDS = 60 * 60;

/**
 * Remember which plan the visitor picked before they authenticated, so checkout
 * can resume after the OAuth or magic-link round trip.
 *
 * Lives at module scope on purpose: writing `document.cookie` directly inside a
 * component body trips react-hooks/immutability under the React Compiler.
 */
export function rememberPendingPlan(planId: string): void {
  document.cookie = `${PENDING_PLAN_COOKIE}=${encodeURIComponent(
    planId
  )}; path=/; max-age=${ONE_HOUR_SECONDS}; SameSite=Lax`;
}

/**
 * Build the post-auth redirect, carrying the chosen plan through as a query
 * param and a cookie.
 */
export function buildAuthRedirectUrl(
  callbackUrl: string | undefined,
  planId: string | undefined
): string {
  const redirectUrl = callbackUrl || "/dashboard";
  if (!planId) return redirectUrl;

  const url = new URL(redirectUrl, window.location.origin);
  url.searchParams.set("plan_id", planId);
  rememberPendingPlan(planId);
  return url.toString();
}
