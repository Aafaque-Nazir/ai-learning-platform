"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Loader2, PlayCircle, CheckCircle2, Lock, ChevronRight, BookOpen, ArrowLeft, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CourseDashboardPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();

  const courseData = useQuery(api.courses.getCourseStructure, { 
    courseId: courseId as any 
  });
  
  const userProgress = useQuery(api.adaptive.getUserProgress, {});

  if (!courseData || !userProgress) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Calculate Progress
  const totalLessons = courseData.modules.reduce((acc: number, val: any) => acc + (val.lessons?.length || 0), 0);
  
  const completedLessons = userProgress.filter((p: any) => 
      p.completed && 
      courseData.modules.some((m: any) => 
          m.lessons.some((l: any) => String(l._id) === String(p.lessonId))
      )
  ).length;

  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getLessonStatus = (lessonId: string) => {
    const p = userProgress.find((p: any) => String(p.lessonId) === String(lessonId));
    return p ? { completed: p.completed, score: p.score } : null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans selection:bg-indigo-500/30">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Nav Back */}
            <Button 
                variant="ghost" 
                onClick={() => router.push("/")}
                className="group text-slate-400 hover:text-white hover:bg-white/10 -ml-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Button>

            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-3xl p-8 md:p-12"
            >
                {/* Background Blurs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-end">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold tracking-wide">
                            <BookOpen className="w-4 h-4" />
                            Course Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                            {courseData.title}
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            {courseData.description}
                        </p>
                    </div>
                    
                    {/* Progress Card */}
                    <div className="w-full md:w-auto bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl min-w-[250px]">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-slate-200">Course Progress</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-4">
                            {Math.round(progressPercentage)}%
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-right">
                            {completedLessons}/{totalLessons} Lessons Completed
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Modules Grid */}
            <div className="space-y-8">
                {courseData.modules.map((module: any, idx: number) => {
                    // Calculate Module Progress
                    const modLessons = module.lessons || [];
                    const modCompleted = modLessons.filter((l: any) => getLessonStatus(l._id)?.completed).length;
                    const modTotal = modLessons.length;
                    const isModCompleted = modTotal > 0 && modCompleted === modTotal;
                    
                    return (
                        <motion.div 
                            key={module._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group border rounded-3xl overflow-hidden transition-all duration-300 ${
                                isModCompleted 
                                ? "bg-indigo-950/10 border-indigo-500/20" 
                                : "bg-white/5 border-white/10 hover:border-indigo-500/30"
                            }`}
                        >
                            {/* Module Header */}
                            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-3">
                                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm ${
                                            isModCompleted ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        {module.title}
                                    </h3>
                                    {module.description && (
                                        <p className="text-slate-400 text-sm md:text-base mt-2 ml-11">{module.description}</p>
                                    )}
                                </div>
                                <div className="ml-11 md:ml-0 flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-300">{modCompleted}/{modTotal} Completed</div>
                                        <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${isModCompleted ? "bg-indigo-500" : "bg-slate-500"}`}
                                                style={{ width: `${(modCompleted/modTotal)*100}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="p-4 md:p-6 space-y-3">
                                {modLessons.map((lesson: any, lIdx: number) => {
                                    const status = getLessonStatus(lesson._id);
                                    const isCompleted = status?.completed;
                                    
                                    return (
                                        <button
                                            key={lesson._id}
                                            onClick={() => router.push(`/exam/${lesson._id}`)} 
                                            className={`w-full text-left group/lesson flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                                                isCompleted 
                                                ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" 
                                                : "bg-[#1a1a1a]/50 border-white/5 hover:bg-white/10 hover:border-indigo-500/30"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                                                    isCompleted 
                                                    ? "bg-green-500/20 text-green-400" 
                                                    : "bg-[#0f172a] text-slate-500 group-hover/lesson:bg-indigo-600 group-hover/lesson:text-white"
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-lg transition-colors ${isCompleted ? "text-green-100" : "text-slate-200 group-hover/lesson:text-white"}`}>
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                         <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lesson {lesson.order || lIdx + 1}</span>
                                                         {isCompleted && status?.score !== undefined && (
                                                             <div className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                                <Star className="w-3 h-3 fill-green-400" /> Score: {status.score}%
                                                             </div>
                                                         )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className={`transition-all duration-300 transform ${isCompleted ? "opacity-100" : "opacity-0 -translate-x-2 group-hover/lesson:opacity-100 group-hover/lesson:translate-x-0"}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white"}`}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

        </div>
    </div>
  );
}
