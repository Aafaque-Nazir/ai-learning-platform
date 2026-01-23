"use client";

import { SignInButton } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ChevronRight, Play, Award, Zap, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
      {/* 🌌 Deep Space Background */}
      <div className="absolute inset-0 bg-[#020617] -z-20" />
      
      {/* 🎇 Animated Aurora Gradients (Blue/Sky) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
             x: [0, 100, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] bg-sky-500/20 blur-[120px] rounded-full mix-blend-screen" 
        />
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-[#020617] via-transparent to-transparent z-0" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* 🏆 Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8 backdrop-blur-xl shadow-lg shadow-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-default"
          >
            <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400 animate-pulse" />
            <span className="tracking-wide">AI-Powered Personalized Learning</span>
          </motion.div>

          {/* 🚀 Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1] text-white"
          >
            Master Any Skill with <br className="hidden md:block"/>
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 animate-gradient-x">
                Adaptive AI
              </span>
              <motion.svg 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                 className="absolute -bottom-2 left-0 w-full h-3 text-blue-500" 
                 viewBox="0 0 100 10" 
                 preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
              </motion.svg>
            </span>
          </motion.h1>

          {/* 📝 Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Break free from generic courses. Experience a <span className="text-white font-semibold">dynamic curriculum</span> that evolves with your progress, powered by advanced AI.
          </motion.p>

          {/* 🔘 Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <SignInButton mode="modal">
              <Button size="lg" className="h-16 px-12 text-xl bg-white text-black hover:bg-blue-50 transition-all rounded-full font-bold shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:bg-blue-100 hover:scale-105 active:scale-95 group">
                Start Learning Free 
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
            
            <Button variant="outline" size="lg" className="h-16 px-10 text-xl text-white border-white/20 hover:bg-white/10 hover:border-white/40 rounded-full transition-all backdrop-blur-sm group">
              <Play className="mr-3 w-6 h-6 fill-white/20 group-hover:fill-white/100 transition-colors" /> 
              Watch Demo
            </Button>
          </motion.div>

          {/* 📊 Trust Signals / Stats (Glass Cards) */}
          <motion.div
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 px-4"
          >
             {[
               { icon: Rocket, label: "Courses Generated", value: "10,000+" },
               { icon: Star, label: "Success Rate", value: "98%" },
               { icon: Zap, label: "Learning Speed", value: "2.5x" },
               { icon: Award, label: "Certificates Issued", value: "5,000+" },
             ].map((stat, i) => (
               <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md hover:bg-white/[0.06] transition-colors group">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <stat.icon className="w-6 h-6 text-blue-400" />
                 </div>
                 <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                 <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
               </div>
             ))}
          </motion.div>

        </div>
      </div>
      
      {/* Floating Elements (Parallax) */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 left-10 hidden lg:block pointer-events-none opacity-20">
         <div className="w-24 h-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl rotate-12" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-1/3 right-10 hidden lg:block pointer-events-none opacity-20">
         <div className="w-32 h-32 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl" />
      </motion.div>

    </section>
  );
}
