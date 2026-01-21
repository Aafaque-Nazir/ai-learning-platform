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

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    userId: v.string(), // Clerk ID
  }).index("by_user", ["userId"]),

  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()), // A brief summary of what this module covers
    order: v.number(),
  }).index("by_course", ["courseId"]),

  lessons: defineTable({
    moduleId: v.optional(v.id("modules")), // Optional for legacy lessons
    courseId: v.optional(v.id("courses")), // Optional for legacy lessons
    title: v.string(),
    content: v.string(), // Markdown content
    order: v.optional(v.number()), // Optional for legacy lessons
    topic: v.optional(v.string()), // Legacy field
    difficulty: v.optional(v.number()), // Legacy field
    questions: v.optional(v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.string(),
      explanation: v.optional(v.string())
    }))),
  }).index("by_module", ["moduleId"])
    .index("by_course", ["courseId"]),

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
