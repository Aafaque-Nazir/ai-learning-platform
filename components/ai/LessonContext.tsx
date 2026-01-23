"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LessonContextType {
  lessonContext: string | undefined;
  setLessonContext: (context: string | undefined) => void;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonContextProvider({ children }: { children: ReactNode }) {
  const [lessonContext, setLessonContext] = useState<string | undefined>(undefined);

  return (
    <LessonContext.Provider value={{ lessonContext, setLessonContext }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessonContext() {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error("useLessonContext must be used within a LessonContextProvider");
  }
  return context;
}
