import { streamText, UIMessage, stepCountIs, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { headers } from "next/headers";
import { getOrder, getOrdersByEmail, cancelOrder } from "@/lib/tools/orderTools";
import { searchProducts, getProductDetails } from "@/lib/tools/productTools";
import { initiateReturn, getReturnStatus } from "@/lib/tools/returnTools";
import { rateLimit } from "@/lib/rate-limit";
import { readFileSync } from "fs";
import { join } from "path";

const systemPrompt = readFileSync(
  join(process.cwd(), "src/lib/prompts/system-prompt.md"),
  "utf-8"
);

const fewShotExamples = readFileSync(
  join(process.cwd(), "src/lib/prompts/few-shot-examples.md"),
  "utf-8"
);

const MAX_MESSAGES = 20;
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
);

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z
    .array(z.object({ type: z.string() }).passthrough())
    .max(50)
    .refine(
      (parts) =>
        parts
          .filter((p) => p.type === "text")
          .every((p) => typeof p.text === "string" && p.text.length <= 2000),
      { message: "Text parts must be strings under 2000 characters" }
    ),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
});

function jsonError(message: string, status: number, extra?: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

export async function POST(req: Request) {
  // Origin validation — reject cross-origin requests
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonError("Forbidden.", 403);
  }

  // Rate limiting
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const { success, remaining } = rateLimit(ip);
  if (!success) {
    return jsonError("Too many requests. Please wait a moment.", 429, {
      "Retry-After": "60",
    });
  }

  // Input validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request body.", 400);
  }

  const { messages } = parsed.data;

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `${systemPrompt}\n\n${fewShotExamples}`,
      messages: await convertToModelMessages(messages as UIMessage[]),
      tools: {
        getOrder,
        getOrdersByEmail,
        cancelOrder,
        searchProducts,
        getProductDetails,
        initiateReturn,
        getReturnStatus,
      },
      stopWhen: stepCountIs(8),
    });

    return result.toUIMessageStreamResponse({
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch {
    // Don't leak internal errors to the client
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
