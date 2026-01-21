import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Get Next Lesson (Adaptive Logic)
// 1. Get Next Lesson (Simple Course Flow)
export const getNextLesson = query({
  args: { courseId: v.optional(v.id("courses")) },
  handler: async (ctx, args) => {
    // If no course selected, we can't recommend.
    if (!args.courseId) return null;

    // For now, just get the first lesson of the course
    const firstLesson = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
      .first();

    return firstLesson;
  },
});

// 2. Submit Lesson Progress
export const submitProgress = mutation({
  args: {
    lessonId: v.id("lessons"),
    score: v.number(),
    answers: v.array(v.string()),
    clerkId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject || args.clerkId;
    
    if (!clerkId) {
        console.error("No clerkId found for submitProgress");
        return;
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
      
    if (!user) {
      console.log("User not found in DB during progress submit, creating new user record...");
      const id = await ctx.db.insert("users", {
        name: identity?.name || args.name || "Student",
        email: identity?.email || args.email || "",
        image: identity?.pictureUrl,
        clerkId: clerkId,
        role: "student"
      });
      user = await ctx.db.get(id);
    }

    if (!user) throw new Error("Failed to create or retrieve user");

    // Check if progress already exists for this lesson
    const existingProgress = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id).eq("lessonId", args.lessonId))
      .unique();

    if (existingProgress) {
      // Update existing progress
      await ctx.db.patch(existingProgress._id, {
        score: Math.max(existingProgress.score, args.score), // Keep best score
        completed: true, // Always mark as completed if they finished the exam
        attempts: existingProgress.attempts + 1,
      });
    } else {
      // Create new progress
      await ctx.db.insert("progress", {
        userId: user._id,
        lessonId: args.lessonId,
        score: args.score,
        completed: true, // Mark as completed
        attempts: 1,
      });
    }
  }
});

// 3. Get User Stats (Real Data)
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { completed: 0, avgScore: 0, totalAttempts: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { completed: 0, avgScore: 0, totalAttempts: 0 };

    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id))
      .collect();

    if (progress.length === 0) return { completed: 0, avgScore: 0, totalAttempts: 0 };

    const completed = progress.filter(p => p.completed).length;
    const totalScore = progress.reduce((acc, p) => acc + p.score, 0);
    const avgScore = Math.round(totalScore / progress.length);

    return {
      completed,
      avgScore,
      totalAttempts: progress.length,
    };
  },
});

// 4. Get User Progress for Course (List of lessons)
export const getUserProgress = query({
  args: { courseId: v.optional(v.string()) }, // Optional filter by course if needed later
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) => q.eq("userId", user._id))
      .collect();

    return progress.map(p => ({
        lessonId: p.lessonId,
        completed: p.completed,
        score: p.score
    }));
  },
});
