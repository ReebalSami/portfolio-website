---
description: Always show local live demo before committing or pushing any changes
---

- NEVER commit, push, or deploy without first showing a local live demo to Reebal.
- After implementing a feature/skill: run `make dev`, open the browser, demonstrate the changes.
- Wait for Reebal's explicit approval before proceeding to commit.
- If Reebal requests changes: fix them, demo again, get approval, then commit.
- Only after approval: `git add . && git commit && git push`.
- This ensures quality and prevents broken code from reaching the remote.
