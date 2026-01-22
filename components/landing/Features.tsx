"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  MessageSquare, 
  BarChart2, 
  ShieldCheck, 
  Globe 
} from "lucide-react";

const features = [
  {
    title: "Instant Curriculum",
    description: "Tell AI what you want to learn, and it generates a detailed, structured course in seconds.",
    icon: <Zap className="w-6 h-6" />,
    color: "indigo"
  },
  {
    title: "AI Personal Tutor",
    description: "Stuck on a concept? Chat with your AI tutor 24/7 for tailored explanations and examples.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "purple"
  },
  {
    title: "Smart Assessments",
    description: "Take AI-proctored exams that adapt to your knowledge level to ensure true mastery.",
    icon: <Target className="w-6 h-6" />,
    color: "pink"
  },
  {
    title: "Deep Analytics",
    description: "Track your progress with detailed insights, heatmaps, and experience point tracking.",
    icon: <BarChart2 className="w-6 h-6" />,
    color: "emerald"
  },
  {
    title: "Verified Skill Badges",
    description: "Earn blockchain-verifiable badges for every course you complete and exam you pass.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "violet"
  },
  {
    title: "Multi-Language Support",
    description: "Learn and generate content in over 50 languages with native-level accuracy.",
    icon: <Globe className="w-6 h-6" />,
    color: "blue"
  }
];

export function Features() {
  return (
    <section className="py-24 bg-[#050a1f]/50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black mb-4 text-white"
          >
            Everything you need to <br />
            <span className="text-indigo-400">Excel in Your Career</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Our platform combines cutting-edge AI with proven pedagogical methods 
            to help you learn faster and retain more.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-6 text-${feature.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-200 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
