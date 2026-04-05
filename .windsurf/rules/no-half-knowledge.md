---
description: Read and analyze files fully, never partially
---

- Never use `head -x` or any similar method to read or analyze files partially.
- You must read/analyze files fully from beginning to end.
- When reviewing a component or config, read the entire file before making changes.
- When debugging, trace the full data flow — don't assume based on partial reads.
