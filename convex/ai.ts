import { action } from "./_generated/server";
import { v } from "convex/values";

export const chat = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
    context: v.optional(v.string()), // Current lesson content
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("No OPENAI_API_KEY found.");
    }

    const { messages, context } = args;

    // 1. Construct the System Prompt
    const systemMessage = {
      role: "system",
      content: `You are an expert personalized AI Tutor on a coding learning platform.
      
      ${context 
        ? `CONTEXT: The user is currently studying a lesson with the following content:
           """
           ${context.substring(0, 15000)} ... (truncated)
           """
           
           INSTRUCTION: Answer the user's questions specifically relating to this content. Explain concepts simply, provide code examples if asked, and be encouraging.
          ` 
        : `INSTRUCTION: You are a general coding mentor. Help the user with any programming questions, career advice, or course recommendations.`
      }
      
      Tone: Friendly, encouraging, concise, and technically accurate. Use Markdown.
      `
    };

    // 2. Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Or gpt-3.5-turbo if cost is a concern
        messages: [
            systemMessage,
            ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const json = await response.json();

    if (json.error) {
        console.error("OpenAI Error:", json.error);
        throw new Error(json.error.message || "AI Error");
    }

    return json.choices[0].message.content;
  },
});
