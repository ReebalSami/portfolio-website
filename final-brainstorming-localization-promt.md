# Final Brainstorming — Localization & Transcreation (AR + ES, DE secondary)

> **Destination**: After approval, this document is to be copied to `final-brainstorming-localization-promt.md` at the project root (`/Users/reebal/Projects/portfolio-website/`) so the next Claude Code / Opus 4.7 session can turn it into a concrete implementation plan.
> **Note on filename**: the user's prompt used the spelling `final-brainstorming-localization-promt.md` (with "promt"). Preserved verbatim to avoid breaking any scripts/references.

---

## Context

The portfolio has a solid i18n foundation (next-intl, 4 locales, RTL Arabic, 1:1 key parity across 156 keys per locale file, inline locale maps in CV YAML). The problem is **not coverage** — it is **quality ceiling**. The existing AR/ES/DE content reads like careful machine-assisted translation, not native authorship. Simultaneously, the chatbot is structurally blind to locale (single English system prompt, English-only `chatbot-context.md`, frontend never transmits locale to `/api/chat`).

Target audiences are narrow and specific:
- **Arabic**: Gulf hiring managers (KSA/UAE/Qatar), medium baseline register, high-expressive only when context warrants.
- **Spanish**: Andalusia-based (Málaga, Granada, Sevilla, Cádiz), Spain-professional standard with local warmth.
- **German**: Hamburg / DACH; already present, lower priority, but has a latent register mismatch (formal `Sie` vs. Spanish informal `tú`) worth resolving.

The English source stays frozen. The deliverable of the next session is a transcreation system that respects ATS, preserves factual claims, keeps a coherent personal brand voice, and improves chatbot conversation quality per locale.

---

## Direction 0 — Before you build, consider buying

Treat this as a **gating decision** before committing to an in-house system.

A specialist human-led transcreation pass by an agency (e.g., MotaWord Pro, Gengo Pro, or a boutique MENA/Spain specialist) would cost roughly **€500–€2,000** for the full portfolio + CV YAML + chatbot-context files. That is:

- Two weeks faster than a DIY rewrite loop.
- Higher native-feel ceiling than any current AI pass.
- Delivers a translation-memory artefact that can feed future updates.
- Zero chance of Arabic calques like "مدموجة مع" sneaking through.

**Why not default to this?** Three reasons that might tip to DIY:
1. The content is tightly bound to a single person's voice — agencies often over-neutralize.
2. The user wants the transcreation system as a reusable capability (CV is a living document, chatbot is dynamic).
3. Cost vs. stage: if no active job search is happening, agency spend is premature.

**Contrarian check in the other direction**: if the only purpose of this work is *this portfolio today*, DIY is over-engineered and the agency route wins clearly.

**Recommendation**: Decide this first in the next session. If DIY wins, the rest of this document applies. If agency wins, most of the tooling roadmap collapses — what remains is glossary authoring (for the agency brief), a chatbot persona policy (still DIY), and the QA gate (still DIY). **Do not skip this call.**

---

## Strategic Directions (if DIY)

### D1 — Native Author Simulation
Rewrite each locale's content as if a native speaker in the target market wrote it from scratch, using English as *source material*, not template.
- **Pros**: Highest quality ceiling; breaks free of calque structure.
- **Cons**: Highest factual-drift risk; hardest to audit; expensive per pass.
- **Fits**: Hero, About, Blog. Bad fit for CV / Projects where preservation matters.

### D2 — Section-Aware Tone Matrix
Build a grid: `section × locale × tone`. Hero/About get deepest transcreation. Projects/CV get preservation-first translation. Contact gets warmth-calibrated balance.
- **Pros**: Surgical; matches what the user already intuited; pairs well with ATS goals.
- **Cons**: Requires discipline at authoring + review time; without persona definitions, each section can drift into a different voice.

### D3 — Persona-Led Voice Architecture
Define 2–3 explicit "voice personas" per language (e.g., *Gulf analytical*, *Andalusian warm colleague*, *Hamburg precise advisor*), then route content through them at section granularity.
- **Pros**: Highest coherence across a locale; easy to brief future collaborators / LLMs.
- **Cons**: Requires upfront authoring work; if personas are badly defined, they become creative handcuffs.

### Recommendation — D2 + D3 hybrid, with Direction 0 gate

Combine section-aware routing (**what** register per slot) with persona-led voicing (**how** it sounds when it lands there), bounded by a **glossary of locked terms** (brand, tech, job titles, metrics). Reject pure D1 — too much factual-drift risk for a CV-bearing portfolio.

