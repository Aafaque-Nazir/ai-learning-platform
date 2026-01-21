"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FixUserPage() {
  const { user } = useUser();
  const createUser = useMutation(api.userFix.createUserManually);
  const [status, setStatus] = useState("");

  const handleFix = async () => {
    if (!user) {
      setStatus("❌ No user logged in");
      return;
    }

    try {
      setStatus("⏳ Creating user record...");
      await createUser({
        clerkId: user.id,
        name: user.fullName || user.firstName || "Student",
        email: user.primaryEmailAddress?.emailAddress || "",
      });
      setStatus("✅ User created! Go back to dashboard and check /debug again");
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 flex items-center justify-center">
      <div className="max-w-xl bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold">🔧 Manual User Fix</h1>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            <strong>Why this is needed:</strong> Clerk authentication isn't syncing with Convex properly. 
            This button will manually create your user record in the database.
          </p>
        </div>

        {user && (
          <div className="bg-white/5 p-4 rounded-lg space-y-2">
            <p><strong>Clerk ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.fullName || user.firstName}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
          </div>
        )}

        <Button 
          onClick={handleFix}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-6 text-lg font-bold"
        >
          Create My User Record
        </Button>

        {status && (
          <div className={`p-4 rounded-lg ${status.startsWith('✅') ? 'bg-green-500/10 text-green-300' : status.startsWith('❌') ? 'bg-red-500/10 text-red-300' : 'bg-blue-500/10 text-blue-300'}`}>
            {status}
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-2">
          <p><strong>After clicking:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Your user record will be created in Convex database</li>
            <li>Go to <code className="bg-black/30 px-1 rounded">/debug</code> to verify</li>
            <li>Try creating a course</li>
            <li>Everything should work now</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
