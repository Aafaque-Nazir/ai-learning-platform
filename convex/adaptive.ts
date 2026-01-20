import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Get Next Lesson (Adaptive Logic)
export const getNextLesson = query({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get user's last progress in this topic
    const lastProgress = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson") // We need a way to filter by topic, simplified for now
      .filter(q => q.eq(q.field("userId"), user._id))
      .collect();

    // Simple Adaptive Logic:
    // If no progress, start at difficulty 1.
    // If last lesson score > 80%, increase difficulty.
    // If last lesson score < 50%, decrease/maintain difficulty.
    
    // For MVP, just return a difficulty 1 lesson or the next one.
    // This requires more complex querying which we can refine.
    
    return await ctx.db
      .query("lessons")
      .withIndex("by_topic_difficulty", (q) => q.eq("topic", args.topic).eq("difficulty", 1))
      .first();
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
