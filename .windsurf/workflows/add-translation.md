---
description: Workflow for adding or updating translations across all locales
---

## Add Translation Workflow

When adding new translation keys:

1. **Add the key to `src/messages/en.json` first** — English is the primary locale.

2. **Add to all other locales** — `de.json`, `es.json`, `ar.json` with properly translated content.
   - German: professional, formal tone (Sie-Form for user-facing, du-Form for casual blog)
   - Spanish: professional tone
   - Arabic: professional tone, ensure text reads naturally in RTL context

3. **Structure** — translations are nested by page/section:
   ```json
   {
     "common": { "nav": {}, "footer": {}, "buttons": {} },
     "home": { "hero": {} },
     "about": {},
     "projects": {},
     "blog": {},
     "contact": {},
     "chat": {}
   }
   ```

4. **Use in component** — `const t = useTranslations('sectionName')` then `t('key')`.

5. **Verify** — switch to each locale in the browser and confirm:
   - Text renders correctly
   - No missing keys (check console for warnings)
   - Arabic text is RTL and reads naturally
   - Layout doesn't break with different text lengths
