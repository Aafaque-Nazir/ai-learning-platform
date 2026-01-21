import { query } from "./_generated/server";

export const getDiagnostics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return {
        error: "Not authenticated",
        identity: null,
        userRecord: null,
        courses: [],
        progress: [],
      };
    }

    // Get user record from users table
    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Get all courses (not filtered, to see all)
    const allCourses = await ctx.db.query("courses").collect();
    
    // Get courses for this user
    const userCourses = await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get progress if user exists
    let userProgress: any[] = [];
    if (userRecord) {
      userProgress = await ctx.db
        .query("progress")
        .withIndex("by_user_lesson", (q) => q.eq("userId", userRecord._id))
        .collect();
    }

    return {
      identity: {
        subject: identity.subject,
        name: identity.name,
        email: identity.email,
      },
      userRecord: userRecord ? {
        _id: userRecord._id,
        clerkId: userRecord.clerkId,
        name: userRecord.name,
        email: userRecord.email,
      } : null,
      allCourses: allCourses.map(c => ({
        _id: c._id,
        title: c.title,
        userId: c.userId,
        matchesClerkId: c.userId === identity.subject,
      })),
      userCourses: userCourses.map(c => ({
        _id: c._id,
        title: c.title,
        userId: c.userId,
      })),
      userProgress: userProgress.map(p => ({
        lessonId: p.lessonId,
        score: p.score,
        completed: p.completed,
      })),
      summary: {
        clerkId: identity.subject,
        hasUserRecord: !!userRecord,
        totalCoursesInDb: allCourses.length,
        coursesMatchingClerkId: userCourses.length,
        coursesWithEmptyUserId: allCourses.filter(c => !c.userId || c.userId === "").length,
        progressCount: userProgress.length,
      }
    };
  },
});
