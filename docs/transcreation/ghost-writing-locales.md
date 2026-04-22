# Ghost-Writing Per-Locale Overrides

> This document overrides or extends `.windsurf/rules/ghost-writing.md` (the English-centric ghost-writing rule) for Arabic, Spanish, and German content. The EN rule remains the default for English. For each non-EN locale, check this document to see which EN constraints apply verbatim, which are adapted, and which are explicitly overridden.

## English rule summary (for reference)

The `.windsurf/rules/ghost-writing.md` rule forbids these patterns:
1. Em-dashes everywhere (one per paragraph max)
2. Friendly closers ("I hope this helps", "Happy to clarify")
3. Balanced poetic rhythm (artificially alternating short/long)
4. Meta-signposting ("First we will", "Next", "Finally")
5. Academic transitions ("Furthermore", "Moreover", "Additionally")
6. Three-item lists padded for rhythm
7. Hedging fillers ("perhaps", "could potentially")
8. Over-qualifying ("It is important to note that")
9. Rhetorical flourishes ("In today's fast-paced world")

The EN rule applies to: blog posts, CV profile summaries, About section text, long-form project descriptions.

---

## Arabic (AR) — Gulf modern MSA

### Applies verbatim (same prohibition as EN)
- **Rule 3 (Artificial rhythm)**: Artificially balanced rhythm reads just as mechanical in Arabic.
- **Rule 4 (Meta-signposting)**: "أولاً... ثانياً... وأخيراً" in non-list contexts is as stilted in Arabic as in English. Exception: numbered CV bullets are fine.
- **Rule 6 (Padded three-item lists)**: Same as EN — cut the filler third.
- **Rule 7 (Hedging fillers)**: "ربما" / "قد يكون" / "من المحتمل أن" used as fillers — forbidden.
- **Rule 8 (Over-qualifying)**: "تجدر الإشارة إلى أن" — forbidden.
- **Rule 9 (Rhetorical flourishes)**: "في ظل التطور المتسارع" / "في عالم اليوم المتغير" — forbidden.

### Adapted
- **Rule 1 (Em-dashes)**: Arabic prose does not conventionally use em-dashes. Use **clause separation with "—" (em-dash)** sparingly (once per paragraph max), or prefer a semicolon/period. The dash IS allowed in hero taglines for structural breath — this is a modern Arabic digital convention.
- **Rule 5 (Academic transitions)**: "علاوة على ذلك" / "بالإضافة إلى ذلك" are forbidden as filler transitions. However, "وهذا يعني أن..." and "لذلك..." are natural Arabic connectives, not academic padding — they are ALLOWED.

### Overridden (EN rule does NOT apply to AR)
- **Rule 2 (Friendly closers)**: Gulf Arabic business context ALLOWS and EXPECTS respectful soft openers and closers in Contact, About, and Blog sections. These are not "AI writing tells" in Arabic — they are a cultural courtesy that reads as genuine. Examples of ALLOWED patterns:
  - Contact: "يسعدني التواصل معك" (formal version — still acceptable), "راسلني مباشرةً" (preferred)
  - About: A brief respectful intro sentence is allowed if it sets context, not if it is decorative
  - Blog: Can open with a reflective question or observation that would read as "signposting" in EN but is natural in Arabic long-form
  - **STILL FORBIDDEN** in Projects and CV sections: the ATS-safety zone has no room for openers

---

## Spanish (ES) — Spain-standard + Andalusian warmth

### Applies verbatim (same prohibition as EN)
- **Rule 3 (Artificial rhythm)**: Same prohibition. Short uneven sentences are the goal.
- **Rule 4 (Meta-signposting)**: "Primero... Luego... Finalmente" in prose — forbidden. Numbered lists OK.
- **Rule 6 (Padded three-item lists)**: Cut the third if it is filler.
- **Rule 7 (Hedging fillers)**: "podría llegar a ser", "cabe la posibilidad de" — forbidden.
- **Rule 8 (Over-qualifying)**: "Cabe destacar que", "Es importante mencionar que" — forbidden.
- **Rule 9 (Rhetorical flourishes)**: "En el dinámico mundo de la tecnología actual" — forbidden.

