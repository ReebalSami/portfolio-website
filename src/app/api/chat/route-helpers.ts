import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Locale validation
// ---------------------------------------------------------------------------

export type Locale = "en" | "de" | "es" | "ar";
const VALID: ReadonlySet<Locale> = new Set(["en", "de", "es", "ar"]);

export function validateLocale(value: unknown): Locale {
  if (typeof value === "string" && VALID.has(value as Locale)) {
    return value as Locale;
  }
  return "en";
}

// ---------------------------------------------------------------------------
// Context loader — falls back to EN file when locale-specific file is absent
// ---------------------------------------------------------------------------

export async function loadLocaleContext(
  locale: Locale,
  baseDir?: string
): Promise<string> {
  const dir = baseDir ?? path.resolve(process.cwd(), "src/content");
  const primary = path.join(dir, `chatbot-context.${locale}.md`);
  const fallback = path.join(dir, "chatbot-context.md");
  try {
    return await fs.promises.readFile(primary, "utf-8");
  } catch {
    return await fs.promises.readFile(fallback, "utf-8");
  }
}

// ---------------------------------------------------------------------------
// System prompt builder — locale-specific personas, grounding, language rules
// ---------------------------------------------------------------------------

const PERSONAS: Record<Locale, string> = {
  en: `You are Reebal's personal assistant. Your tone: modern, uncomplicated, friendly, competent. Speak in clear English with short sentences and concrete examples.`,
  de: `Du bist Reebals persönlicher Assistent. Dein Ton: modern, unkompliziert, freundlich, kompetent. Du sprichst Deutsch in der Du-Form mit großem D (Du, Dir, Dich). Verwende niemals die Höflichkeitsform, außer der Nutzer verwendet sie zuerst.`,
  es: `Eres el asistente personal de Reebal. Tu tono: moderno, directo, amigable, competente. Hablas en español de España con calidez andaluza. Prefiere el túteo al registro formal; nunca uses usted salvo que el usuario lo emplee primero.`,
  ar: `أنت مساعد رئبال الشخصي. نبرتك: عصرية، مباشرة، ودودة، متمكنة. تتحدث بالعربية الفصحى الحديثة بمفردات الأعمال الخليجية. لا تستخدم اللهجات. لا تستخدم الفصحى الكلاسيكية الأدبية.`,
};

const GROUNDING: Record<Locale, string> = {
  en: `Ground responses in the context below. If a question is not covered, say so and suggest contacting Reebal directly. Do not fabricate details.`,
  de: `Stütze Antworten auf den Kontext. Wenn nicht abgedeckt, sag das und schlage vor, Reebal direkt zu kontaktieren. Keine Erfindungen.`,
  es: `Basa las respuestas en el contexto. Si no está cubierto, dilo y sugiere contactar con Reebal directamente. No inventes.`,
  ar: `استند في ردودك إلى السياق أدناه. إذا لم يغطِّ السياق السؤال، وضّح ذلك واقترح التواصل المباشر مع رئبال. لا تلفّق.`,
};

const LANGUAGE_RULE: Record<Locale, string> = {
  en: `Respond in the user's language. If they mix languages, respond primarily in EN.`,
  de: `Antworte in der Sprache des Nutzers. Bei Sprachmischung primär in Deutsch.`,
  es: `Responde en el idioma del usuario. Si mezcla idiomas, responde principalmente en español.`,
  ar: `أجب بلغة المستخدم. إذا خلط اللغات، فأجب أساساً بالعربية.`,
};

export function buildSystemPrompt(locale: Locale, context: string): string {
  return `${PERSONAS[locale]}

${GROUNDING[locale]}

${LANGUAGE_RULE[locale]}

${context}`;
}
