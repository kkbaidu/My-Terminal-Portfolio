import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

import { buildAIPrompt } from "@/lib/commands";

function createFallbackResponse(question: string, context: string) {
  const answer = [
    `Kingsley is a software engineer focused on full-stack, AI, cloud, and mobile delivery.`,
    `Question: ${question}`,
    `Relevant context:`,
    context,
    `He builds product-minded systems with clean architecture, fast UX, and production reliability.`,
  ].join("\n\n");

  return new ReadableStream({
    async start(controller) {
      for (const chunk of answer.match(/.{1,24}/g) ?? [answer]) {
        controller.enqueue(new TextEncoder().encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string; context?: string; systemPrompt?: string };
  const question = body.question?.trim() || "Give me Kingsley's overview.";
  const prompt = buildAIPrompt(question);

  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = openai(process.env.OPENAI_MODEL ?? "gpt-4.1-mini") as any;
    const result = streamText({
      model,
      system: body.systemPrompt ?? prompt.systemPrompt,
      prompt: `Question: ${question}\n\nContext:\n${body.context ?? prompt.context}`,
    });

    return result.toTextStreamResponse();
  }

  return new Response(createFallbackResponse(question, body.context ?? prompt.context), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}