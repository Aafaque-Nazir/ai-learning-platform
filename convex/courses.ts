import { ActionCtx, MutationCtx, QueryCtx, action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateCourseAction = action({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // If no API key, return mock data immediately
    if (!apiKey) {
      console.log("No OPENAI_API_KEY found, returning mock data");
      return getMockCurriculum(args.topic);
    }

    const isKidTopic = args.topic.toLowerCase().includes("kid") || args.topic.toLowerCase().includes("child");
    
    // Use GPT-4o for superior curriculum structuring
    const prompt = `
    You are a World-Class Curriculum Designer for an elite coding bootcamp.
    Topic: "${args.topic}"
    Target Audience: ${isKidTopic ? "Children" : "Professional Developers / Engineering Students"}

    Goal: Create a "Zero to Hero" Masterclass course.
    
    Requirements:
    1. **Scope**: Cover EVERYTHING from basics to advanced production patterns.
    2. **Modules**: 
       - If complex (e.g., Web Dev, AI, System Design), create **8 to 12 MODULES**.
       - If simple, create 5 MODULES.
    3. **Content**: Include "Tech Stack Setup", "Core Concepts", "Advanced Patterns", "Testing", "Deployment", "Security", "Scalability", and "Capstone Projects".
    4. **Tone**: High standards. Industry-grade.
    5. **Modernity**: Always prefer modern stacks (e.g., TypeScript > JS, Next.js > CRA, Postgres > Mongo) unless tailored otherwise.

    Return ONLY a JSON object with this structure:
    {
      "modules": [
        {
          "title": "Module Title",
          "description": "Brief description",
          "lessons": ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5"]
        }
      ]
    }
    `;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout for larger outlines

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Upgraded model for structure
          messages: [
            { role: "system", content: "You are a serious technical curriculum architect. Output strict JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();
      
      if (json.error || !json.choices || json.choices.length === 0) {
        console.error("OpenAI API ERROR:", JSON.stringify(json.error, null, 2));
        console.error("Full Response:", JSON.stringify(json, null, 2));
        return getMockCurriculum(args.topic);
      }

      const content = json.choices[0].message.content;
      console.log("OpenAI Success. Content Length:", content.length);
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      
      // VALIDATION: Ensure AI didn't return a lazy 1-module course
      if (!parsed.modules || parsed.modules.length < 4) {
        console.error(`AI returned only ${parsed.modules?.length || 0} modules. REJECTING and using fallback.`);
        throw new Error("AI returned insufficient modules (Lazy generation)");
      }

      console.log(`Successfully generated ${parsed.modules.length} modules.`);
      return parsed.modules;

    } catch (e) {
      console.error("CRITICAL AI FAILURE IN generateCourseAction:");
      console.error(e);
      // @ts-ignore
      if (e.message) console.error("Error Message:", e.message);
      return getMockCurriculum(args.topic);
    }
  },
});

function getMockCurriculum(topic: string) {
  return [
    {
      title: `Module 1: Environment Setup & Fundamentals`,
      description: `Setting up your development environment and understanding the core building blocks of ${topic}.`,
      lessons: [
        `Introduction to ${topic}`,
        `Setting up the Dev Environment (VS Code, Git, Node.js)`,
        `Hello World: Your First Program`,
        `Core Syntax and Data Types`
      ]
    },
    {
      title: `Module 2: Deep Dive into Architecture`,
      description: `Understanding how ${topic} works under the hood.`,
      lessons: [
        `Internal Architecture & Memory Management`,
        `The Event Loop & Async Patterns`,
        `Design Patterns in ${topic}`,
        `Data Structures Deep Dive`
      ]
    },
    {
      title: `Module 3: Advanced Modern Patterns`,
      description: `Mastering widely used industry-standard patterns.`,
      lessons: [
        `State Management Strategies`,
        `Performance Optimization Techniques`,
        `Security Best Practices (OWASP)`,
        `Clean Code Principles`
      ]
    },
    {
      title: `Module 4: Testing & Quality Assurance`,
      description: `Ensuring your code is robust and production-ready.`,
      lessons: [
        `Unit Testing with Jest/Vitest`,
        `Integration Testing Strategies`,
        `E2E Testing with Playwright`,
        `Debugging Techniques`
      ]
    },
    {
      title: `Module 5: DevOps & Production Deployment`,
      description: `Taking your application from localhost to the cloud.`,
      lessons: [
        `Dockerizing your Application`,
        `CI/CD Pipelines (GitHub Actions)`,
        `Deploying to Cloud (Vercel/AWS)`,
        `Monitoring & Logging`
      ]
    },
    {
      title: `Module 6: Capstone Project`,
      description: `Building a complete real-world application from scratch.`,
      lessons: [
        `Project Planning & Architecture`,
        `Building the Backend API`,
        `Frontend Integration`,
        `Final Polish & Launch`
      ]
    }
  ];
}


export const generateLessonContentAction = action({
  args: { 
    lessonId: v.id("lessons"),
    title: v.string(),
    moduleTitle: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // If no API key, use mock content
    if (!apiKey) {
      console.log("No API key, using mock lesson content");
      const mockData = getMockLessonContent(args.title, args.moduleTitle);
      await ctx.runMutation(api.courses.saveLessonContent, {
        lessonId: args.lessonId,
        content: mockData.content,
        questions: mockData.questions
      });
      return;
    }

    const prompt = `
    You are an expert Senior professional Staff Software Engineer and Technical Author.
    Topic: "${args.title}"
    Module: "${args.moduleTitle || "General"}"
    
    Goal: Create a COMPREHENSIVE "A to Z" industry-grade lesson.
    
    CRITICAL Requirements:
    1.  **Zero to Hero**: Start from the absolute basics but quickly go DEEP into internal workings (Event Loop, Memory, Compilers).
    2.  **60% Code / 40% Concept**: Prioritize code. Use REAL WORLD tech stacks (React 19, Next.js 14, Postgres, Redis, Docker) - NO generic pseudocode.
    3.  **Production Reality**: Include sections on "Cost Analysis", "Performance Optimization", and "Security Pitfalls".
    4.  **Visuals**: Use Mermaid.js diagrams for complex flows (Sequence, Database Schema, Arch).
    5.  **Structure**:
        - **Internal Architecture**: How it works under the hood.
        - **Implementation**: Step-by-step production code.
        - **Scale & Security**: How to handle 1M+ users.
        - **Summary**: Key takeaways.

    Output JSON:
    {
      "content": "Rich Markdown content (use headers, bolding, lists, and code blocks like \`\`\`typescript)",
      "questions": [{"question": "Hard Interview Question?", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "Deep explanation"}]
    }
    Generate 3 challenging, interview-ready questions.
    `;

    try {
      const controller = new AbortController();
      // Increased timeout for highly detailed content
      setTimeout(() => controller.abort(), 45000);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o", // Using 4o for superior reasoning and code quality
          messages: [
            { role: "system", content: "You are a cynical senior engineer who hates generic tutorials. You write deep, technical, production-ready guides. Output strict JSON only." },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000, 
        }),
        signal: controller.signal,
      });

      const json = await response.json();
      const raw = json.choices[0].message.content;
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(clean);

      await ctx.runMutation(api.courses.saveLessonContent, {
        lessonId: args.lessonId,
        content: data.content,
        questions: data.questions
      });
      console.log("Lesson Generation Success");

    } catch (e) {
      console.error("CRITICAL LESSON GEN FAILURE:", e);
       // @ts-ignore
      if (e.message) console.error("Error Message:", e.message);

      console.log("Using Mock Lesson Content due to error");
      const mockData = getMockLessonContent(args.title, args.moduleTitle);
      await ctx.runMutation(api.courses.saveLessonContent, {
        lessonId: args.lessonId,
        content: mockData.content,
        questions: mockData.questions
      });
    }
  }
});

