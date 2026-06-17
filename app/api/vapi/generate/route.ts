import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin-db";
import { getRandomInterviewCover } from "@/lib/utils";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Supports both Vapi and direct API calls
    const args =
      body?.message?.toolCalls?.[0]?.function?.arguments ?? body;

    if (!args) {
      throw new Error("Tool arguments not found");
    }

    const { type, role, level, techstack, amount, userid } = args;

    if (!role) throw new Error("Role is required");
    if (!type) throw new Error("Interview type is required");
    if (!level) throw new Error("Level is required");
    if (!amount) throw new Error("Amount is required");
    if (!techstack) throw new Error("Tech stack is required");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `
Prepare interview questions.

Role: ${role}
Level: ${level}
Tech Stack: ${techstack}
Interview Type: ${type}
Number of Questions: ${amount}

Rules:
- Generate exactly ${amount} questions.
- Return one question per line.
- Do not return JSON.
- Do not return markdown.
- Do not use code blocks.
- Do not number the questions.
- Return only the questions.
`,
    });

    const parsedQuestions = text
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);

    if (parsedQuestions.length === 0) {
      throw new Error("No questions generated");
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json(
      {
        success: true,
        interviewId: docRef.id,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Interview generation error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      success: true,
      data: "Thank you!",
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}