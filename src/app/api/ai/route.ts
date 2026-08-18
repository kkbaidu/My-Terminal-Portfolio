import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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

/** Pipe an AI SDK v4 textStream directly to a plain text/plain Response. */
function toPlainTextStream(textStream: ReadableStream<string>): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = textStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string; context?: string; systemPrompt?: string };
  const question = body.question?.trim() || "Give me Kingsley's overview.";
  const prompt = buildAIPrompt(question);

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiApiKey) {
    try {
      const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });
      const model = google(process.env.GEMINI_MODEL ?? "gemini-3.6-flash") as any;
      const result = streamText({
        model,
        system: body.systemPrompt ?? prompt.systemPrompt,
        prompt: `Question: ${question}\n\nContext:\n${body.context ?? prompt.context}`,
      });

      return toPlainTextStream(result.textStream);
    } catch (error) {
      console.error("Gemini API error:", error);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = openai(process.env.OPENAI_MODEL ?? "gpt-4.1-mini") as any;
      const result = streamText({
        model,
        system: body.systemPrompt ?? prompt.systemPrompt,
        prompt: `Question: ${question}\n\nContext:\n${body.context ?? prompt.context}`,
      });

      return toPlainTextStream(result.textStream);
    } catch (error) {
      console.error("OpenAI API error:", error);
    }
  }

  return new Response(createFallbackResponse(question, body.context ?? prompt.context), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}