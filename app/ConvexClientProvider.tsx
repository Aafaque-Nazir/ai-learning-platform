'use client';

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { ReactNode, useEffect } from "react";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl 
  ? new ConvexReactClient(convexUrl) 
  : undefined;

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
  if (!convex) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-[#020617] text-white">
          <div className="text-center p-8 border border-red-500/20 bg-red-500/10 rounded-3xl">
             <h1 className="text-xl font-bold text-red-400 mb-2">Configuration Error</h1>
             <p className="text-slate-300">Missing <code className="bg-black/30 px-2 py-0.5 rounded text-yellow-400">NEXT_PUBLIC_CONVEX_URL</code></p>
             <p className="text-sm text-slate-500 mt-4">Is npx convex dev running?</p>
             <p className="text-xs text-slate-600 mt-2">Try restarting npm run dev</p>
          </div>
       </div>
    );
  }

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AutoUserCreation />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