// Fallback content when AI fails - High Quality Mock Data
function getMockLessonContent(title: string, moduleTitle?: string) {
  return {
    content: `# ${title}

> **Technical Deep Dive**: Production-Grade Implementation Guide

---

## 🏗️ Architecture & Internals

Understanding **${title}** requires looking at the internal execution flow.

### Sequence Flow
\`\`\`mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer
    participant Server as ${title} Service
    participant DB

    Client->>LoadBalancer: Request
    LoadBalancer->>Server: Route Traffic
    Server->>DB: Query Data
    DB-->>Server: Result Set
    Server-->>Client: JSON Response
\`\`\`

---

## 🛠️ The Tech Stack

For this implementation, we will use a modern, type-safe stack:
- **Runtime**: Node.js v20 (LTS)
- **Language**: TypeScript 5.4
- **Core Library**: \`ioredis\` (for performance)

---

## 💻 Implementation

Let's look at a production-ready implementation. Note the error handling and type safety.

\`\`\`typescript:lib/core/${title.toLowerCase().replace(/\s+/g, '-')}.ts
import { Redis } from 'ioredis';
import { z } from 'zod';

// Define strict schema for input validation
const ConfigSchema = z.object({
  ttl: z.number().min(60),
  maxRetries: z.number().default(3),
});

export class ${title.replace(/\s+/g, '')}Manager {
  private redis: Redis;

  constructor(connectionString: string) {
    // Initialize with lazy connection pattern
    this.redis = new Redis(connectionString, {
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  /**
   * Core execution logic for ${title}
   * Uses atomic locks to prevent race conditions.
   */
  async executeSyle(key: string, payload: unknown): Promise<void> {
    const lockKey = \`lock:\${key}\`;
    
    // Acquire distributed lock
    const acquired = await this.redis.set(lockKey, '1', 'NX', 'EX', 10);
    if (!acquired) {
      throw new Error('Could not acquire lock for ${title}');
    }

    try {
      console.log('Processing payload...', payload);
      // Simulate heavy compute
      await new Promise(r => setTimeout(r, 100));
    } finally {
      // Always release lock
      await this.redis.del(lockKey);
    }
  }
}
\`\`\`

---

## ⚠️ Common Pitfalls

1.  **Memory Leaks**: improper teardown of event listeners.
2.  **Race Conditions**: Failing to use distributed locks (as shown above).
3.  **Error Swallowing**: Always log the *cause* of the error, not just "Failed".

---

## 🚀 Performance Implications

| Metric | With Optimization | Without Optimization |
|:-------|:------------------|:---------------------|
| Latency | < 50ms | > 200ms |
| Memory | 50MB | 200MB+ |

> **Pro Tip**: Always profile your memory usage using \`node --inspect\` before deploying to production.
`,
    questions: [
      {
        question: `In a production environment, why is centralized locking important for ${title}?`,
        options: [
          "To prevent race conditions across multiple instances",
          "It makes the code look more complex",
          "It consumes less memory",
          "It is required by TypeScript"
        ],
        correctAnswer: "To prevent race conditions across multiple instances",
        explanation: `Without distributed locking, multiple instances might process ${title} logic simultaneously, leading to data corruption.`
      },
      {
        question: `Which pattern is used to handle connection failures in the example code?`,
        options: [
          "Exponential Backoff in Retry Strategy",
          "Simply ignoring the error",
          "Restarting the entire server",
          "Using a `while(true)` loop"
        ],
        correctAnswer: "Exponential Backoff in Retry Strategy",
        explanation: `The retryStrategy function implements an exponential backoff (times * 50) to prevent overwhelming the database during outages.`
      },
      {
        question: `What is the primary benefit of using Zod schemas as shown?`,
        options: [
          "Runtime validation of unknown data structures",
          "Compiling TypeScript faster",
          "Reducing bundle size",
          "Connecting to the database"
        ],
        correctAnswer: "Runtime validation of unknown data structures",
        explanation: `Zod ensures that configuration objects match the expected shape at runtime, failing fast if invalid data is passed.`
      }
    ]
  };
}

