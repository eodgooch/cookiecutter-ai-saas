"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function MagicLinkContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="card w-full max-w-md border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-base-content/60">
          We&apos;ve sent a magic link to sign you in.
        </p>

        <div className="alert alert-success text-left">
          <span>
            {email ? (
              <>We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click the link in the email to sign in.</>
            ) : (
              <>Check your email for a sign-in link. Click the link to sign in.</>
            )}
          </span>
        </div>

        <p className="text-sm text-base-content/60">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <Link href="/sign-in" className="link link-primary">
            try again
          </Link>
          .
        </p>

        <div>
          <Link href="/sign-in" className="link link-primary text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