---

## Section-Level Tone Hypotheses

| Section | AR (Gulf, medium) | ES (Spain-standard + Andalusian warmth) |
|---|---|---|
| **Hero** | Confident, metric-forward. MSA. Short. No classical flourishes. Reads like Al-Arabiya Business headline. | Direct, aspirational. Evocative verbs ("Fusionar", "Construir"). Avoid LATAM anglicisms ("aplicar" for *apply*). |
| **About** | Deepest transcreation zone. Narrative arc allowed. One human detail. Attribute team outcomes where appropriate (modesty norm). First-person active verbs ("أبني"). | Warmest zone. Personal cadence. Craftsmanship appeal. "Me dedico a…" constructions. Can breathe. |
| **Projects** | Preserve English tech terms. Parallel structure for scanning. Quantify. Avoid poetic framings. | Spain tech vocabulary ("aprendizaje automático", "red neuronal"). Preserve English where standard ("LLM", "GraphRAG"). |
| **Blog** | Match the post subject. Storyteller mode *allowed* but not default. Longer sentences OK. | Andalusian warmth works in personal essays; technical posts stay clean. |
| **Contact** | Welcoming but not ornate. "تواصل معي" / "راسلني". Avoid "يسرني التواصل" (too corporate). | Informal `tú` default ("Escríbeme"). Warm closer acceptable. |
| **CV** | MSA, modern formal. Lock company names, tech names, metrics. Paraphrase only framing language. | European Spanish, formal-professional. "Ingeniero de IA". Gender mostly neutral by surname. |
| **Chatbot** | MSA with Gulf-neutral business vocabulary. No dialect. Respect greeting-before-dive-in convention. | `tú` default, promote to `usted` if user opens with it (code-switch-aware). |

**Key insight**: The deepest transcreation zone is **About + Blog**. CV and Projects demand a *translation-forward* discipline with transcreative polish only at framing level. Collapsing those zones into one rule is the existing mistake.

---

## Risks & Failure Modes (top 6, ranked)

1. **ATS keyword damage** — Creative paraphrasing of job titles, tech stack, company names destroys keyword recall. *Mitigation*: locked glossary, DOM order preserved, verified by extraction test.
2. **Credibility collapse in Gulf market** — Over-expressive Arabic (Classical flourishes, literary metaphor) reads as suspicious in business CV context. Gulf recruiters expect precision + measurable outcomes. *Mitigation*: medium baseline as user specified; treat Variant A (polished MSA) as default, not aspirational.
3. **Factual drift from transcreation** — "Reduced inference time 30%" becomes "dramatically improved" when over-creatively rewritten. *Mitigation*: quantitative claims locked verbatim; transcreate framing only.
4. **Inconsistency across sections** — Different AI prompts generate different voices; readers feel the portfolio was assembled, not authored. *Mitigation*: persona definitions + glossary + single model/temperature per pass.
5. **Chatbot persona breaks across turns** — Model drifts without explicit instructions, especially on code-switched input (user writes AR mixed with English tech terms). *Mitigation*: locale-routed system prompts + few-shot examples + explicit language-detection instruction.
6. **Register mismatch between locales** — DE formal `Sie`, ES informal `tú`, AR modern-formal creates an inconsistent brand tone across the portfolio. Currently present. *Mitigation*: deliberate choice documented per locale; decide whether to relax DE or tighten ES (likely: leave DE formal as Hamburg norm; leave ES informal as Andalusian norm; document why).

---

## Alternative Framings

### Arabic storyteller style — variants

- **Variant A (Polished MSA, baseline)**: HBR-Arabic / Raseef22 long-form register. Short sentences, concrete verbs, contemporary vocabulary. No "أما بعد", no elaborate muqaddimaat. No dialect.
- **Variant B (Contemporary Gulf Business)**: Slightly warmer; natural code-switching for tech brand names only (GraphRAG, LLM, ViT kept as-is). For Projects/CV.
- **Variant C (Reflective Long-Form)**: Blog-only, when a post warrants cadence (philosophical/ethical reflection). Never in Hero/About/CV.

**Recommendation**: A as baseline across the site. B for Projects/CV. C is a specific opt-in per eligible blog post.

### Andalusian Spanish — variants

- **Variant A (Spain Professional Standard, baseline)**: El País / El Mundo business-section register. Avoid LATAM tech vocabulary. `tú` in casual interaction, `usted` acceptable in CV-facing contexts.
- **Variant B (Mediterranean Warmth, selective phrasing)**: Conversational openers ("Siempre me ha fascinado…"); warm closers ("Nos vemos por aquí"). Metaphors from craft / light / sea — resonates with Andalusian cultural identity without dialectal markers.
- **Variant C (Technical Precision)**: For Projects/CV. Preserves English terms where standard.

