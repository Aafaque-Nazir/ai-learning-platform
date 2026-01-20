'use client';

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Authenticated, Unauthenticated, AuthLoading, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function UserSync({ children }: { children: ReactNode }) {
  const storeUser = useMutation(api.users.store);
  
  useEffect(() => {
    // Whenever the user is authenticated, we ensure they are stored in Convex
    storeUser();
  }, [storeUser]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>
          <UserSync>{children}</UserSync>
        </Authenticated>
        <Unauthenticated>
          {children}
        </Unauthenticated>
        <AuthLoading>
          <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
