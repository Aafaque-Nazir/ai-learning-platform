import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// 1. Send Message Action (Calls OpenAI)
export const sendMessage = action({
  args: { 
      body: v.string(), 
      clerkId: v.optional(v.string()), 
      name: v.optional(v.string()), 
      email: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Fallback to args.clerkId if identity is missing (Action Context issue)
    const userId = identity?.subject || args.clerkId;
    const userName = identity?.name || args.name;
    const userEmail = identity?.email || args.email;

    if (!userId) {
      console.error("No user identity found for sendMessage");
      throw new Error("Unauthorized: Please login");
    }

    // Save User Message
    await ctx.runMutation(api.tutor.saveMessage, {
      body: args.body,
      role: "user",
      clerkId: userId,
      name: userName,
      email: userEmail
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
      clerkId: userId,
      // No need to pass name/email for assistant message, user should exist by now
    });
    
    return reply;
  },
});

// 2. Save Message Mutation (Internal)
export const saveMessage = mutation({
  args: { 
    body: v.string(), 
    role: v.union(v.literal("user"), v.literal("assistant")), 
    clerkId: v.string(),
    name: v.optional(v.string()), // Added optional name
    email: v.optional(v.string()) // Added optional email
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
      
    if (!user) {
      if (args.name) {
          console.log("User missing, creating from message context");
          const userId = await ctx.db.insert("users", {
              name: args.name || "Student",
              email: args.email || "",
              clerkId: args.clerkId,
              role: "student",
          });
          user = await ctx.db.get(userId);
      }
      
      if (!user) {
         // Should have been created above if name was passed.
         // If still not there (e.g. name not passed), we have to fail or create minimal.
         throw new Error("User not found and could not auto-create");
      }
    }

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
