---
description: Workflow for starting and completing a skill from the build prompt
---

## New Skill Workflow

When starting a new skill from PORTFOLIO_BUILD_PROMPT.md Section 6:

### Before Starting

1. **Verify prerequisites** — confirm all prerequisite skills are completed and working.
2. **Read the skill definition** — read the full skill section in the prompt (Goal, Instructions, Acceptance Criteria).
3. **Context7 lookups** — fetch docs for all libraries mentioned in the skill.
4. **Plan the implementation** — list files to create/modify before writing any code.

### During Implementation

5. **Follow the instructions** step by step. Do not skip steps.
6. **Follow all rules** in `.windsurf/rules/` — especially:
   - `config-yaml-first.md` — no hardcoded values
   - `i18n-from-start.md` — translation keys for all text
   - `component-driven.md` — proper component structure
   - `context7-and-docs-first.md` — verify APIs before using
7. **Test incrementally** — don't wait until the end to test. Check after each sub-step.

### After Completing

8. **Verify acceptance criteria** — go through each criterion in the skill definition.
9. **Run full checks**:
   // turbo
   - `make lint`
   // turbo
   - `make build`
   - Visual check in browser (all breakpoints, dark mode, RTL)
10. **Commit** — `feat(skill-XX): <skill name> — <brief description>`
11. **Update progress** — mark skill as complete in tracking.