### Adapted
- **Rule 1 (Em-dashes)**: Spanish uses `—` (em-dash) as a natural sentence-level breath. One per paragraph max, same as EN, but the dash is more stylistically native in Spanish than in English — don't over-restrict it.
- **Rule 5 (Academic transitions)**: "Además", "Por otro lado" are clichés in Spain-standard professional writing and should be replaced with "y", "también", or a new sentence. Exception: "sin embargo" is a natural contrast marker, not academic padding — ALLOWED.

### Overridden (EN rule does NOT apply to ES)
- **Rule 2 (Friendly closers)**: Spain and especially Andalusia value **human warmth in professional contexts**. The EN prohibition on "friendly closers" was designed for EN where closers like "I hope this helps" read as robotic. In Spain-standard Spanish:
  - Contact: "Nos vemos por aquí", "Cuéntame en qué puedo ayudarte" — ALLOWED (warm, human, not robotic)
  - About: A sentence acknowledging the reader can close a paragraph — "Eso es lo que me hace diferente, y me gustaría contártelo" — ALLOWED in About
  - Blog: Warm conversational closers to posts — ALLOWED
  - **STILL FORBIDDEN** in Projects and CV: professional precision zone, no closers

---

## German (DE) — Modern Du-form

### Applies verbatim (same prohibition as EN)
- **Rule 3 (Artificial rhythm)**: Same. German readers notice mechanical sentence padding.
- **Rule 4 (Meta-signposting)**: "Erstens... zweitens... drittens" in prose — forbidden. Lists OK.
- **Rule 6 (Padded three-item lists)**: Same as EN.
- **Rule 7 (Hedging)**: "könnte möglicherweise", "eventuell" as fillers — forbidden.
- **Rule 8 (Over-qualifying)**: "Es sei darauf hingewiesen, dass" — forbidden.
- **Rule 9 (Rhetorical flourishes)**: "In der heutigen schnelllebigen Welt" — forbidden.

### Adapted
- **Rule 1 (Em-dashes)**: German prose naturally uses `—` for parenthetical clauses and breath. Use it exactly once per paragraph max, same as EN. Don't suppress it entirely — it can carry the sentence rhythm well in hero taglines.
- **Rule 5 (Academic transitions)**: "Außerdem", "Darüber hinaus" as padding — forbidden. But "Deshalb", "Daher", "Denn" are natural German logical connectives — ALLOWED.

### Overridden (EN rule does NOT apply to DE)
- **Rule 2 (Friendly closers)**: Du-form German professional communication CAN include a warm, personal sentence at the end of Contact and About text. This is not a "friendly closer" AI tell — it is appropriate register for the Du-form relationship:
  - Contact: "Schreib mir — ich antworte." — ALLOWED (direct, warm)
  - About: Ending with a concrete invitation — "Das ist die Art zu arbeiten, die mich antreibt." — ALLOWED (personal without being sentimental)
  - **STILL FORBIDDEN**: Sentimental closers ("Ich freue mich sehr darauf..."), formal closers ("Mit freundlichen Grüßen" in UI copy), or any closer that implies a formal letter register

---

## Summary table

| Rule | EN | AR | ES | DE |
|---|---|---|---|---|
| Em-dashes (sparingly) | ≤1/para | ≤1/para | ≤1/para | ≤1/para |
| Friendly closers | ❌ | ❌ in CV/Projects; ✅ in Contact/About/Blog | ❌ in CV/Projects; ✅ in Contact/About/Blog | ❌ in CV/Projects; ✅ in Contact/About |
| Artificial rhythm | ❌ | ❌ | ❌ | ❌ |
| Meta-signposting | ❌ | ❌ (lists OK) | ❌ (lists OK) | ❌ (lists OK) |
| Academic transitions | ❌ | ❌ (except natural Arabic connectives) | ❌ (except "sin embargo") | ❌ (except "Deshalb/Daher") |
| Padded 3-item lists | ❌ | ❌ | ❌ | ❌ |
| Hedging fillers | ❌ | ❌ | ❌ | ❌ |
| Over-qualifying | ❌ | ❌ | ❌ | ❌ |
| Rhetorical flourishes | ❌ | ❌ | ❌ | ❌ |
