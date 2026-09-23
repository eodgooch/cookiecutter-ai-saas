import { ReactNode } from "react";

/**
 * Minimal root layout - actual layouts are in route groups:
 * - (main) - Main app with your styles
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
