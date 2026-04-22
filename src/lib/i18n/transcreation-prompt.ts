export interface TranscreationPromptInput {
  locale: "de" | "es" | "ar";
  section:
    | "hero"
    | "about"
    | "projects"
    | "blog"
    | "contact"
    | "cv"
    | "chatbot";
  sourceText: string;
  glossaryExcerpt: string;
  personaMd: string;
  toneCell: string;
}

export type TranscreationSection = TranscreationPromptInput["section"];

export function buildTranscreationPrompt(
  input: TranscreationPromptInput
): string {
  const { locale, section, sourceText, glossaryExcerpt, personaMd, toneCell } =
    input;
  return `You are transcreating content from English into ${locale.toUpperCase()} for the ${section} section of a professional portfolio.

## Brand voice (uniform across all locales)
modern, uncomplicated, friendly, competent.

## Persona for ${locale.toUpperCase()}
${personaMd}

## Tone cell for section=${section}, locale=${locale}
${toneCell}

## Glossary (these terms are LOCKED — render verbatim in the target-locale form, do not paraphrase)
${glossaryExcerpt}

## Rules
1. Preserve every numeric claim, date, proper noun, and metric from the source.
2. Preserve locked glossary terms verbatim.
3. Rewrite framing, verbs, connectives, and sentence structure so the text reads as native-authored in ${locale.toUpperCase()}.
4. Respect the tone cell above — do not import register from a different section.
5. Do not add new claims not present in the source.
6. Return ONLY the transcreated text — no preamble, no explanation.

## Source text
${sourceText}`;
}
