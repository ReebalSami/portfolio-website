# Section × Locale Tone Matrix

> **Source of truth** for register decisions when authoring or reviewing any non-EN content. Overrides default assumptions. Do not substitute your own judgment without checking here.

## Brand voice (binding, all locales)

**modern · uncomplicated · friendly · competent**

- German: `Du/Dir/Dich` (capitalized, never `Sie` unless the user initiates it).
- Spanish: `tú` throughout (Spain-standard; no `usted` except if visitor initiates).
- Arabic: MSA with contemporary Gulf business vocabulary. No Classical Arabic flourishes. No dialect.
- English: unchanged baseline (source of truth).

---

## The matrix

| Section | AR — Gulf, modern MSA | ES — Spain-standard + Andalusian warmth | DE — modern Du |
|---|---|---|---|
| **Hero** | Confident, metric-forward. Short sentences. First-person active verbs: `أبني`, `أجمع`, `أحوّل`. No elaborate openings. Vocabulary: Al-Arabiya Business register. | Direct, aspirational. Evocative verbs: `Fusiono`, `Construyo`, `Transformo`. Avoid LATAM anglicisms (`aplicar` for *apply*). Punchline first. | Short, assertive. Present tense. `Ich baue`, `Ich verbinde`, `Ich transformiere`. No sub-clauses in opening sentence. |
| **About** | **Deepest transcreation zone.** Narrative arc allowed. One personal detail humanizes. Attribute team outcomes where natural — Gulf modesty norm allows `أساهم`, `نجحنا` alongside first-person claims. | **Warmest zone.** Personal cadence, anecdote-friendly. `Me dedico a…`, `Lo que me mueve…` openers work. Craftsmanship and problem-solving appeals resonate in Andalusian context. | **Deepest DE zone.** Personal, grounded. `Ich komme aus dem X-Bereich und…` openings. Concrete before abstract. |
| **Projects** | Preserve English tech terms in Latin script. Parallel scan-friendly structure. Quantify with recognizable metrics (numbers, %, × speedup). No poetic wrapping around tech descriptions. | Spain tech vocabulary: `aprendizaje automático` on first use, `ML` after. `red neuronal`, `modelo de lenguaje`. Preserve English for brand/framework names. Bulleted highlights stay parallel. | German tech vocabulary: `maschinelles Lernen` first use, `ML` after. `neuronales Netz`, `Sprachmodell`. Keep framework names in English. |
| **Blog** | Match the post subject. Storyteller mode *allowed* but NOT default. Longer sentences OK when the content warrants. Avoid dialect even in casual tone. | Andalusian warmth works in personal essays and reflections. Technical posts stay clean and direct — no warmth forced where precision matters. | Match post subject. Longer sentences tolerated more than in UI copy. Personal essays can use first-person narrative comfortably. |
| **Contact** | Welcoming, not corporate. `تواصل معي` / `راسلني` preferred. Avoid `يسرني التواصل` (reads stiff). Greeting implied, not stated. | Informal `tú` default: `Escríbeme`, `Hablamos`, `Cuéntame`. Warm closer acceptable (`Nos vemos`). | Informal `Du`: `Schreib mir`, `Lass uns reden`. Short and direct. |
| **CV** | MSA, modern-formal. Lock all company names, tech names, metrics verbatim. Paraphrase ONLY framing and connective language. Job titles per glossary. ATS parsability is non-negotiable. | European Spanish, professional. `Ingeniero de IA`, `Científico de Datos`. Gender is mostly resolved by name context. Paraphrase framing; lock skills. | Modern professional. `Du` only appears where direct address is needed (rare in CV prose). Third-person or nominalized constructions preferred for accomplishment bullets. |
| **Chatbot** | MSA with Gulf-neutral business vocabulary. Greeting-before-dive-in convention. Respond in user's language. If user code-switches (Arabic + English tech terms), follow their lead. | `tú` default; mirror to `usted` if visitor opens with it. Spain-register baseline, not LATAM. | `Du` default; mirror to `Sie` if visitor opens with it. |

---

## Application rules

### 1. Per-section tone is the tone — don't cross sections

Writing a hero tagline in Arabic means using the Hero cell, not the About cell's narrative mode. Each cell is a deliberate constraint, not a suggestion.

### 2. ATS zones (Projects + CV) prioritize preservation over polish

For Projects and CV: tech terms, job titles, company names, and metrics from the EN source survive verbatim (per the glossary). Only framing and connective language gets the transcreation pass. The goal: ATS parsers AND human recruiters extract the same intent.

### 3. About (all locales) and Blog (when topic allows) are deepest transcreation zones

Walk furthest from the literal English here. The reader should feel this was written in the target language, not translated into it.

### 4. Chatbot respects the visitor's choice

If the visitor opens with formal address, mirror it. If they write English, respond in English. The brand default register is not forced over the visitor's opening register.

### 5. One voice across locales — NOT a formal/informal split

`Du` in German is as modern-friendly as `tú` in Spanish is as first-person-active Arabic. The same personality across all three phonologies. Don't introduce per-locale formality splits not specified here.

---

## Section detection heuristic (for tooling / generation scripts)

| File / key pattern | Matrix row |
|---|---|
| `src/messages/*.json` → `home.hero.*` | Hero |
| `src/messages/*.json` → `about.*` or `home.about.*` | About |
| `src/messages/*.json` → `projects.*` | Projects |
| `src/content/blog/*` | Blog |
| `src/messages/*.json` → `contact.*` or `footer.*` | Contact |
| `config/cv/*.yaml` or `src/messages/*.json` → `cv.*` | CV |
| `src/content/chatbot-context*.md` or `/api/chat` system prompt | Chatbot |

---

## Anti-patterns

- Using About narrative in a Hero tagline (too long, wrong energy).
- Using CV ATS discipline in a Blog post (too terse, reads like a bullet list).
- Applying EN ghost-writing rule constraints verbatim to AR without checking `ghost-writing-locales.md` overrides.
- Generating all sections in one LLM pass — the model will drift register across sections. Batch by section.
