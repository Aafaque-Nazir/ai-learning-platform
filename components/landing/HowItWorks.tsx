"use client";

import { motion } from "framer-motion";
import { Sparkles, GraduationCap, Trophy, LayoutDashboard } from "lucide-react";

const steps = [
  {
    title: "Define Your Goal",
    description: "Enter any topic or career path you want to master. Our AI will research and curate the best content for you.",
    icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
  },
  {
    title: "Generate Curriculum",
    description: "Watch as a comprehensive, multi-module course is generated instantly, complete with lessons and quizzes.",
    icon: <LayoutDashboard className="w-8 h-8 text-blue-400" />,
  },
  {
    title: "Learn & Interact",
    description: "Study with AI-powered lessons and get help from your personal tutor whenever you're stuck.",
    icon: <GraduationCap className="w-8 h-8 text-indigo-400" />,
  },
  {
    title: "Verify Mastery",
    description: "Pass AI-proctored exams to earn verified badges and showcase your skills to the world.",
    icon: <Trophy className="w-8 h-8 text-emerald-400" />,
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">How it Works</h2>
          <p className="text-slate-400 text-lg">
            Four simple steps to transform your learning experience and accelerate your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative"
            >
              {/* Connector line for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent -z-10" />
              )}
              
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{step.icon}</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-[#020617]">
                    0{idx + 1}
                  </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
