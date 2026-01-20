'use client';

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  const { user } = useUser();
  const userData = useQuery(api.users.current);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
         <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
           AI Learning Platform
         </h1>
         
         {!user ? (
           <div className="space-y-4">
             <p className="text-gray-600 dark:text-gray-300 mb-6">
               Sign in to start your adaptive learning journey.
             </p>
             <SignInButton mode="modal">
               <Button size="lg" className="w-full font-bold">
                 Get Started
               </Button>
             </SignInButton>
           </div>
         ) : (
           <div className="space-y-6">
             <div className="flex flex-col items-center gap-4">
               <UserButton afterSignOutUrl="/" />
               <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Welcome back, {user.firstName}!
                  </h2>
                  <p className="text-sm text-gray-500">
                    {userData?.role ? `Role: ${userData.role}` : "Syncing profile..."}
                  </p>
               </div>
             </div>
             
             <div className="pt-4 border-t border-gray-100 dark:border-gray-600">
                <Button variant="outline" className="w-full mb-4">
                  Go to Dashboard
                </Button>
                
                {/* AI Tutor Test Section */}
                <div className="mt-6 text-left">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">AI Tutor Test</h3>
                  <ChatInterface />
                </div>
             </div>
           </div>
         )}
      </div>
    </main>
  );
}
