import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import fs from "node:fs";
import path from "node:path";
import { getChatbotConfig } from "@/lib/config";

// ---------------------------------------------------------------------------
// Rate limiter — simple in-memory per IP (resets on cold start)
// ---------------------------------------------------------------------------
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

// ---------------------------------------------------------------------------
// Context document (loaded once at module level)
// ---------------------------------------------------------------------------
const contextPath = path.resolve(
  process.cwd(),
  "src/content/chatbot-context.md"
);
const context = fs.readFileSync(contextPath, "utf-8");

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const systemPrompt = `You are an AI assistant on Reebal Sami's portfolio website. Answer based ONLY on the provided context below. Be helpful, concise, and professional.

If the user asks something not covered in the context, say: "I don't have that information, but you can reach Reebal at contact@reebal-sami.com."

Respond in the same language the user writes in. For example, if they write in German, respond in German; if Arabic, respond in Arabic.

<context>
${context}
</context>`;

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const chatbotConfig = getChatbotConfig();

  // Check API key
  const apiKey = process.env[chatbotConfig.apiKeyEnvVar];
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chatbot not configured" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const { maxRequests, windowSeconds } = chatbotConfig.rateLimit;

  if (isRateLimited(ip, maxRequests, windowSeconds * 1000)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and sanitize input
  let messages: { role: string; content: string }[];
  try {
    const body = await request.json();
    messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize: trim, cap length, strip any system role from user input
    messages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: String(m.content).trim().slice(0, 1000),
      }));

    // Keep only last 10 messages to limit context window
    messages = messages.slice(-10);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream response via Vercel AI SDK
  const provider = createOpenAI({ apiKey });
  const result = streamText({
    model: provider(chatbotConfig.model),
    system: systemPrompt,
    messages: messages as Array<{ role: "user" | "assistant"; content: string }>,
    maxOutputTokens: chatbotConfig.maxTokens,
  });

  return result.toTextStreamResponse();
}
