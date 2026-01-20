'use client';

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight, GraduationCap, ShieldAlert, Timer } from "lucide-react";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as Id<"lessons">;
  
  const lesson = useQuery(api.exam.getExamLesson, { lessonId });
  const logViolation = useMutation(api.exam.logViolation);
  const submitProgress = useMutation(api.adaptive.submitProgress);
  
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [result, setResult] = useState<{score: number, total: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { warnings } = useExamSecurity(started && !finished, (type) => {
     logViolation({ lessonId, type });
  });

  if (!lesson) return (
     <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent animate-spin rounded-full" />
     </div>
  );

  const startExam = () => {
    document.documentElement.requestFullscreen().catch(() => {});
    setStarted(true);
  };

  const handleSelect = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < lesson.questions.length) {
      if (!confirm(`You've only answered ${answeredCount}/${lesson.questions.length} questions. Submit anyway?`)) return;
    }

    setIsSubmitting(true);
    let correctCount = 0;
    lesson.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / lesson.questions.length) * 100);

    if (document.fullscreenElement) {
       await document.exitFullscreen().catch(() => {});
    }
    
    try {
      const answersArray = lesson.questions.map((_, i) => selectedAnswers[i] || "");
      await submitProgress({
        lessonId,
        score: finalScore,
        answers: answersArray
      });
      setResult({ score: finalScore, total: lesson.questions.length });
      setFinished(true);
    } catch (e: any) {
      console.error(e);
      alert(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (finished && result) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark p-12 rounded-[2.5rem] border-white/5 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
        >
           <div className="relative z-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                <CheckCircle2 className="text-green-400 w-10 h-10" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Results In</h1>
              <p className="text-gray-400 mb-8">Performance analysis complete.</p>
              
              <div className="text-7xl font-black bg-gradient-to-r from-premium-indigo to-premium-violet bg-clip-text text-transparent mb-10">
                {result.score}%
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Correct</div>
                  <div className="text-xl font-bold text-white">{Math.round((result.score/100)*result.total)}/{result.total}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                   <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Security</div>
                   <div className="text-xl font-bold text-green-400">{warnings === 0 ? "Perfect" : `${warnings} Issues`}</div>
                </div>
              </div>

              <Button size="lg" onClick={() => router.push("/")} className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold transition-all">
                Back to Dashboard
              </Button>
           </div>
           
           <div className="absolute top-0 right-0 w-32 h-32 bg-premium-indigo/20 blur-3xl rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient bg-black text-white relative flex flex-col items-center">
       {!started ? (
         <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark p-10 rounded-[2.5rem] border-white/5 text-center w-full"
            >
               <div className="w-16 h-16 bg-premium-indigo/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-premium-indigo/20">
                  <ShieldAlert className="text-premium-indigo w-8 h-8" />
               </div>
               <h1 className="text-3xl font-black mb-4">Final Assessment</h1>
               <p className="text-gray-400 mb-10">
                  You are about to enter a proctored environment for <strong>{lesson.title}</strong>. 
                  All window activity will be monitored.
               </p>
               
               <div className="space-y-4 mb-10 text-left">
                  {[
                    "Fullscreen mode will be forced upon starting.",
                    "Tab switching or window blurring is logged.",
                    "Right-click and Copy/Paste are disabled.",
                    "Your session is linked to your academic ID."
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-300 items-start">
                      <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-premium-violet rounded-full" />
                      </div>
                      {rule}
                    </div>
                  ))}
               </div>

               <Button size="lg" onClick={startExam} className="w-full h-16 bg-gradient-to-r from-premium-indigo to-premium-violet hover:opacity-90 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20 group">
                  Initiate Secure Session
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Button>
            </motion.div>
         </div>
       ) : (
         <div className="w-full max-w-4xl px-6 py-12 lg:py-20 relative min-h-screen flex flex-col">
             {/* Sticky Header */}
             <div className="sticky top-0 z-50 mb-12 flex justify-between items-center glass-dark p-4 px-6 rounded-2xl border-white/10 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-premium-indigo rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white w-5 h-5" />
                   </div>
                   <div>
                     <h2 className="text-sm font-bold tracking-tight">{lesson.title}</h2>
                     <p className="text-[10px] text-gray-500 truncate max-w-[150px]">Secure Examination Session</p>
                   </div>
                </div>

                <div className="flex gap-6 items-center">
                   <div className="flex items-center gap-2 text-gray-300">
                      <AlertCircle className={`w-4 h-4 ${warnings > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                      <span className="text-xs font-bold font-mono">Suspicion: {warnings}</span>
                   </div>
                   <div className="h-6 w-px bg-white/10" />
                   <div className="flex items-center gap-2 text-premium-violet font-bold">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm font-mono tracking-widest leading-none">PROCTOR ACTIVE</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 space-y-12 pb-24">
               {lesson.questions.map((q, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="relative group pt-4"
                 >
                    <div className="absolute top-0 left-0 text-white/5 text-8xl font-black -z-10 select-none">
                      {idx + 1}
                    </div>
                    <div className="glass-dark p-8 md:p-10 rounded-[2rem] border-white/5 group-hover:border-white/10 transition-colors shadow-2xl">
                       <p className="text-xl md:text-2xl font-medium text-white mb-8 leading-snug">
                          {q.question}
                       </p>
                       <div className="grid grid-cols-1 gap-4">
                         {q.options.map((opt, optIdx) => (
                           <button 
                             key={optIdx} 
                             onClick={() => handleSelect(idx, opt)}
                             className={`group relative flex items-center justify-between p-5 rounded-2xl transition-all border text-left
                               ${selectedAnswers[idx] === opt 
                                ? 'bg-premium-indigo/20 border-premium-indigo text-white shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-gray-200'
                               }`}
                           >
                             <span className="font-medium">{opt}</span>
                             <div className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center
                               ${selectedAnswers[idx] === opt 
                                ? 'bg-premium-indigo border-premium-indigo' 
                                : 'border-white/20'
                               }`}
                             >
                               {selectedAnswers[idx] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                             </div>
                           </button>
                         ))}
                       </div>
                    </div>
                 </motion.div>
               ))}
             </div>
             
             {/* Bottom Submit Bar */}
             <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
                <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="w-full h-20 bg-white text-black hover:bg-gray-200 text-xl font-black rounded-3xl shadow-3xl shadow-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.01] active:scale-[0.99] group disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing Final Submission..." : "End Session & Analyze"}
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
             </div>
         </div>
       )}
    </div>
  );
}
