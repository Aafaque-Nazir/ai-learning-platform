"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight, GraduationCap, ShieldAlert, Timer, BookOpen, Sparkles, Loader2, Play, ArrowLeft, History } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const lessonId = params.lessonId as Id<"lessons">;
  
  const lesson = useQuery(api.exam.getExamLesson, { lessonId });
  const generateContent = useAction(api.courses.generateLessonContentAction);
  
  // Exam Mutations
  const logViolation = useMutation(api.exam.logViolation);
  const submitProgress = useMutation(api.adaptive.submitProgress);
  
  // State
  const [viewMode, setViewMode] = useState<"loading" | "content" | "exam_intro" | "exam_active" | "exam_result">("loading");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Exam State
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [result, setResult] = useState<{score: number, total: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { warnings } = useExamSecurity(viewMode === "exam_active", (type) => logViolation({ lessonId, type }));

  useEffect(() => {
    if (lesson) {
        if (lesson.content) {
            setViewMode("content");
        } else {
            setViewMode("content"); 
        }
    }
  }, [lesson]);

  const handleGenerateContent = async () => {
    if (!lesson) return;
    setIsGenerating(true);
    try {
        await generateContent({ 
            lessonId, 
            title: lesson.title, 
            moduleTitle: "Course Context"
        });
    } catch (e) {
        alert("Failed to generate content");
    } finally {
        setIsGenerating(false);
    }
  };

  const startExam = () => {
    document.documentElement.requestFullscreen().catch(() => {});
    setViewMode("exam_active");
  };

  const handleSelect = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitExam = async () => {
    if (!lesson?.questions) return;
    setIsSubmitting(true);
    
    let correctCount = 0;
    lesson.questions.forEach((q:any, idx:number) => {
      if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const finalScore = Math.round((correctCount / lesson.questions.length) * 100);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    
    try {
      await submitProgress({
        lessonId,
        score: finalScore,
        answers: lesson.questions.map((_:any, i:number) => selectedAnswers[i] || ""),
        clerkId: user?.id,
        name: user?.fullName || user?.firstName || "Student",
        email: user?.primaryEmailAddress?.emailAddress
      });
      setResult({ score: finalScore, total: lesson.questions.length });
      setViewMode("exam_result");
    } catch (e: any) {
      console.error(e); // Silently fail if trivial
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) return (
     <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
     </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
        <AnimatePresence mode="wait">
            
            {/* --- VIEW: LESSON CONTENT --- */}
            {viewMode === "content" && (
                <motion.div 
                    key="content"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="max-w-4xl mx-auto p-6 md:p-12 space-y-8"
                >
                    {/* Premium Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                        <div className="flex items-center gap-6">
                            <Button 
                                variant="ghost" 
                                onClick={() => router.back()}
                                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 transition-all active:scale-90"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
                                    {lesson.title}
                                </h1>
                                <div className="flex items-center gap-3 mt-3 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                        <BookOpen className="w-4 h-4 text-indigo-400" /> Lesson Content
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                        <Timer className="w-4 h-4 text-purple-400" /> 10 min read
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={() => setViewMode("exam_intro")} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 py-6 text-base font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 hidden md:flex"
                        >
                            Take Quiz <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Rich Content Area */}
                    <div className="relative">
                        {!lesson.content ? (
                             <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center ring-1 ring-white/10">
                                    <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                                </div>
                                <div className="max-w-md space-y-3 px-4">
                                    <h3 className="text-2xl font-bold text-white">Unlock This Lesson</h3>
                                    <p className="text-slate-400 text-lg">Use AI to instantly generate high-quality learning material and a quiz for this topic.</p>
                                </div>
                                <Button 
                                    onClick={handleGenerateContent} 
                                    disabled={isGenerating}
                                    className="bg-white text-black hover:bg-slate-200 rounded-xl px-10 py-6 text-lg font-bold shadow-xl transition-all hover:-translate-y-1"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="mr-3 w-5 h-5 fill-indigo-600 text-indigo-600" />}
                                    Generate Content
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-indigo-300 mt-8 mb-6 first:mt-0" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-12 mb-6 pb-2 border-b border-indigo-500/30 flex items-center gap-3" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-purple-200 mt-8 mb-4" {...props} />,
                                        p: ({node, ...props}) => <p className="text-slate-300 leading-8 text-lg mb-6" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-3 mb-8 ml-2" {...props} />,
                                        li: ({node, ...props}) => (
                                            <li className="flex items-start gap-3 text-slate-300">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                <span className="leading-7">{props.children}</span>
                                            </li>
                                        ),
                                        strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                                        blockquote: ({node, ...props}) => (
                                            <blockquote className="border-l-4 border-indigo-500 pl-6 py-4 my-8 bg-indigo-500/10 rounded-r-xl italic text-slate-200 text-lg" {...props} />
                                        ),
                                        code: ({node, ...props}) => (
                                            <code className="bg-black/30 text-indigo-300 px-2 py-1 rounded-md font-mono text-sm border border-white/5" {...props} />
                                        )
                                    }}
                                >
                                    {lesson.content}
                                </ReactMarkdown>
                                
                                <div className="mt-16 pt-8 border-t border-white/10 flex justify-center md:hidden">
                                     <Button 
                                        onClick={() => setViewMode("exam_intro")} 
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 text-lg font-bold shadow-lg"
                                    >
                                        Take Quiz
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* --- VIEW: EXAM INTRO --- */}
            {viewMode === "exam_intro" && (
                <motion.div 
                    key="intro"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                    <div className="bg-[#0f172a] border border-white/10 p-10 rounded-[2.5rem] max-w-lg w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-inset ring-indigo-500/20">
                            <ShieldAlert className="w-12 h-12 text-indigo-400" />
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-bold text-white">Exam Session</h2>
                            <p className="text-slate-400 mt-3 text-lg">You are entering a secure, proctored environment.</p>
                        </div>

                        <div className="text-left bg-white/5 p-6 rounded-2xl space-y-4 border border-white/5">
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">✓</div>
                                <span className="text-base font-medium">{lesson.questions?.length || 5} conceptual questions</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">✓</div>
                                <span className="text-base font-medium">Fullscreen focus mode</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">✓</div>
                                <span className="text-base font-medium">Results are saved automatically</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={() => setViewMode("content")} className="flex-1 h-14 rounded-xl border-white/10 hover:bg-white/5 text-base font-medium">
                                Go Back
                            </Button>
                            <Button onClick={startExam} className="flex-1 h-14 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-base shadow-lg hover:scale-[1.02] transition-transform">
                                Start Exam
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- VIEW: EXAM ACTIVE --- */}
            {viewMode === "exam_active" && (
                <motion.div 
                    key="active"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="min-h-screen bg-black text-white relative"
                >
                    {/* Progress Bar */}
                    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60]">
                        <motion.div 
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(Object.keys(selectedAnswers).length / (lesson.questions?.length || 1)) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                     {/* Proctor Header */}
                    <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-6 md:px-8 py-4 flex justify-between items-center shadow-2xl">
                        <div className="font-bold text-lg flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <GraduationCap className="text-indigo-400 w-5 h-5" />
                            </div>
                            <span className="hidden md:inline text-slate-200 text-sm md:text-base">{lesson.title}</span>
                            <span className="md:hidden text-slate-200 text-sm">Exam Session</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {warnings > 0 && (
                                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 animate-pulse">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-red-400 font-bold text-xs">Warning: {warnings}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 rounded-full border border-red-500/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="text-red-400 text-[10px] font-bold tracking-wider">REC</span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-48 space-y-16">
                        {lesson.questions?.map((q:any, idx:number) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="space-y-6"
                            >
                                <div className="flex gap-4 md:gap-6">
                                     <span className="text-4xl md:text-5xl font-black text-white/10 select-none">
                                        {(idx+1).toString().padStart(2, '0')}
                                     </span>
                                     <h3 className="text-lg md:text-2xl font-medium leading-relaxed pt-2 text-slate-100">
                                        {q.question}
                                     </h3>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-3 pl-0 md:pl-16">
                                    {q.options.map((opt:string, oIdx:number) => {
                                        const isSelected = selectedAnswers[idx] === opt;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleSelect(idx, opt)}
                                                className={`
                                                    relative w-full text-left p-5 rounded-xl border transition-all duration-200 group
                                                    ${isSelected 
                                                        ? "bg-indigo-600/15 border-indigo-500" 
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"}
                                                `}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                                                        ${isSelected 
                                                            ? "bg-indigo-500 text-white" 
                                                            : "bg-white/10 text-slate-400 group-hover:bg-white/20"}
                                                    `}>
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span className={`text-base md:text-lg leading-snug transition-colors ${isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                                                        {opt}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                     <div className="absolute top-5 right-5 text-indigo-400">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                     </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 z-40">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-slate-400 text-sm font-medium">
                                <span className="text-white">{Object.keys(selectedAnswers).length}</span> of <span className="text-white">{lesson.questions?.length}</span> questions answered
                            </div>
                            <Button 
                               onClick={handleSubmitExam} 
                               disabled={isSubmitting}
                               className="w-full md:w-auto md:min-w-[200px] h-14 bg-white text-black hover:bg-slate-200 rounded-xl text-base font-bold shadow-lg shadow-white/5 hover:scale-[1.02] transition-all"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Submit Examination"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- VIEW: EXAM RESULT --- */}
            {viewMode === "exam_result" && result && (
                <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="min-h-screen flex items-center justify-center p-6"
                >
                    <div className="bg-[#0f172a] border border-white/10 p-12 rounded-[3rem] max-w-lg w-full text-center relative overflow-hidden shadow-2xl">
                         {/* Confetti or detailed result bg effects can go here */}
                         <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                        <div className="relative">
                            <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-green-500/20">
                                <CheckCircle2 className="w-16 h-16 text-green-400" />
                            </div>
                            
                            <h2 className="text-xl font-medium text-slate-400 uppercase tracking-widest mb-4">Assessment Complete</h2>
                            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">
                                {result.score}%
                            </h1>
                            <p className="text-slate-400 mb-10 text-lg">
                                You answered <strong className="text-white">{Math.round((result.score / 100) * result.total)}</strong> out of {result.total} questions correctly.
                            </p>
                            
                            <div className="space-y-4">
                                <Button onClick={() => router.push(`/course/${lesson.courseId}`)} className="w-full h-16 bg-white text-black hover:bg-slate-200 rounded-2xl text-lg font-bold shadow-lg">
                                    Return to Course
                                </Button>
                                <Button variant="ghost" onClick={() => setViewMode("content")} className="w-full text-zinc-500 hover:text-white">
                                    Review Material
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
