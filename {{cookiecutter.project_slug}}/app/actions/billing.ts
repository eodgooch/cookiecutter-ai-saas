"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createCheckout, createCustomerPortal } from "@/lib/stripe";
import { audit } from "@/lib/audit";

export async function createCheckoutAction(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const url = await createCheckout({
    priceId,
    successUrl: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    clientReferenceId: session.user.id,
    user: {
      customerId: user?.stripeCustomerId ?? undefined,
      email: session.user.email ?? undefined,
    },
  });

  if (url) redirect(url);
}

/**
 * Returns checkout URL instead of redirecting.
 * Use this from client components where redirect() doesn't work.
 */
export async function getCheckoutUrl(priceId: string): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  return createCheckout({
    priceId,
    successUrl: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    clientReferenceId: session.user.id,
    user: {
      customerId: user?.stripeCustomerId ?? undefined,
      email: session.user.email ?? undefined,
    },
  });
}

export async function createPortalAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No subscription found");
  }

  await audit({
    userId: session.user.id,
    action: "billing.portal_opened",
    resourceType: "user",
    resourceId: session.user.id,
  });

  const url = await createCustomerPortal({
    customerId: user.stripeCustomerId,
    returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
  });

  redirect(url);
}
