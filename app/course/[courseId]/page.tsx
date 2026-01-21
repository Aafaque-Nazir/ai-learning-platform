"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Loader2, PlayCircle, CheckCircle2, Lock, ChevronRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDashboardPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useUser();
  const router = useRouter();

  const courseData = useQuery(api.courses.getCourseStructure, { 
    courseId: courseId as any 
  });
  
  // TO DO: Fetch user progress to show completed lessons
  // const userProgress = useQuery(api.adaptive.getUserProgress, { courseId });

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 pt-24 font-sans selection:bg-indigo-500/30">
        <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center lg:text-left border-b border-white/10 pb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    Course Dashboard
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    {courseData.title}
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                    {courseData.description}
                </p>
            </motion.div>

            {/* Modules Grid */}
            <div className="grid gap-8">
                {courseData.modules.map((module: any, idx: number) => (
                    <motion.div 
                        key={module._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
                    >
                        {/* Module Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-start md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl md:text-2xl font-semibold text-indigo-100">
                                        <span className="text-indigo-500 mr-3">Module {idx + 1}:</span>
                                        {module.title}
                                    </h3>
                                    {module.description && (
                                        <p className="text-slate-400 text-sm md:text-base">{module.description}</p>
                                    )}
                                </div>
                                <div className="text-sm text-slate-500 font-medium whitespace-nowrap bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                                    {module.lessons?.length || 0} Lessons
                                </div>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <div className="p-4 md:p-6 space-y-3 bg-black/20">
                            {module.lessons.map((lesson: any, lIdx: number) => (
                                <button
                                    key={lesson._id}
                                    onClick={() => router.push(`/exam/${lesson._id}`)} // Currently linking to exam/lesson page
                                    className="w-full text-left group/lesson flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover/lesson:bg-indigo-500/20 group-hover/lesson:text-indigo-400 transition-colors">
                                            {/* Logic to show checkmark if done, lock if locked, play if current. 
                                                Using PlayCircle for now as default */}
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-200 group-hover/lesson:text-white transition-colors">
                                                {lesson.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">Lesson {lesson.order}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    </div>
  );
}
