---
name: tone-routing
description: Section-aware tone routing for this portfolio's transcreation work. Defines the section × locale tone matrix and how to apply it when authoring or reviewing EN/DE/ES/AR content across Hero, About, Projects, Blog, Contact, CV, and Chatbot sections. Use when writing or regenerating localized content for any section, or when deciding what register a piece of content should use.
---

# Tone Routing (Portfolio-Specific)

## When to invoke

- Before regenerating content for any section in any locale.
- When reviewing a PR that touches `src/messages/*.json`, `config/cv/*.yaml`, or `src/content/*.md`.
- When designing a system prompt for an LLM-driven rewrite of a specific section.
- When the user asks "what register should this section use in [locale]?"

## Prerequisite reading

This skill assumes you already know the brand voice:

**Brand voice (uniform across all locales)**: modern, uncomplicated, friendly, competent. German specifically uses capitalized Du / Dir / Dich (never Sie). Spanish uses informal tú throughout. Arabic uses MSA with Gulf-neutral contemporary business vocabulary (never Classical, never dialect).

If that voice statement is unfamiliar, read `docs/transcreation/personas/` (if it exists) or the project's brand-voice memory before proceeding.

## The matrix

| Section | AR (Gulf, modern-friendly) | ES (Spain-standard + Andalusian warmth, informal tú) | DE (modern Du, capitalized) |
|---|---|---|---|
| **Hero** | Confident, metric-forward. MSA. Short sentences. First-person active verbs (`أبني`, `أجمع`). No Classical flourishes. Vocabulary: like Al-Arabiya Business headlines. | Direct, aspirational. Evocative verbs (`Fusiono`, `Construyo`, `Transformo`). Avoid LATAM anglicisms. | Short, assertive. Present tense. "Ich baue / Ich verbinde" constructions. |
| **About** | Deepest transcreation zone. Narrative arc allowed. One personal detail humanizes. First-person active. Attribute team outcomes where appropriate (Gulf modesty norm). | Warmest zone. Personal cadence, short sentences, anecdote-friendly. "Me dedico a…" constructions work well. Craftsmanship appeal. | Deepest transcreation zone for DE too. Personal, grounded. "Ich komme aus dem X-Bereich und…" openings. |
| **Projects** | Preserve English tech terms (Latin script). Parallel structure for scanning. Quantify with recognizable metrics. No poetic framings. | Spain tech vocabulary ("aprendizaje automático" on first use, "ML" after). Preserve English where standard. | German tech vocabulary ("maschinelles Lernen" on first use, "ML" after). Preserve English for framework names. |
| **Blog** | Match the post subject. Storyteller mode allowed but not default. Longer sentences OK when content warrants. | Andalusian warmth works in personal essays. Technical posts stay clean and direct. | Match post subject. Blog posts tolerate longer sentences than UI copy. |
| **Contact** | Welcoming, not corporate. Use "تواصل معي" / "راسلني". Avoid "يسرني التواصل" (reads stiff). | Informal tú ("Escríbeme"). Warm closer acceptable ("Nos vemos"). | Informal Du ("Schreib mir", "Lass uns reden"). |
| **CV** | MSA, modern-formal. Lock company / tech / metric terms. Paraphrase ONLY framing language. | European Spanish, professional. Gender mostly neutral by surname. Paraphrase framing; lock skills. | Modern professional German with Du where direct-address is needed; otherwise third-person constructions preferred for CV prose. |
| **Chatbot** | MSA with Gulf-neutral business vocabulary. Greeting before dive-in. Language matches the user. | Informal tú default; promote to usted if the user opens with it (respect user's register choice). | Du default; switch to Sie only if the user explicitly writes Sie. |

## Application rules

### 1. Per-section tone IS the tone — don't import a different register

When writing a Hero tagline in Arabic, don't reach for About-zone narrative constructions. When writing CV YAML, don't reach for Blog-zone storytelling. Each cell in the matrix is deliberate.

### 2. ATS sections (Projects + CV) prioritize preservation over polish

For Projects and CV, the English source's structure, tech terms, job titles, and metrics survive transcreation verbatim. Only framing/connective language gets the transcreation pass. The goal is ATS parsers + native-speaker recruiters both extracting the same intent.

### 3. Deepest transcreation is About (all locales) and Blog (when topic allows)

These are the zones where you can walk furthest from the literal English. A reader should feel that this paragraph was WRITTEN in the target language, not translated into it.

### 4. Chatbot respects the user's choice

If the user opens with formal address, the chatbot matches it. If the user uses English, the chatbot responds in English. Never force the brand's default register onto the user's message register.

### 5. One voice across locales — NOT per-locale formality variation

The brand voice is uniform. Don't build a "formal German / informal Spanish" split. Du in German is as modern-friendly as tú in Spanish is as first-person-active Arabic is. They're all the same personality in different phonologies.

## Section detection heuristic (when auto-routing)

When an LLM or script needs to figure out which matrix cell to apply:

- File is `src/messages/*.json` under key `home.hero.*` → Hero row.
- File is `src/messages/*.json` under key `home.about.*` OR `about.*` → About row.
- File is `src/messages/*.json` under key `projects.*` → Projects row.
- File is a blog post under `src/content/blog/*` → Blog row.
- File is `src/messages/*.json` under key `contact.*` OR `footer.*` → Contact row.
- File is `config/cv/*.yaml` OR under `cv/*` keys → CV row.
- File is `src/content/chatbot-context*.md` OR the `/api/chat` system prompt → Chatbot row.

## Anti-patterns

- Don't use the matrix as a "creative writing prompt" — it's a constraint, not inspiration.
- Don't mix section tones in one paragraph (e.g., Hero assertiveness colliding with CV ATS-safety in the same line).
- Don't let a single LLM pass write ALL sections without checking the matrix. Batch the generation by section so each gets its correct register.
- Don't override the matrix because a LLM "wrote something nicer" in a different tone. If it violates the row, rewrite or reject.

## Integration

This skill pairs with:
- `glossary-brandbook` skill — provides locked terms referenced in the ATS-safety rules.
- `transcreation-audit` skill — dimension #2 (register consistency) is checked against THIS matrix.
- `chatbot-multilingual` skill — the Chatbot row is the input to per-locale system prompt construction.
