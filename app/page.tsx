import { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: "AdaptiveAI - Personalized Learning Platform",
  description: "Generate custom AI courses, get instant tutoring, and track your progress with our adaptive learning engine.",
  openGraph: {
    title: "AdaptiveAI - Master Any Skill with AI",
    description: "Stop following rigid curriculums. Generate a custom learning path, get instant feedback from your AI tutor, and earn badges as you grow.",
    type: "website",
  },
};

export default function Home() {
  return <HomeClient />;
}
