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

    const prompt = `
    You are an expert curriculum designer. Create a comprehensive, industry-ready course outline for the topic: "${args.topic}".
    The course should be structured to take a learner from beginner to job-ready.
    
    Structure Requirements:
    - Create between 3 to 5 modules.
    - Each module must have 3-5 lessons.
    - Module 1 should always be "Foundations & Basics".
    - The final module should be "Real-world Projects & Career Verification".
    - Ensure logical progression between modules.

    Return ONLY a JSON object with this structure:
    {
      "modules": [
        {
          "title": "Module Title",
          "description": "Brief description",
          "lessons": ["Lesson 1", "Lesson 2", "Lesson 3"]
        }
      ]
    }
    `;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Output strict JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500, // Limit output size for speed
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();
      
      if (!json.choices || json.choices.length === 0) {
        console.error("No choices in response, using mock");
        return getMockCurriculum(args.topic);
      }

      const content = json.choices[0].message.content;
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      return parsed.modules;

    } catch (e) {
      console.error("AI Generation Error, using fallback:", e);
      return getMockCurriculum(args.topic);
    }
  },
});

function getMockCurriculum(topic: string) {
  return [
    {
      title: `Introduction to ${topic}`,
      description: `A comprehensive introduction to ${topic} fundamentals.`,
      lessons: [
        `What is ${topic}?`,
        `History and Evolution of ${topic}`,
        `Key Concepts in ${topic}`,
        `Getting Started with ${topic}`,
        `Best Practices in ${topic}`
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
    Create educational content for lesson: "${args.title}" (Module: ${args.moduleTitle || "General"}).
    Output JSON with:
    {
      "content": "Markdown lesson with headings, explanations, examples",
      "questions": [{"question": "Q?", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "Why"}]
    }
    Generate 3 questions.
    `;

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 25000);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Output strict JSON only." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000,
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

    } catch (e) {
      console.error("Lesson Gen Error, using fallback:", e);
      const mockData = getMockLessonContent(args.title, args.moduleTitle);
      await ctx.runMutation(api.courses.saveLessonContent, {
        lessonId: args.lessonId,
        content: mockData.content,
        questions: mockData.questions
      });
    }
  }
});

function getMockLessonContent(title: string, moduleTitle?: string) {
  return {
    content: `# ${title}

## Introduction
Welcome to this lesson on **${title}**. This is part of the ${moduleTitle || "course"} curriculum.

## Key Concepts
Understanding ${title} is fundamental to mastering this subject. Here are the core ideas:

1. **Foundation**: The basic principles that underlie ${title}
2. **Application**: How to apply these concepts in real-world scenarios  
3. **Best Practices**: Industry-standard approaches and patterns

## Deep Dive
${title} involves understanding several interconnected components. Let's explore each one:

### Core Principles
The foundation of ${title} rests on key principles that have been developed and refined over time.

### Practical Examples
Here's how you might encounter ${title} in practice:
- Example 1: Basic implementation
- Example 2: Advanced usage patterns
- Example 3: Edge cases to consider

## Summary
In this lesson, you learned the fundamentals of ${title}. These concepts will be built upon in subsequent lessons.

## Next Steps
Practice what you've learned and prepare for the quiz to test your understanding!
`,
    questions: [
      {
        question: `What is the main purpose of ${title}?`,
        options: [
          "To provide a structured approach to learning",
          "To complicate the development process",
          "To replace existing methodologies entirely",
          "None of the above"
        ],
        correctAnswer: "To provide a structured approach to learning",
        explanation: `${title} is designed to provide a structured, efficient approach to the subject matter.`
      },
      {
        question: `Which is a key benefit of understanding ${title}?`,
        options: [
          "Faster problem-solving abilities",
          "Increased complexity in projects",
          "Reduced need for documentation", 
          "Elimination of all bugs"
        ],
        correctAnswer: "Faster problem-solving abilities",
        explanation: "Understanding core concepts leads to faster and more effective problem-solving."
      },
      {
        question: `What should you do after completing this lesson?`,
        options: [
          "Take the quiz to test your knowledge",
          "Skip to the next module",
          "Delete the course",
          "Stop learning"
        ],
        correctAnswer: "Take the quiz to test your knowledge",
        explanation: "Taking the quiz helps reinforce learning and identify areas that need review."
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
        const lessonContent = generateLessonPlaceholder(lessonTitle, modData.title);
        await ctx.db.insert("lessons", {
          moduleId,
          courseId: args.courseId,
          title: lessonTitle,
          content: lessonContent.content,
          order: lessonOrder++,
          questions: lessonContent.questions,
        });
      }
    }
  },
});

// Helper to generate FUN, ENGAGING pre-populated lesson content
function generateLessonPlaceholder(lessonTitle: string, moduleTitle: string) {
  return {
    content: `# 🚀 ${lessonTitle}

> *"The expert in anything was once a beginner."* — Helen Hayes

---

## 👋 Hey there, future expert!

Welcome to **${lessonTitle}**! This is part of the *${moduleTitle}* module, and trust me — you're going to love this one! 

Grab your favorite drink ☕, get comfy, and let's dive in!

---

## 🎯 What You'll Learn

By the end of this lesson, you'll be able to:

✅ Understand the **core concepts** of ${lessonTitle}  
✅ Apply these skills in **real-world scenarios**  
✅ Impress your friends with your new knowledge 😎

---

## 🤔 So, What Exactly is ${lessonTitle}?

Great question! Let's break it down in simple terms:

**${lessonTitle}** is like the secret sauce 🍔 that makes everything work better. Think of it as the foundation — without it, everything else just... falls apart.

### Here's the deal:

| Concept | Think of it as... |
|---------|------------------|
| **Foundation** | The base layer of a cake 🎂 |
| **Application** | Actually eating that delicious cake |
| **Mastery** | Making your own cakes from scratch! |

---

## 💡 Why Should You Care?

Here's the thing — **${lessonTitle}** isn't just some fancy concept to memorize. It's actually SUPER useful because:

1. **🏗️ Foundation**: Everything else builds on this
2. **💼 Career Boost**: Employers LOVE people who understand this
3. **🧠 Brain Power**: It literally makes you smarter at problem-solving

---

## 🎮 Let's Get Practical!

Okay, enough theory. Let's see this in action!

### Example 1: The Basics
Imagine you're building a house. ${lessonTitle} is like making sure you have a solid foundation before adding walls and a roof. Skip this? Your house goes 💥 boom.

### Example 2: Real World
In the real world, professionals use ${lessonTitle} every single day. Whether you're building apps, designing systems, or just trying to be awesome — this is your toolkit.

---

## 🧪 Quick Knowledge Check

Before we move on, ask yourself:
- Can I explain ${lessonTitle} to a 5-year-old? 
- Do I see why this matters?
- Am I ready to crush the quiz? 💪

If you answered "yes" to all three — you're READY!

---

## 📝 Key Takeaways

Let's wrap this up with the highlights:

🌟 **${lessonTitle}** is essential — don't skip it!  
🌟 Practice makes perfect (seriously, practice!)  
🌟 You're doing amazing — keep going! 

---

## 🎉 What's Next?

You've made it through! Now it's time to **test your knowledge** with a quick quiz.

Don't worry — you've got this! And remember, even if you don't get everything right, that's how we learn. 

**Let's goooo!** 🚀
`,
    questions: [
      {
        question: `Which of the following BEST describes "${lessonTitle}"?`,
        options: [
          `A core concept that forms the foundation of ${moduleTitle}`,
          "An outdated practice no longer used in the industry",
          "A purely theoretical concept with no practical use",
          "Something only experts need to understand"
        ],
        correctAnswer: `A core concept that forms the foundation of ${moduleTitle}`,
        explanation: `"${lessonTitle}" is fundamental to understanding ${moduleTitle}. It's used widely across the industry!`
      },
      {
        question: `Based on this lesson, what is a PRIMARY benefit of mastering ${lessonTitle}?`,
        options: [
          "It has no real-world benefits",
          "It only helps with theoretical exams",
          "Better problem-solving and practical application skills",
          "It's only useful for academic purposes"
        ],
        correctAnswer: "Better problem-solving and practical application skills",
        explanation: `Understanding ${lessonTitle} directly improves your ability to solve real-world problems and build practical solutions.`
      },
      {
        question: `In the context of ${moduleTitle}, how does ${lessonTitle} relate to other concepts?`,
        options: [
          "It's completely isolated and unrelated to other topics",
          "It provides the groundwork for more advanced topics",
          "It should be learned last after everything else",
          "It contradicts other concepts in this module"
        ],
        correctAnswer: "It provides the groundwork for more advanced topics",
        explanation: `${lessonTitle} builds the foundation that other concepts in ${moduleTitle} will expand upon. Master this first!`
      }
    ]
  };
}
