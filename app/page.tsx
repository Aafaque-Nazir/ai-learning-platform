'use client';

import { SignInButton, SignOutButton, useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
// import { ChatInterface } from "@/components/ChatInterface";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, LayoutDashboard, MessageSquare, Sparkles, Trophy, Target, Zap, Plus, ChevronRight, BarChart2, TrendingUp, X, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ViewState = "dashboard" | "courses" | "analytics";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [activeView, setActiveView] = useState<ViewState>("dashboard");

  if (!isLoaded) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="relative min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse opacity-50" />
      </div>

      <div className="relative z-10 font-sans">
        {!user ? (
          <LandingPage />
        ) : (
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-80 p-6 lg:p-12 pb-32">
               {activeView === "dashboard" && <DashboardView user={user} setActiveView={setActiveView} />}
               {activeView === "courses" && <CoursesView />}
               {activeView === "analytics" && <AnalyticsView />}
            </div>
            
            {/* Chatbot Removed as per user request */}

          </div>
        )}
      </div>
    </main>
  );
}

function Sidebar({ activeView, setActiveView, user }: { activeView: ViewState, setActiveView: (v: ViewState) => void, user: any }) {
    return (
        <aside className="hidden lg:flex w-80 fixed inset-y-0 border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex-col z-50">
            {/* Header with Logo and Logout */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-inner">
                        <Sparkles className="text-white w-4 h-4" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-100">AdaptiveAI</h1>
                </div>
                <UserButton afterSignOutUrl="/" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Navigation */}
                <div className="space-y-1">
                    <NavButton 
                        isActive={activeView === "dashboard"} 
                        onClick={() => setActiveView("dashboard")} 
                        icon={<LayoutDashboard className="w-4 h-4" />} 
                        label="Dashboard" 
                    />
                    <NavButton 
                        isActive={activeView === "courses"} 
                        onClick={() => setActiveView("courses")} 
                        icon={<GraduationCap className="w-4 h-4" />} 
                        label="My Courses" 
                    />
                    <NavButton 
                        isActive={activeView === "analytics"} 
                        onClick={() => setActiveView("analytics")} 
                        icon={<BarChart2 className="w-4 h-4" />} 
                        label="Analytics" 
                    />
                </div>

                {/* Progress Section */}
                <UserProgressSection />
            </div>

            {/* User Info at Bottom */}
            <div className="px-6 py-4 border-t border-white/5">
                <div className="p-3 rounded-xl bg-white/5">
                    <p className="font-bold text-slate-200 text-sm">{user.fullName || user.firstName}</p>
                    <p className="text-xs text-slate-500">Student Plan</p>
                </div>
            </div>
        </aside>
    )
}

