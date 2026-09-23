import type { Metadata } from "next";
import { MagicLinkContent } from "./magic-link-content";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Magic Link",
};

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-8">
      <Suspense fallback={<div className="loading loading-spinner loading-lg" />}>
        <MagicLinkContent />
      </Suspense>
    </div>
  );
}