**Recommendation**: A + B for Home/About/Contact; A + C for Projects/CV.

---

## Contrarian Checks (the 4 that change the plan)

1. **"The chatbot isn't worth localizing — check usage first."** Exploration confirmed there is **no per-chatbot analytics event wiring**. If chatbot conversation count is low, rework there is low-ROI. *Action*: grep/verify telemetry before committing chatbot work to P1.
2. **"`ghost-writing.md` rules don't apply verbatim to AR/ES."** The existing rule (English-focused) forbids hedging, friendly closers, meta-signposting. Gulf Arabic business register often uses respectful soft openers/closers that *read as* "friendly closer / hedging" under this rule. Treating the rule as universal is a silent anti-native bias. *Action*: decide if the rule applies per-locale, or gets a per-locale override clause.
3. **"Andalusia is too specific."** Correct on substance. Shift framing to "**Spain-standard with Andalusian warmth in specific phrases**", not "Andalusian Spanish". The user's own phrasing already implies this — make it explicit in the plan.
4. **"GPT-4o-mini is fine for runtime chatbot but wrong for transcreation generation."** Transcreation requires top-tier reasoning + idiomatic range. Use **Claude Opus 4.7** (or GPT-5-level) for the initial generation pass; keep `gpt-4o-mini` for chatbot runtime (latency + cost). The repo currently has no `@anthropic-ai/sdk` dependency — adding it for local-dev generation scripts is cheap.

---

## Tooling — Have / Add / Research

### Already in place (verified)
- next-intl 4.x wired across 4 locales, RTL Arabic, logical CSS properties.
- `src/i18n/` routing + request; middleware locale detection.
- CV YAML with inline locale maps — good base for glossary.
- `context7` MCP (library docs), `chrome-devtools` MCP (RTL visual verification).
- `superpowers` plugin (brainstorming, writing-plans, executing-plans, worktrees).
- Vercel AI SDK with OpenAI binding.
- `.windsurf/rules/i18n-from-start.md`, `cv-ats-safe.md`, `cv-spacing-ats-safe.md`, `ghost-writing.md`.
- Bewerbung/ corpus (30+ German cover letters) — usable reference corpus for German tone calibration.

### Add (new)
- **`skill-26-transcreation-audit`** — AR/ES/DE quality audit (fluency, calque detection, register consistency, ATS survival, factual drift).
- **`skill-27-tone-routing`** — section × locale × tone matrix with executable mapping helpers.
- **`skill-28-chatbot-multilingual`** — locale personas + per-locale system prompts + locale-aware context loading.
- **`skill-29-glossary-brandbook`** — locked terminology catalog (brand, tech, job titles, metrics) with drift checker.
- **Rules**: `transcreation-audit.md`, `tone-routing-per-section.md`, `ats-keyword-preservation.md`, `chatbot-persona-multilingual.md`, `ghost-writing-locales.md` (overrides per locale).
- **Workflows**: `transcreation-review.md` (AI pass → glossary check → ATS verify → self-review → optional native gate), `chatbot-context-translate.md`.
- **Hooks** (via `.claude/settings.json`):
  - pre-commit: key-parity check across `src/messages/*.json`
  - pre-commit: glossary-drift detector (locked terms appear consistent across all locale files)
  - pre-push: ATS extraction smoke test on CV output
- **Dependency**: `@anthropic-ai/sdk` for the dev-time transcreation generation script (Opus 4.7).
- **Locale-aware chatbot**: pass `locale` from `ChatWidget` → `/api/chat`; load `chatbot-context-{locale}.md` with fallback to EN; select system prompt per locale.

### Research / uncertain (flag, don't commit)
- Translation-memory MCP — unknown availability in community marketplace as of April 2026. Worth a short search pass.
- Grammar/style MCP for Arabic — ecosystem is weak; LanguageTool covers ES/DE but AR is thin.
- Analytics MCP or lightweight chatbot telemetry (even a simple events table on Plausible) — required before committing P1 priority to chatbot.

---

## Open Questions (top 5, chosen for impact)

