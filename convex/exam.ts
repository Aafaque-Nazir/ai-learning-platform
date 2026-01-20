import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logViolation = mutation({
  args: {
    lessonId: v.id("lessons"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return; // Fail silently or throw

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    // We can store this in a separate 'exam_logs' table if we want strict auditing
    // For now, let's just log it to console or update a 'suspicious' flag on progress
    console.log(`VIOLATION: User ${user.name} (${user._id}) - ${args.type} on lesson ${args.lessonId}`);
  },
});

export const getExamLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
      return await ctx.db.get(args.lessonId);
  }
});
