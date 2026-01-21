'use client';

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { ReactNode, useEffect } from "react";
import { api } from "@/convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Auto-create user on first load
function AutoUserCreation() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.userFix.createUserManually);
  
  useEffect(() => {
    if (isLoaded && user?.id) {
      createUser({
        clerkId: user.id,
        name: user.fullName || user.firstName || "Student",
        email: user.primaryEmailAddress?.emailAddress || "",
      }).catch((err) => {
        // Silently fail if user already exists
        console.log("User creation:", err.message);
      });
    }
  }, [isLoaded, user?.id, createUser]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AutoUserCreation />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
