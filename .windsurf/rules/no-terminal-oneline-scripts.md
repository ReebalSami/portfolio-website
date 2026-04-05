---
description: Never execute inline scripts or one-liners in the terminal
---

- Do not execute scripts directly in the terminal (e.g., `node -e "..."` or `.venv/bin/python -c "..."`).
- All utility code must be in a tracked file (`.ts`, `.js`, `.py`) and executed via a proper command.
- Use Makefile targets for all recurring commands.
- Never run scripts like: `cat > /tmp/script.sh << 'SCRIPT'`.
- Exception: simple CLI commands like `pnpm add <package>` or `make <target>` are fine.
