import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
  }).index("by_clerk_id", ["clerkId"]),

  lessons: defineTable({
    title: v.string(),
    topic: v.string(),
    difficulty: v.number(), // 1 to 5
    content: v.string(), // Markdown content
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.optional(v.string())
    })),
  }).index("by_topic_difficulty", ["topic", "difficulty"]),

  progress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    score: v.number(),
    completed: v.boolean(),
    attempts: v.number(),
  }).index("by_user_lesson", ["userId", "lessonId"]),

  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
});