1. **Build vs. buy**: Does the user want to hire a specialist agency for the rewrite pass (Direction 0), or commit to the DIY transcreation system?
2. **Chatbot usage signal**: Is there any telemetry showing whether the chatbot is actually engaged (especially by AR/ES visitors)? If not, is it worth adding 1-week of analytics wiring *before* deciding the chatbot's priority tier?
3. **`ghost-writing.md` scope**: Does the existing "no friendly closers / no hedging" rule apply verbatim across locales, or does each locale (especially AR Gulf) get an override? This is an unresolved policy question that will bite during the rewrite.
4. **Native speaker review window**: The user said "AI-only for now." What triggers the move to native-speaker QA — an upcoming job search, a specific date, a quality-bar event? The whole pipeline is shaped differently if native QA will *never* be in the loop.
5. **Model budget for transcreation generation**: Is an Anthropic API key available and budgeted for Opus 4.7 passes on ~15k words of content? Approximate cost: low double-digit USD. If no, fallback is `gpt-4o` (not mini) or DeepSeek-R1 — worse but adequate.

---

## Priorities (first / second / third, not an execution sequence)

### First — foundation before any rewriting
- Gate on Direction 0 decision (build vs. buy).
- Author the **locked glossary** (brand, tech, job titles, metrics) — the artefact that protects ATS and stops terminology drift.
- Write the **section × locale × tone matrix** as an explicit document (source of truth for all future prompts and reviews).
- Decide the `ghost-writing.md` scope question (locale overrides vs. universal).
- Add minimal chatbot telemetry OR confirm existing telemetry answers the "is it used" question.

### Second — implementation pass
- Per-locale `chatbot-context-{locale}.md` (AR, ES, DE) aligned to the glossary.
- Transmit `locale` from `ChatWidget` → `/api/chat`; build per-locale system prompts with persona + Gulf/Andalusian/Hamburg calibration + language-handling instruction.
- Transcreation rewrite pass on `src/messages/ar.json`, `src/messages/es.json` — section by section, guided by matrix + personas, generated with Opus 4.7.
- CV YAML second pass — field-by-field, preserving locked terms, polishing framing.
- Optional: German register audit — is the current formal `Sie` intentional? Document the decision.

### Third — QA, hardening, measurement
- Pre-commit key-parity + glossary-drift hooks.
- Chrome DevTools MCP-driven RTL visual verification across Hero/About/Projects/CV in Arabic.
- ATS extraction smoke test on all 4 CV locales across all 4 themes.
- AI-based second-opinion audit pass (different model than generation — if Opus generated, let Sonnet 4.6 audit).
- Telemetry dashboard (or simple log) for chatbot language of interaction + conversation length.

---

## Recommended Approach for Next Planning Session

Assume Direction 0 resolves to "build" (if it resolves to "buy", most of this collapses).

1. **Glossary first**: author `config/i18n/glossary.yaml` with locked brand/tech/title/metric terms across 4 locales. This is the smallest durable artefact that de-risks everything downstream.
2. **Matrix second**: write `docs/transcreation/tone-matrix.md` — section × locale × tone with persona references.
3. **Personas third**: `docs/transcreation/personas/{ar,es,de}.md` — voice description, vocabulary bias, forbidden patterns, example paragraphs. These become the raw material for per-locale system prompts.
4. **Chatbot wiring fourth**: small PR adding `locale` transmission, locale-specific context loader, per-locale system prompt; gated behind the usage-signal decision.
5. **Rewrite fifth**: Opus 4.7 dev-time scripts per section (Hero/About/Projects/Blog/Contact/CV), reading the glossary + matrix + persona as context. Output goes to PR, diffed against current locale file, human-reviewed (even in "AI-only" mode this means Reebal reviews the diff himself).
6. **QA sixth**: Sonnet 4.6 audit pass on the rewritten content. Hooks added. Visual RTL tests run.
7. **Ship**: Merge, monitor telemetry, iterate.

**Model plan**: Opus 4.7 (generation + planning), Sonnet 4.6 (audit + implementation tickets), GPT-4o-mini (chatbot runtime — unchanged), advisor (Opus) when stuck. Reebal's stated model workflow is preserved.

---

## Closing Note

The most surprising discovery from the audit phase is that the portfolio's **structural i18n is already excellent** (key parity, CV YAML locale maps, RTL layout, font swapping). The weakness is **entirely at the semantic/voice layer** — and the chatbot layer, which is still locale-blind. That reframes the work from "fix the translations" to "install a transcreation system on top of a clean i18n foundation" — a smaller, more leveraged intervention than a rip-and-replace rewrite.

The sequencing choice that matters most: **glossary before rewrite**. Every other shortcut is survivable; skipping the glossary means re-running the rewrite every time a job title or tech name gets edited. It's the one artefact that compounds.
