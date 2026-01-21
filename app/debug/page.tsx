"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function DebugPage() {
  const { user } = useUser();
  const diagnostics = useQuery(api.debug.getDiagnostics);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">🔍 Debug Dashboard</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-yellow-400">Clerk User (Frontend)</h2>
          <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({
              id: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              name: user?.fullName || user?.firstName,
            }, null, 2)}
          </pre>
        </div>

        {!diagnostics ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p>Loading diagnostics...</p>
          </div>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-green-400">Convex Identity (Backend)</h2>
              <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.identity, null, 2)}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-blue-400">User Record in Database</h2>
              <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.userRecord, null, 2)}
              </pre>
              {!diagnostics.userRecord && (
                <p className="text-red-400 font-bold">⚠️ NO USER RECORD FOUND - This is the problem!</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-purple-400">Summary</h2>
              <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.summary, null, 2)}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-orange-400">All Courses in Database</h2>
              <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.allCourses, null, 2)}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-pink-400">Progress Records</h2>
              <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(diagnostics.userProgress, null, 2)}
              </pre>
            </div>

            <div className="bg-white/5 border border-red-500/50 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-red-400">🚨 Issues Detected</h2>
              <ul className="list-disc list-inside space-y-2 text-red-300">
                {diagnostics.summary && diagnostics.summary.coursesWithEmptyUserId > 0 && (
                  <li>Found {diagnostics.summary.coursesWithEmptyUserId} courses with empty userId - these won't show up!</li>
                )}
                {!diagnostics.userRecord && (
                  <li>No user record in database - progress won't save!</li>
                )}
                {diagnostics.summary && diagnostics.summary.totalCoursesInDb > 0 && diagnostics.summary.coursesMatchingClerkId === 0 && (
                  <li>Courses exist but none match your Clerk ID - ID mismatch issue!</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
