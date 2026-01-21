import { ActionCtx, MutationCtx, QueryCtx, action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateCourseAction = action({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API Key is missing. Please set it in the Convex Dashboard.");
    }

    const prompt = `
    You are an expert curriculum designer. create a structured course outline for the topic: "${args.topic}".
    Limit the course to exactly 3 modules. Each module should have exactly 3 lessons.
    
    Return ONLY a JSON object with this exact structure:
    {
      "modules": [
        {
          "title": "Module Title",
          "description": "Brief description of module",
          "lessons": [
             "Lesson 1 Title",
             "Lesson 2 Title",
             "Lesson 3 Title"
          ]
        }
      ]
    }
    Do not include any other text or markdown formatting. Just the raw JSON.
    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI curriculum generator that outputs strict JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        })
      });

      const json = await response.json();
      if (!json.choices || json.choices.length === 0) {
        throw new Error("No response from OpenAI");
      }

      const content = json.choices[0].message.content;
      
      // Parse JSON (handle potential markdown ticks)
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      return parsed.modules;

    } catch (e) {
      console.error("AI Generation Error:", e);
      throw new Error("Failed to generate course outline.");
    }
  },
});


export const generateLessonContentAction = action({
  args: { 
    lessonId: v.id("lessons"),
    title: v.string(),
    moduleTitle: v.optional(v.string()) // Context helps AI
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key missing");

    const prompt = `
    You are an expert teacher. Create a comprehensive lesson for: "${args.title}" (Context: ${args.moduleTitle || "General"}).
    
    Output structured JSON:
    {
      "content": "Full markdown content of the lesson. Be detailed, use headers, examples, code blocks if needed.",
      "questions": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "Correct Option Text",
          "explanation": "Why this is correct."
        },
        ... (generate 3-5 questions)
      ]
    }
    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You represent a learning platform. Output strict JSON." },
            { role: "user", content: prompt }
          ]
        })
      });

      const json = await response.json();
      const raw = json.choices[0].message.content;
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(clean);

      // Save to DB via Mutation
      await ctx.runMutation(api.courses.saveLessonContent, {
        lessonId: args.lessonId,
        content: data.content,
        questions: data.questions
      });

    } catch (e) {
      console.error("Lesson Gen Error", e);
      throw new Error("Failed to generate lesson content");
    }
  }
});

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
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 1. Get User
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // 2. Get Courses
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkId)) // Note: schema says userId is clerkId
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
        lessons.sort((a, b) => a.order - b.order);
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
    // Determine the starting order for new modules. 
    // If the course already has modules, start after the last one.
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

      // Insert lessons for this module
      let lessonOrder = 1;
      for (const lessonTitle of modData.lessons) {
        await ctx.db.insert("lessons", {
          moduleId,
          courseId: args.courseId,
          title: lessonTitle,
          content: "", // Content will be generated later
          order: lessonOrder++,
        });
      }
    }
  },
});
