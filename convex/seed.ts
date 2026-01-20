import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data exists
    const existing = await ctx.db.query("lessons").first();
    if (existing) return "Already seeded";

    const lessons = [
      {
        title: "Introduction to Algebra",
        topic: "math",
        difficulty: 1,
        content: "# Algebra Basics\nAlgebra is the study of mathematical symbols...",
        questions: [
          {
            question: "What is x if x + 2 = 5?",
            options: ["1", "2", "3", "4"],
            correctAnswer: "3",
            explanation: "Subtract 2 from both sides."
          }
        ]
      },
      {
        title: "Solving Linear Equations",
        topic: "math",
        difficulty: 2,
        content: "# Linear Equations\nLearn to solve equations like 2x + 5 = 15...",
        questions: [
          {
            question: "Solve for y: 2y = 10",
            options: ["2", "5", "8", "20"],
            correctAnswer: "5",
            explanation: "Divide both sides by 2."
          }
        ]
      },
       {
        title: "Quadratic Equations",
        topic: "math",
        difficulty: 3,
        content: "# Quadratics\nUnderstanding ax^2 + bx + c = 0...",
        questions: [
          {
            question: "How many roots does x^2 - 4 = 0 have?",
            options: ["1", "2", "0", "Infinite"],
            correctAnswer: "2",
            explanation: "The roots are +2 and -2."
          }
        ]
      }
    ];

    for (const l of lessons) {
      await ctx.db.insert("lessons", l);
    }
    
    return "Seeding Complete";
  },
});
