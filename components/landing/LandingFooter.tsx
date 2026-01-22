"use client";

import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
  return (
    <footer className="pt-24 pb-12 border-t border-white/5 bg-[#020617]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20"
          >
            <Sparkles className="text-white w-10 h-10" />
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-black mb-8 text-white">
            Ready to Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Personalized Journey?
            </span>
          </h2>
          <SignInButton mode="modal">
            <Button size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-slate-200 rounded-full font-bold shadow-2xl transition-all hover:scale-105">
              Get Started for Free <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </SignInButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-12 border-t border-white/5">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-white">AdaptiveAI</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              The world's most advanced AI-powered learning platform. 
              Built for the next generation of engineers and creators.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Twitter size={20} /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Github size={20} /></a>
              <a href="#" className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Curriculum AI</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">AI Tutoring</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">About</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 AdaptiveAI Learning Platform. All rights reserved.</p>
          <p>Made with ❤️ for lifelong learners.</p>
        </div>
      </div>
    </footer>
  );
}
