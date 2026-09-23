"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <NextTopLoader showSpinner={false} />
      {children}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />
    </SessionProvider>
  );
};

export default ClientLayout;
