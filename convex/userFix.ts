import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Manual user creation mutation that doesn't require auth
export const createUserManually = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      console.log("User already exists:", existing._id);
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
      role: "student",
    });

    console.log("Created new user:", userId);
    return userId;
  },
});
