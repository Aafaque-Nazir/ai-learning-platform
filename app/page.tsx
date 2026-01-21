'use client';

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, LayoutDashboard, MessageSquare, Sparkles, Trophy, Target, Zap, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoaded } = useUser();

  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {!user ? (
          <div className="max-w-7xl mx-auto px-6 py-20">
             <nav className="flex justify-between items-center mb-16 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">AdaptiveAI</span>
                </div>
                <SignInButton mode="modal">
                  <Button className="bg-white text-black hover:bg-gray-200 font-bold transition-all">Get Started</Button>
                </SignInButton>
             </nav>
             <HeroSection />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Real Left Sidebar */}
            <aside className="w-full lg:w-96 lg:fixed lg:inset-y-0 sidebar-glass px-8 py-10 overflow-y-auto custom-scrollbar z-50">
               <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white w-6 h-6" />
                 </div>
                 <h1 className="text-2xl font-black">AdaptiveAI</h1>
               </div>

               <UserProgressSection />

               <div className="mt-12">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    AI Tutor Assistant
                 </h3>
                 <ChatInterface />
               </div>

               <div className="mt-10 pt-10 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                          <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-sm font-bold truncate max-w-[120px]">{user.firstName}</p>
                          <p className="text-[10px] text-gray-500">Student Account</p>
                       </div>
                    </div>
                    <SignOutButton>
                       <Button variant="ghost" size="icon" className="hover:bg-white/5 text-gray-400 hover:text-white">
                          <Zap className="w-4 h-4" />
                       </Button>
                    </SignOutButton>
                 </div>
               </div>
            </aside>

            {/* Right Main Feed */}
            <div className="flex-1 lg:ml-96 p-8 lg:p-12">
               <DashboardHeader user={user} />
               <CourseGrid />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function HeroSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mt-20"
    >
      <h1 className="text-7xl lg:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
        EVOLVE.
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
        The only platform that adapts to your learning pace in real-time. Secure exams, instant feedback, and AI deep-dives.
      </p>
      <SignInButton mode="modal">
        <Button size="lg" className="h-16 px-12 text-xl bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl shadow-indigo-600/20 font-black">
          ENTER PLATFORM
        </Button>
      </SignInButton>
    </motion.div>
  );
}

function UserProgressSection() {
  const stats = useQuery(api.adaptive.getUserStats);

  if (!stats) return <div className="animate-pulse space-y-4 pt-4"><div className="h-24 bg-white/5 rounded-3xl" /></div>;

  return (
    <div className="space-y-6">
       <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl">
          <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
          <h4 className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Completed</h4>
          <div className="text-4xl font-black text-white mb-4">{stats.completed} Lessons</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(stats.completed * 10, 100)}%` }} 
               className="h-full bg-white" 
             />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
             <Target className="w-4 h-4 text-indigo-400 mb-2" />
             <div className="text-lg font-bold">{stats.avgScore}%</div>
             <div className="text-[10px] text-gray-500 uppercase font-black">Avg Score</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
             <Zap className="w-4 h-4 text-amber-400 mb-2" />
             <div className="text-lg font-bold">{stats.totalAttempts}</div>
             <div className="text-[10px] text-gray-500 uppercase font-black">Attempts</div>
          </div>
       </div>
    </div>
  );
}

function DashboardHeader({ user }: { user: any }) {
  return (
    <div className="mb-12">
      <h2 className="text-4xl font-black mb-2 tracking-tight">Active Learning Path</h2>
      <p className="text-gray-500 font-medium">Continue where you left off, {user.firstName}.</p>
    </div>
  );
}

function CourseGrid() {
  const courses = useQuery(api.courses.listUserCourses);
  const router = useRouter(); // Need to import useRouter at top or pass it down

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
      {/* Create New Course Card */}
       <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative cursor-pointer"
          onClick={() => window.location.href = '/create-course'}
        >
           <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 transition-all rounded-[2.5rem] p-10 flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-6 group-hover:bg-white/5">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <Plus className="w-10 h-10 text-white" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create New Course</h3>
                  <p className="text-gray-400">Generate a comprehensive curriculum on any topic with AI.</p>
              </div>
           </div>
       </motion.div>

      {courses?.map((course, idx) => (
        <motion.div
          key={course._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -8 }}
          className="group relative"
        >
           <Link href={`/course/${course._id}`}>
              <div className="bg-white/5 border border-white/5 group-hover:border-indigo-500/50 transition-all duration-300 rounded-[2.5rem] p-10 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-sm min-h-[300px]">
                
                 <div className="flex items-center justify-between mb-8 z-10">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
                       <BookOpen className="w-7 h-7 text-indigo-400" />
                    </div>
                    {/* Placeholder for progress calc */}
                    <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/10">
                       AI Generated
                    </div>
                 </div>

                 <div className="z-10 flex-1">
                    <h3 className="text-2xl font-bold mb-3 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-10 line-clamp-3">
                       {course.description}
                    </p>
                 </div>

                 <Button className="w-full h-14 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-2xl text-lg font-black transition-all group/btn">
                    CONTINUE LEARNING
                    <ChevronRight className="ml-2 w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </Link>
        </motion.div>
      ))}
    </div>
  );
}
