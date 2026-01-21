"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight, GraduationCap, ShieldAlert, Timer, BookOpen, Sparkles, Loader2, Play } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
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
            // No content yet? We stay in 'content' mode but UI will show 'Generate' button
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
            moduleTitle: "Course Context" // ideally we fetch module title too
        });
        // The query 'lesson' will auto-update when mutation finishes
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
        answers: lesson.questions.map((_:any, i:number) => selectedAnswers[i] || "")
      });
      setResult({ score: finalScore, total: lesson.questions.length });
      setViewMode("exam_result");
    } catch (e: any) {
      alert(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) return (
     <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
     </div>
  );

  // --- VIEW: LESSON CONTENT ---
  if (viewMode === "content") {
      return (
        <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
             <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            {lesson.title}
                        </h1>
                        <p className="text-slate-400 mt-2">Lesson Content</p>
                    </div>
                    <Button onClick={() => setViewMode("exam_intro")} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6">
                        Take Quiz <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[400px]">
                    {!lesson.content ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-xl font-bold">Content Not Generated</h3>
                                <p className="text-slate-400">This lesson is empty. Use AI to generate comprehensive learning material and a quiz.</p>
                            </div>
                            <Button 
                                onClick={handleGenerateContent} 
                                disabled={isGenerating}
                                className="bg-white text-black hover:bg-slate-200 rounded-xl px-8 py-6 text-lg font-bold"
                            >
                                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 w-5 h-5" />}
                                Generate with AI
                            </Button>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-lg max-w-none">
                            {/* Simple rendering for now, can upgrade to ReactMarkdown */}
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                                {lesson.content}
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
      );
  }

  // --- VIEW: EXAM INTRO ---
  if (viewMode === "exam_intro") {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] max-w-xl w-full text-center space-y-8"
            >
                <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
                    <ShieldAlert className="w-10 h-10 text-indigo-400" />
                </div>
                
                <div>
                    <h2 className="text-3xl font-bold text-white">Ready for the Exam?</h2>
                    <p className="text-slate-400 mt-2">You are about to start a secure, proctored session.</p>
                </div>

                <div className="text-left bg-black/20 p-6 rounded-xl space-y-3">
                    <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>{lesson.questions?.length || 0} Questions</span>
                    </div>
                     <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span>Fullscreen Proctored Mode</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setViewMode("content")} className="flex-1 h-14 rounded-xl border-white/10 hover:bg-white/5">
                        Go Back
                    </Button>
                    <Button onClick={startExam} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                        Start Exam
                    </Button>
                </div>
            </motion.div>
        </div>
    );
  }

  // --- VIEW: EXAM ACTIVE ---
  if (viewMode === "exam_active") {
       return (
         <div className="min-h-screen bg-black text-white relative">
             {/* Proctor Header */}
             <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center">
                 <div className="font-bold text-lg flex items-center gap-2">
                     <GraduationCap className="text-indigo-400" />
                     {lesson.title}
                 </div>
                 <div className="flex items-center gap-4">
                     {warnings > 0 && (
                         <span className="text-red-500 flex items-center gap-2 font-mono font-bold text-sm animate-pulse">
                             <AlertCircle className="w-4 h-4" /> Warning: {warnings}
                         </span>
                     )}
                     <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                         REC
                     </div>
                 </div>
             </div>

             <div className="max-w-3xl mx-auto p-6 lg:p-12 space-y-12 pb-32">
                 {lesson.questions?.map((q:any, idx:number) => (
                     <div key={idx} className="space-y-6">
                         <h3 className="text-xl md:text-2xl font-medium leading-relaxed">
                            <span className="text-slate-500 mr-2">{idx+1}.</span>
                            {q.question}
                         </h3>
                         <div className="grid gap-3">
                             {q.options.map((opt:string, oIdx:number) => (
                                 <button
                                     key={oIdx}
                                     onClick={() => handleSelect(idx, opt)}
                                     className={`w-full text-left p-4 rounded-xl border transition-all ${
                                         selectedAnswers[idx] === opt 
                                         ? "bg-indigo-600/20 border-indigo-500 text-white" 
                                         : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                     }`}
                                 >
                                     <span className="inline-block w-6 font-bold text-slate-500 mr-2">
                                         {String.fromCharCode(65 + oIdx)}
                                     </span>
                                     {opt}
                                 </button>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>

             <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
                 <div className="max-w-3xl mx-auto">
                     <Button 
                        onClick={handleSubmitExam} 
                        disabled={isSubmitting}
                        className="w-full h-16 bg-white text-black hover:bg-slate-200 rounded-2xl text-lg font-bold shadow-xl"
                     >
                         {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Exam"}
                     </Button>
                 </div>
             </div>
         </div>
       );
  }

  // --- VIEW: RESULT ---
  if (viewMode === "exam_result" && result) {
      return (
          <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
              <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] max-w-lg w-full"
              >
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
                      Score: {result.score}%
                  </h2>
                  <p className="text-slate-400 mb-8">
                      You answered {Math.round((result.score / 100) * result.total)} out of {result.total} questions correctly.
                  </p>
                  
                  <Button onClick={() => router.push(`/course/${lesson.courseId}`)} className="w-full h-14 bg-white text-black hover:bg-slate-200 rounded-xl font-bold">
                      Return to Course Board
                  </Button>
              </motion.div>
          </div>
      );
  }

  return null; 
}
