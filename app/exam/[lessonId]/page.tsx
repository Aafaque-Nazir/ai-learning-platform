'use client';

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as Id<"lessons">;
  
  const lesson = useQuery(api.exam.getExamLesson, { lessonId });
  const logViolation = useMutation(api.exam.logViolation);
  
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Security Hook
  const { warnings } = useExamSecurity(started && !finished, (type) => {
     logViolation({ lessonId, type });
     alert(`Warning: Exam violation detected (${type})!`);
  });

  if (!lesson) return <div>Loading exam...</div>;

  const startExam = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log("Fullscreen denied", err);
    });
    setStarted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
       {!started ? (
         <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-4">{lesson.title} - Exam</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
               Rules: Fullscreen required. No tab switching. No copy-paste.
            </p>
            <Button size="lg" onClick={startExam} className="w-full">
               Start Exam
            </Button>
         </div>
       ) : (
         <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg relative">
             <div className="absolute top-4 right-4 text-red-500 font-bold">
                Warnings: {warnings}
             </div>
             
             <h2 className="text-xl font-bold mb-6">{lesson.title}</h2>
             
             <div className="space-y-8">
               {lesson.questions.map((q, idx) => (
                 <div key={idx} className="p-4 border rounded-lg dark:border-gray-700">
                    <p className="font-medium mb-4">{idx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <Button key={optIdx} variant="outline" className="justify-start">
                          {opt}
                        </Button>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
             
             <Button className="mt-8 w-full" variant="destructive" onClick={() => {
                document.exitFullscreen();
                setFinished(true);
             }}>
                Submit Exam
             </Button>
         </div>
       )}
    </div>
  );
}
