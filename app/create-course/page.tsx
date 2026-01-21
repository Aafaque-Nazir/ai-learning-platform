"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateCoursePage() {
  const { user } = useUser();
  const router = useRouter();
  
  const generateOutline = useAction(api.courses.generateCourseAction);
  const createCourse = useMutation(api.courses.createCourse);
  const saveOutline = useMutation(api.courses.generateCourseOutline);

  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedModules, setGeneratedModules] = useState<any[] | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    if (!user?.id) {
        alert("Please wait for login to complete or refresh the page.");
        return;
    }
    
    setIsLoading(true);
    try {
      // 1. Create the Course Container first
      const newCourseId = await createCourse({
        title: topic,
        description: `AI Generated course on ${topic}`,
        userId: user.id,
      });
      setCourseId(newCourseId);

      // 2. Generate the Outline via AI (with Timeout)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 45000)
      );
      
      const modules = await Promise.race([
        generateOutline({ topic }),
        timeoutPromise
      ]) as any;

      setGeneratedModules(modules);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Generation timed out or failed. Please try a simpler topic.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!courseId || !generatedModules) return;
    setIsLoading(true);
    try {
      await saveOutline({
        courseId: courseId as any,
        outline: generatedModules.map((m: any, i: number) => ({
          title: m.title,
          description: m.description,
          order: i + 1,
          lessons: m.lessons
        })),
      });
      router.push(`/course/${courseId}`);
    } catch (error) {
        console.error("Failed to save:", error);
        alert("Failed to save course.");
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 pt-24 font-sans selection:bg-indigo-500/30">
        <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                >
                    AI Course Generator
                </motion.h1>
                <p className="text-slate-400 text-lg">Turn any topic into a structured learning path in seconds.</p>
            </div>

            {/* Input Section */}
            {!generatedModules && !isLoading && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
                >
                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-indigo-300 uppercase tracking-wider">What do you want to learn?</label>
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Python for Data Science, History of Rome, Advanced React Patterns..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                        </div>
                        
                        <button
                            onClick={handleGenerate}
                            disabled={!topic}
                            className={`
                                group relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all
                                ${!topic 
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"}
                            `}
                        >
                            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                            <span>Generate Course</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Loading / Generation State */}
            {isLoading && (
               <GenerationLoader topic={topic} />
            )}


            {/* Outline Preview Section */}
            <AnimatePresence>
                {generatedModules && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                         <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                                Generated Outline
                            </h2>
                            <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                {generatedModules.length} Modules
                            </span>
                        </div>

                        <div className="space-y-4">
                            {generatedModules.map((module: any, idx: number) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors"
                                >
                                    <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-semibold text-lg">{module.title}</h3>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {module.lessons.map((lesson: string, lIdx: number) => (
                                            <div key={lIdx} className="flex items-center gap-3 text-slate-300 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                                 {lesson}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 pb-12">
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Start Learning Track
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    </div>
  );
}

function GenerationLoader({ topic }: { topic: string }) {
  const [stage, setStage] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
     const interval = setInterval(() => {
         setTimer(t => t + 0.1);
     }, 100);

     const stageInterval = setInterval(() => {
         setStage(s => (s < 3 ? s + 1 : s));
     }, 3000); // Change stage every 3 seconds

     return () => {
         clearInterval(interval);
         clearInterval(stageInterval);
     };
  }, []);

  const stages = [
      "Analyzing topic relevance...",
      "Structuring course modules...",
      "Designing lesson curriculum...",
      "Finalizing learning path..."
  ];

  return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-2xl mx-auto shadow-2xl backdrop-blur-md"
      >
          <div className="flex flex-col items-center text-center space-y-8">
              
              {/* Spinning / timer graphic */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
                  <div className="text-3xl font-bold font-mono text-white">
                      {timer.toFixed(1)}s
                  </div>
              </div>

              <div className="space-y-2">
                 <h2 className="text-2xl font-bold text-white">Generating AI Course</h2>
                 <p className="text-indigo-300">Topic: "{topic}"</p>
              </div>

              {/* Steps Checklist */}
              <div className="w-full max-w-sm space-y-3 text-left bg-black/20 p-6 rounded-xl border border-white/5">
                 {stages.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 transition-all duration-500">
                         <div className={`
                             w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500
                             ${stage > i ? "bg-green-500 border-green-500 text-black" : 
                               stage === i ? "border-indigo-500 text-indigo-500 animate-pulse" : "border-white/10 text-transparent"}
                         `}>
                             {stage > i && <CheckCircle2 className="w-4 h-4" />}
                             {stage === i && <Loader2 className="w-4 h-4 animate-spin" />}
                         </div>
                         <span className={`
                            text-sm font-medium transition-colors duration-500
                            ${stage > i ? "text-slate-300" : stage === i ? "text-white" : "text-slate-600"}
                         `}>
                             {s}
                         </span>
                    </div>
                 ))}
              </div>
          </div>
      </motion.div>
  );
}
