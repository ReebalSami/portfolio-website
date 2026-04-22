import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getChatbotConfig } from "@/lib/config";
import { validateLocale, loadLocaleContext, buildSystemPrompt } from "./route-helpers";

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
  let systemPrompt: string;
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

    // Keep enough conversation history for contextual follow-ups
    messages = messages.slice(-16);

    const locale = validateLocale((body as { locale?: unknown }).locale);
    const contextText = await loadLocaleContext(locale);
    systemPrompt = buildSystemPrompt(locale, `<context>\n${contextText}\n</context>`);
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
    temperature: 0.3,
    maxOutputTokens: chatbotConfig.maxTokens,
  });

  return result.toTextStreamResponse();
}