export const saveLessonContent = mutation({
  args: {
    lessonId: v.id("lessons"),
    content: v.string(),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lessonId, {
      content: args.content,
      questions: args.questions
    });
  }
});

export const listUserCourses = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // First try to get from auth context
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || args.clerkId;
    
    if (!userId) {
      console.log("No userId available in listUserCourses");
      return [];
    }

    // Directly query courses using the Clerk ID
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  }
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const courseId = await ctx.db.insert("courses", {
      title: args.title,
      description: args.description,
      userId: args.userId,
    });
    return courseId;
  },
});

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

export const getCourseStructure = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort modules by order
    modules.sort((a, b) => a.order - b.order);

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_module", (q) => q.eq("moduleId", mod._id))
          .collect();
        // Sort lessons by order
        lessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return { ...mod, lessons };
      })
    );

    return { ...course, modules: modulesWithLessons };
  },
});

export const generateCourseOutline = mutation({
  args: {
    courseId: v.id("courses"),
    outline: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        order: v.number(),
        lessons: v.array(v.string()), // List of lesson titles
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingModules = await ctx.db
      .query("modules")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    let nextModuleOrder = existingModules.length > 0 
      ? Math.max(...existingModules.map(m => m.order)) + 1 
      : 1;

    for (const modData of args.outline) {
      const moduleId = await ctx.db.insert("modules", {
        courseId: args.courseId,
        title: modData.title,
        description: modData.description,
        order: nextModuleOrder++,
      });

      // Insert lessons with PRE-POPULATED CONTENT
      let lessonOrder = 1;
      for (const lessonTitle of modData.lessons) {
        // const lessonContent = generateLessonPlaceholder(lessonTitle, modData.title);
        await ctx.db.insert("lessons", {
          moduleId,
          courseId: args.courseId,
          title: lessonTitle,
          content: "", // Empty content triggers auto-generation on frontend
          order: lessonOrder++,
          questions: [],
        });
      }
    }
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // 1. Delete all user progress related to lessons in this course
    const modules = await ctx.db
        .query("modules")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect();

    for (const mod of modules) {
        const lessons = await ctx.db
            .query("lessons")
            .withIndex("by_module", (q) => q.eq("moduleId", mod._id))
            .collect();
        
        for (const lesson of lessons) {
            // Delete progress for this lesson
            const progress = await ctx.db
                .query("progress")
                .filter((q) => q.eq(q.field("lessonId"), lesson._id))
                .collect();
            
            for (const p of progress) {
                await ctx.db.delete(p._id);
            }
            // Delete the lesson
            await ctx.db.delete(lesson._id);
        }
        // Delete the module
        await ctx.db.delete(mod._id);
    }

    // 2. Delete the course itself
    await ctx.db.delete(args.courseId);
  },
});

// Helper to generate a professional placeholder while AI generates content
function generateLessonPlaceholder(lessonTitle: string, moduleTitle: string) {
  return {
    content: `# ${lessonTitle}

> *Initializing technical content generation...*

---

## ⏳ Content Pending

The detailed technical documentation for **${lessonTitle}** is currently being generated by the AI Senior Engineer agent.

### What to expect in this lesson:
- **Deep Dive**: Internal architecture and memory management details.
- **Production Code**: Real-world implementation examples.
- **Best Practices**: Industry-standard patterns and anti-patterns.

*Please wait a moment for the content to stream in...*
`,
    questions: []
  };
}
