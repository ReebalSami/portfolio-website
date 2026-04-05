---
description: Ensure all code runs end-to-end and produces expected results
---

- Always ensure the project builds and runs end-to-end after every change.
- After every skill/feature: run `make lint`, `make build`, verify in browser.
- Explain all code you write — purpose, approach, any trade-offs.
- NO HARDCODING paths, IDs, credentials, constants, or text strings. Use `config/site.yaml`, environment variables, or translation keys.
- Validate every component at multiple breakpoints (mobile, tablet, desktop).
- Test dark mode and RTL (Arabic) after every UI change.
- Document outcomes of each skill in a brief commit message.
- Iterate until the feature meets all acceptance criteria from the prompt.
