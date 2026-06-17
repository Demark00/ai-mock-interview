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
    console.log("========== VAPI REQUEST START ==========");

    const body = await request.json();

    const args = body?.message?.toolCalls?.[0]?.function?.arguments ?? body;

    if (!args) {
      throw new Error("Tool arguments not found");
    }

    const { type, role, level, techstack, amount, userid } = args;

    console.log("RAW BODY:", JSON.stringify(body, null, 2));

    console.log("EXTRACTED VALUES:", {
      role,
      type,
      level,
      amount,
      techstack,
      userid,
    });

    if (!role) throw new Error(`Missing role. Body: ${JSON.stringify(body)}`);

    if (!type) throw new Error(`Missing type. Body: ${JSON.stringify(body)}`);

    if (!level) throw new Error(`Missing level. Body: ${JSON.stringify(body)}`);

    if (!amount)
      throw new Error(`Missing amount. Body: ${JSON.stringify(body)}`);

    if (!techstack)
      throw new Error(`Missing techstack. Body: ${JSON.stringify(body)}`);

    console.log("API Key Exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `
Prepare questions for a job interview.

The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.

Please return only the questions.

Return the questions formatted exactly like:

["Question 1", "Question 2", "Question 3"]
      `,
    });

    console.log("RAW GEMINI RESPONSE:", questions);

    let parsedQuestions;

    try {
      parsedQuestions = JSON.parse(questions);

      console.log("PARSED QUESTIONS:", parsedQuestions);
    } catch (parseError) {
      console.error("QUESTION PARSE ERROR:", parseError);

      throw new Error(`Failed to parse Gemini response: ${questions}`);
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("INTERVIEW OBJECT:", JSON.stringify(interview, null, 2));

    const docRef = await db.collection("interviews").add(interview);

    console.log("FIRESTORE DOC CREATED:", docRef.id);

    console.log("========== SUCCESS ==========");

    return Response.json(
      {
        success: true,
        interviewId: docRef.id,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: corsHeaders,
      },
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
    },
  );
}
