---
description: Never hardcode text strings — always use translation keys
---

- Every user-facing text string must use `useTranslations()` from next-intl.
- Never write English (or any language) text directly in JSX. Use translation keys.
- Structure translations by page/section in `src/messages/{locale}.json`.
- When adding a new component with text, add keys to ALL 4 locale files (en, de, es, ar).
- Test RTL layout (Arabic) after every UI change that affects text or layout direction.
