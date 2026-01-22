# 🚀 AdaptiveAI: Next-Gen Personalized Learning Platform

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%2015%20|%20Convex%20|%20Tailwind-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

> **Assessment Project Submission**
> This project demonstrates the implementation of a scalable, AI-driven educational platform that adapts to individual learning styles in real-time.

---

## 📖 Executive Summary

**AdaptiveAI** is a cutting-edge learning management system (LMS) that solves the problem of "one-size-fits-all" education. By leveraging Generative AI, the platform creates personalized curriculums, acts as an intelligent 24/7 tutor, and provides adaptive assessments that evolve with the student's mastery.

**Key Technical Achievements:**

- **Real-time Synchronization:** Built on a serverless backend for instant state updates without manual refreshing.
- **AI Integration:** Seamlessly integrates LLMs to generate structured JSON-based course content and context-aware chat responses.
- **Performance:** Optimized for core web vitals using Next.js 15 App Router and React Server Components.

---

## ✨ Key Features

### 🧠 1. AI-Driven Course Generation

Instead of static video libraries, users generate custom courses on _any_ topic.

- **Dynamic Curriculum:** The AI builds a structured syllabus with chapters and sub-chapters.
- **Rich Content:** Each lesson includes AI-generated explanations, examples, and key takeaways.
- **Media Integration:** (Planned) Auto-fetching of relevant diagrams and videos.

### 🤖 2. Intelligent AI Tutor

A context-aware chat assistant embedded in every lesson.

- **Contextual Awareness:** The AI knows exactly which lesson the student is viewing.
- **Socratic Method:** Encourages critical thinking rather than just giving answers.

### 🛡️ 3. Adaptive Assessment Engine

An exam system that ensures true mastery.

- **Dynamic Questioning:** Questions are generated based on the specific lesson content.
- **Secure Proctoring:** (Simulated) Tab-focus tracking and time limits.
- **Instant Grading:** Immediate feedback with detailed explanations for wrong answers.

### 🏆 4. Gamification & Analytics

Keeping users engaged through psychology-based reward systems.

- **XP Ecosystem:** sophisticated experience point system synced in real-time.
- **Visual Analytics:** Interactive charts showing progress, strengths, and weaknesses.
- **Streak Tracking:** Daily engagement monitoring to build learning habits.

---

## 🛠️ Technical Architecture

### Frontend Layer

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for premium animations.
- **Auth:** [Clerk](https://clerk.com/) for secure, seamless user management.
- **UI Components:** Custom glassmorphism design system built on top of Radix UI primitives.

### Backend & Database Layer

- **Engine:** [Convex](https://convex.dev/) (BaaS)
- **Database:** Real-time document store ensuring <50ms latency.
- **Functions:** Serverless TypeScript functions for business logic and data validation.
- **Edge Computing:** AI streaming responses processed at the edge for speed.

### AI Infrastructure

- **Model:** Integrated with OpenAI/Gemini models via robust prompt engineering.
- **Structuring:** Enforced JSON outputs for consistent UI rendering.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for evaluation.

### Prerequisites

- Node.js 18+
- npm provider

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/adaptive-ai-platform.git
   cd adaptive-ai-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Deployment
   CONVEX_DEPLOYMENT=your_deployment_url
   NEXT_PUBLIC_CONVEX_URL=your_public_url

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret

   # AI - Gemini/OpenAI
   GEMINI_API_KEY=your_api_key
   ```

4. **Start the Development Server**
   Start both the frontend and the backend sync service:

   ```bash
   npm run dev
   npx convex dev
   ```

5. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) to view the project.

---

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router root
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── course/       # Course viewer & learning interface
│   │   ├── exam/         # Assessment interface
│   │   └── page.tsx      # Main dashboard view
│   ├── api/              # API routes/webhooks
│   └── page.tsx          # Marketing landing page
├── components/           # Reusable UI components
│   ├── ui/               # Design system primitives (Buttons, Cards)
│   ├── landing/          # Landing page specific sections
│   └── ChatInterface.tsx # AI Tutor component
├── convex/               # Backend logic
│   ├── schema.ts         # Database schema definition
│   ├── courses.ts        # Course management API
│   └── users.ts          # User stats & progress API
└── lib/                  # Utilities and helper functions
```

---

## 📬 Contact & Evaluation

**Developer:** Aafaq
**Role:** Full Stack Developer
**Focus:** Building scalable, user-centric web applications.

---

_Built with ❤️ using Next.js and Convex_
