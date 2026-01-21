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
    answers: v.array(v.string()), // User answers
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) throw new Error("User not found");

    await ctx.db.insert("progress", {
        userId: user._id,
        lessonId: args.lessonId,
        score: args.score, // Calculated on client for now, strictly should be server
        completed: args.score >= 70,
        attempts: 1,
    });
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
