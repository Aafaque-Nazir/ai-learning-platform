import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// 1. Send Message Action (Calls OpenAI)
export const sendMessage = action({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Retrieve user via Query (we can't query directly in action easily without runQuery, 
    // but for identity check we trust ctx.auth)
    
    // Save User Message
    await ctx.runMutation(api.tutor.saveMessage, {
      body: args.body,
      role: "user",
      clerkId: identity.subject
    });

    // Call OpenAI (Placeholder logic until API Key is set)
    const apiKey = process.env.OPENAI_API_KEY;
    let reply = "I am an AI Tutor. I can help you explain this concept.";
    
    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
             model: "gpt-4o",
             messages: [
               { role: "system", content: "You are a helpful AI Tutor for kids." },
               { role: "user", content: args.body }
             ]
          })
        });
        const json = await response.json();
        if (json.choices && json.choices.length > 0) {
            reply = json.choices[0].message.content;
        }
      } catch (e) {
        console.error("OpenAI Error", e);
        reply = "Sorry, I am having trouble connecting to my brain right now.";
      }
    } else {
        reply = "I see! (Note: OpenAI API Key missing. Please set OPENAI_API_KEY in convex dashboard).";
    }

    // Save Assistant Message
    await ctx.runMutation(api.tutor.saveMessage, {
      body: reply,
      role: "assistant",
      clerkId: identity.subject
    });
    
    return reply;
  },
});

// 2. Save Message Mutation (Internal)
export const saveMessage = mutation({
  args: { body: v.string(), role: v.union(v.literal("user"), v.literal("assistant")), clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
      
    if (!user) throw new Error("User not found");

    await ctx.db.insert("messages", {
      userId: user._id,
      body: args.body,
      role: args.role,
      timestamp: Date.now(),
    });
  }
});

// 3. Get History Query
export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    // Sort in memory (newest first)
    return messages.sort((a, b) => b._creationTime - a._creationTime).slice(0, 50);
  }
});