function NavButton({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <Button 
            variant={isActive ? "secondary" : "ghost"} 
            onClick={onClick}
            className={`w-full justify-start font-medium transition-all duration-200 ${
                isActive 
                ? "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 shadow-sm border border-indigo-600/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
        >
            <span className={`mr-3 ${isActive ? "text-indigo-400" : "text-slate-500"}`}>{icon}</span>
            {label}
        </Button>
    )
}

function LandingPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <nav className="flex justify-between items-center mb-24 px-8 py-4 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AdaptiveAI</span>
            </div>
            <SignInButton mode="modal">
                <Button className="bg-white text-black hover:bg-slate-200 font-bold transition-all px-6 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Sign In <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </SignInButton>
            </nav>
            <HeroSection />
        </div>
    )
}

function DashboardView({ user, setActiveView }: { user: any, setActiveView: (v: ViewState) => void }) {
    return (
        <div className="space-y-12">
            <DashboardHeader user={user} />
            
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" /> Recent Courses
                    </h3>
                    <Button variant="link" onClick={() => setActiveView("courses")} className="text-indigo-400 hover:text-indigo-300">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <CourseGrid limit={2} />
            </section>
        </div>
    )
}

function CoursesView() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                     <h2 className="text-3xl font-bold text-white mb-2">My Courses</h2>
                     <p className="text-slate-400">Manage and track your AI-generated curriculum.</p>
                </div>
                <Button 
                    onClick={() => window.location.href = '/create-course'}
                    className="bg-white text-black hover:bg-indigo-50"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Course
                </Button>
            </div>
            <CourseGrid />
        </div>
    )
}

function AnalyticsView() {
    const stats = useQuery(api.adaptive.getUserStats);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-white/10 pb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Learning Analytics</h2>
                <p className="text-slate-400">Deep dive into your progress and performance.</p>
            </div>

            {!stats ? (
                 <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-1">{stats.totalAttempts}</div>
                            <div className="text-sm text-slate-400 font-medium">Total Quizzes Taken</div>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                             <div className="text-4xl font-bold text-white mb-1">{stats.avgScore}%</div>
                             <div className="text-sm text-slate-400 font-medium">Average Score</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <Flame className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                             <div className="text-4xl font-bold text-white mb-1">{stats.completed} XP</div>
                             <div className="text-sm text-slate-400 font-medium">Total Experience</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function HeroSection() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-12 lg:mt-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Next-Gen Learning Platform
        </div>
        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-[0.9]">
          Adaptive Learning.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Evolved.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed">
          Experience a course that adapts to you. Generate curriculum instantly, take AI-proctored exams, and track your growth in 3D.
        </p>
        <SignInButton mode="modal">
          <Button size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-indigo-50 hover:text-indigo-900 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] font-bold transition-all hover:scale-105 active:scale-95">
            Get Started Now
          </Button>
        </SignInButton>
      </motion.div>
    );
  }
  
  function UserProgressSection() {
    const stats = useQuery(api.adaptive.getUserStats);
  
    if (!stats) return <div className="space-y-4 pt-4"><div className="h-32 bg-white/5 rounded-2xl animate-pulse" /></div>;
  
    return (
      <div className="space-y-6 animate-in fade-in duration-700 delay-150">
         <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 p-6 rounded-3xl shadow-xl shadow-indigo-900/20 group hover:scale-[1.02] transition-transform duration-500">
            <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-6 transition-transform" />
            <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> Current Streak
            </h4>
            <div className="text-5xl font-black text-white mb-6 leading-none">
                {stats.completed}<span className="text-2xl text-indigo-300 ml-1">xp</span>
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-indigo-200">
                  <span>Progress</span>
                  <span>{Math.min(stats.completed * 10, 100)}%</span>
               </div>
               <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stats.completed * 10, 100)}%` }} 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  />
               </div>
            </div>
         </div>
  
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
               <Target className="w-5 h-5 text-emerald-400 mb-3" />
               <div className="text-2xl font-bold">{stats.avgScore}%</div>
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-wide">Avg Score</div>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
               <Zap className="w-5 h-5 text-amber-400 mb-3 fill-amber-400" />
               <div className="text-2xl font-bold">{stats.totalAttempts}</div>
               <div className="text-[10px] text-slate-500 uppercase font-black tracking-wide">Quizzes</div>
            </div>
         </div>
      </div>
    );
  }
  
  function DashboardHeader({ user }: { user: any }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };
  
    return (
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-slate-400 font-medium mb-2"
           >
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span>Active Session</span>
           </motion.div>
           <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white"
           >
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.firstName}</span>.
           </motion.h2>
           <p className="text-slate-400 mt-2 text-lg">Your learning journey continues here.</p>
        </div>
  
         <Button 
            onClick={() => window.location.href = '/create-course'}
            className="bg-white text-black hover:bg-indigo-50 rounded-xl px-6 py-6 font-bold text-base shadow-lg shadow-white/5 hover:shadow-white/10 transition-all hover:-translate-y-1"
         >
             <Plus className="w-5 h-5 mr-2" />
             Create New Course
         </Button>
      </div>
    );
  }
  
  function CourseGrid({ limit }: { limit?: number }) {
    const courses = useQuery(api.courses.listUserCourses);
    const router = useRouter();
  
    if (courses === undefined) {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[1,2].map((i) => <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] animate-pulse" />)}</div>;
    }
  
    if (courses.length === 0) {
        return (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No courses yet</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">It looks like you haven't created any courses yet. Get started by generating your first AI curriculum.</p>
                <Button 
                   onClick={() => window.location.href = '/create-course'}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 py-6 text-lg font-bold shadow-xl shadow-indigo-600/20"
                >
                    <Sparkles className="w-5 h-5 mr-2" /> Generate One Now
                </Button>
            </div>
        )
    }

    const displayCourses = limit ? courses.slice(0, limit) : courses;
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {displayCourses.map((course, idx) => (
          <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
          >
              <Link href={`/course/${course._id}`} className="block h-full">
                  <div className="h-full bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-all duration-300 rounded-[2.5rem] p-8 flex flex-col shadow-2xl overflow-hidden group-hover:bg-[#151515]">
                      {/* Gradient Blob for Hover */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-500" />
  
                      <div className="flex items-center justify-between mb-8 z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
                      </div>
                      {/* Tag */}
                      <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-widest border border-white/10 shadow-sm">
                          AI Course
                      </div>
                      </div>
  
                      <div className="z-10 flex-1">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-indigo-200 transition-colors">{course.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-10 line-clamp-2 group-hover:text-slate-300">
                          {course.description}
                      </p>
                      </div>
  
                      <div className="z-10 mt-auto">
                        <div className="w-full bg-white/5 h-1.5 rounded-full mb-4 overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[10%] group-hover:w-[25%] transition-all duration-700" />
                        </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">Continue Learning</span>
                              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                                  <ChevronRight className="w-5 h-5" />
                              </div>
                          </div>
                      </div>
                  </div>
              </Link>
          </motion.div>
        ))}
      </div>
    );
  }
