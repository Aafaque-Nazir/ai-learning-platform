"use client";

import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Play, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse decoration-indigo-500" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>AI-Powered Learning is Here</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Master Any Skill with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Personalized AI
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop following rigid curriculums. Generate a custom learning path, 
            get instant feedback from your AI tutor, and earn badges as you grow.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <SignInButton mode="modal">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-slate-200 rounded-full font-bold shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                Start Learning Free <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            
            <Button variant="ghost" size="lg" className="h-14 px-8 text-lg text-white hover:bg-white/5 rounded-full border border-white/10 transition-all hover:border-white/20">
              <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
            </Button>
          </motion.div>

          {/* Stats/Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-3 gap-8 pt-12 border-t border-white/5"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">10k+</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Courses Generated</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Success Rate</div>
            </div>
            <div className="hidden lg:flex flex-col items-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">AI Tutoring</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
