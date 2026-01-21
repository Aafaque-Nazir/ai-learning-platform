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
  const { isLoaded, isSignedIn } = useAuth();
  
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("UserSync: Storing user in Convex...");
      storeUser().catch((err) => {
        console.error("Failed to store user:", err);
      });
    }
  }, [isLoaded, isSignedIn, storeUser]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
