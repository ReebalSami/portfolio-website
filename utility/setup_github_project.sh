#!/usr/bin/env bash
# =============================================================================
# GitHub Project Setup Script
# Creates Milestones, Labels, Issues, and assigns them for the portfolio project.
# Usage: bash utility/setup_github_project.sh
# Requires: gh CLI authenticated
# =============================================================================
set -euo pipefail

REPO="ReebalSami/portfolio-website"

echo "=== Creating Labels ==="
gh label create "skill" --description "Skill implementation task" --color "0E8A16" --repo "$REPO" 2>/dev/null || echo "Label 'skill' exists"
gh label create "reebal-action" --description "Requires Reebal's action" --color "D93F0B" --repo "$REPO" 2>/dev/null || echo "Label 'reebal-action' exists"
gh label create "cascade-action" --description "Assigned to Cascade (AI)" --color "1D76DB" --repo "$REPO" 2>/dev/null || echo "Label 'cascade-action' exists"
gh label create "blocked" --description "Blocked by dependency" --color "B60205" --repo "$REPO" 2>/dev/null || echo "Label 'blocked' exists"
gh label create "milestone-1" --description "M1: Foundation" --color "C5DEF5" --repo "$REPO" 2>/dev/null || echo "Label 'milestone-1' exists"
gh label create "milestone-2" --description "M2: Core Pages" --color "BFD4F2" --repo "$REPO" 2>/dev/null || echo "Label 'milestone-2' exists"
gh label create "milestone-3" --description "M3: Content & Features" --color "D4C5F9" --repo "$REPO" 2>/dev/null || echo "Label 'milestone-3' exists"
gh label create "milestone-4" --description "M4: Polish & Quality" --color "FEF2C0" --repo "$REPO" 2>/dev/null || echo "Label 'milestone-4' exists"
gh label create "milestone-5" --description "M5: Deployment" --color "F9D0C4" --repo "$REPO" 2>/dev/null || echo "Label 'milestone-5' exists"

echo ""
echo "=== Creating Milestones ==="
gh api repos/$REPO/milestones -f title="M1: Foundation" -f description="Skills 01-03: Scaffold, Design System, Layout Shell" -f state="open" 2>/dev/null || echo "M1 exists"
gh api repos/$REPO/milestones -f title="M2: Core Pages" -f description="Skills 04-07: Hero, About, Projects, Contact" -f state="open" 2>/dev/null || echo "M2 exists"
gh api repos/$REPO/milestones -f title="M3: Content & Features" -f description="Skills 08-10: Blog, i18n, AI Chatbot" -f state="open" 2>/dev/null || echo "M3 exists"
gh api repos/$REPO/milestones -f title="M4: Polish & Quality" -f description="Skills 11-13: Animations, SEO, Testing" -f state="open" 2>/dev/null || echo "M4 exists"
gh api repos/$REPO/milestones -f title="M5: Deployment" -f description="Skills 14-16: AWS CDK, CI/CD, Documentation" -f state="open" 2>/dev/null || echo "M5 exists"

echo ""
echo "=== Creating Skill Issues ==="

# M1: Foundation
gh issue create --title "Skill 01: Project Scaffold" --body "Initialize Next.js 15 project with TypeScript, Tailwind, pnpm, Makefile, config system. See \`.windsurf/skills/skill-01-scaffold/SKILL.md\`" --label "skill,cascade-action,milestone-1" --milestone "M1: Foundation" --repo "$REPO"
gh issue create --title "Skill 02: Design System & Theme" --body "Generate design system via UI UX Pro Max (NFT Art Gallery style), light/dark mode, fonts, shadcn/ui theme. See \`.windsurf/skills/skill-02-design-system/SKILL.md\`" --label "skill,cascade-action,milestone-1" --milestone "M1: Foundation" --repo "$REPO"
gh issue create --title "Skill 03: Layout Shell" --body "Header, Footer, Navigation, mobile menu, locale switcher placeholder, dark mode toggle. See \`.windsurf/skills/skill-03-layout-shell/SKILL.md\`" --label "skill,cascade-action,milestone-1" --milestone "M1: Foundation" --repo "$REPO"

# M2: Core Pages
gh issue create --title "Skill 04: Hero Section" --body "B&W photo with geometric shapes, name, title, tagline, CTAs matching Roel Hermans reference. See \`.windsurf/skills/skill-04-hero-section/SKILL.md\`" --label "skill,cascade-action,milestone-2" --milestone "M2: Core Pages" --repo "$REPO"
gh issue create --title "ACTION: Edit hero photo to match Roel Hermans reference" --body "Edit \`photo/start-photo.JPG\`: crop, adjust composition to match \`docs/design/Portfolio-website-Roel-Hermans-min-1200x855.png\`. Save edited version to \`public/images/hero/\`." --label "reebal-action,milestone-2" --assignee "ReebalSami" --repo "$REPO"
gh issue create --title "Skill 05: About Section" --body "Career timeline, tech stack grid, differentiators, CV download. See \`.windsurf/skills/skill-05-about-section/SKILL.md\`" --label "skill,cascade-action,milestone-2" --milestone "M2: Core Pages" --repo "$REPO"
gh issue create --title "Skill 06: Projects Section" --body "Filterable project grid + detail pages for 6 public projects. See \`.windsurf/skills/skill-06-projects-section/SKILL.md\`" --label "skill,cascade-action,milestone-2" --milestone "M2: Core Pages" --repo "$REPO"
gh issue create --title "Skill 07: Contact Section" --body "Contact form + social links + location. See \`.windsurf/skills/skill-07-contact-section/SKILL.md\`" --label "skill,cascade-action,milestone-2" --milestone "M2: Core Pages" --repo "$REPO"

# M3: Content & Features
gh issue create --title "Skill 08: Blog (MDX)" --body "MDX blog with syntax highlighting, ToC, reading time, RSS. See \`.windsurf/skills/skill-08-blog/SKILL.md\`" --label "skill,cascade-action,milestone-3" --milestone "M3: Content & Features" --repo "$REPO"
gh issue create --title "Skill 09: i18n (EN/DE/ES/AR + RTL)" --body "Full i18n with 4 locales, RTL Arabic support. See \`.windsurf/skills/skill-09-i18n/SKILL.md\`" --label "skill,cascade-action,milestone-3" --milestone "M3: Content & Features" --repo "$REPO"
gh issue create --title "Skill 10: AI Chatbot Widget" --body "RAG chatbot answering questions about Reebal via OpenAI. See \`.windsurf/skills/skill-10-chatbot/SKILL.md\`" --label "skill,cascade-action,milestone-3" --milestone "M3: Content & Features" --repo "$REPO"
gh issue create --title "ACTION: Set up OpenAI API key" --body "Create an OpenAI account, generate an API key, add it to \`.env.local\` as \`CHATBOT_API_KEY=sk-...\`" --label "reebal-action,milestone-3" --assignee "ReebalSami" --repo "$REPO"

# M4: Polish & Quality
gh issue create --title "Skill 11: Animations" --body "Framer Motion scroll reveals, page transitions, micro-interactions. See \`.windsurf/skills/skill-11-animations/SKILL.md\`" --label "skill,cascade-action,milestone-4" --milestone "M4: Polish & Quality" --repo "$REPO"
gh issue create --title "Skill 12: SEO & Performance" --body "Lighthouse 90+, structured data, sitemap, a11y. See \`.windsurf/skills/skill-12-seo-performance/SKILL.md\`" --label "skill,cascade-action,milestone-4" --milestone "M4: Polish & Quality" --repo "$REPO"
gh issue create --title "Skill 13: Testing" --body "Vitest unit tests + Playwright E2E. See \`.windsurf/skills/skill-13-testing/SKILL.md\`" --label "skill,cascade-action,milestone-4" --milestone "M4: Polish & Quality" --repo "$REPO"

# M5: Deployment
gh issue create --title "Skill 14: AWS CDK Infrastructure" --body "Complete IaC: S3, CloudFront, Lambda@Edge, Route 53, ACM. See \`.windsurf/skills/skill-14-aws-cdk/SKILL.md\`" --label "skill,cascade-action,milestone-5" --milestone "M5: Deployment" --repo "$REPO"
gh issue create --title "ACTION: Set up AWS account + IAM + CLI" --body "1. Create AWS account (or use existing)\n2. Create IAM user with programmatic access\n3. Install AWS CLI: \`brew install awscli\`\n4. Configure: \`aws configure\`\n5. Bootstrap CDK: \`cd infra && npx cdk bootstrap\`" --label "reebal-action,milestone-5" --assignee "ReebalSami" --repo "$REPO"
gh issue create --title "ACTION: Purchase domain (Route 53)" --body "Purchase a domain (e.g., reebalsami.com or reebal.dev) via AWS Route 53 or another registrar. Share the domain name." --label "reebal-action,milestone-5" --assignee "ReebalSami" --repo "$REPO"
gh issue create --title "Skill 15: CI/CD Pipeline" --body "GitHub Actions for CI + CD to AWS. See \`.windsurf/skills/skill-15-cicd/SKILL.md\`" --label "skill,cascade-action,milestone-5" --milestone "M5: Deployment" --repo "$REPO"
gh issue create --title "ACTION: Add GitHub secrets" --body "Add these secrets to the repo Settings → Secrets:\n- \`AWS_ACCESS_KEY_ID\`\n- \`AWS_SECRET_ACCESS_KEY\`\n- \`AWS_REGION\` (eu-central-1)\n- \`CHATBOT_API_KEY\`\n- \`RESEND_API_KEY\`" --label "reebal-action,milestone-5" --assignee "ReebalSami" --repo "$REPO"
gh issue create --title "Skill 16: Documentation & Architecture Diagram" --body "Professional README, D2 diagram, architecture docs. See \`.windsurf/skills/skill-16-documentation/SKILL.md\`" --label "skill,cascade-action,milestone-5" --milestone "M5: Deployment" --repo "$REPO"

# Setup issues
gh issue create --title "ACTION: Set up Resend account for contact form" --body "1. Sign up at https://resend.com\n2. Get API key\n3. Add to \`.env.local\` as \`RESEND_API_KEY=re_...\`" --label "reebal-action" --assignee "ReebalSami" --repo "$REPO"
gh issue create --title "ACTION: Set up Plausible analytics (optional)" --body "1. Sign up at https://plausible.io\n2. Add site domain\n3. Update \`config/site.yaml\` analytics section" --label "reebal-action" --assignee "ReebalSami" --repo "$REPO"

echo ""
echo "=== Done! ==="
echo "All milestones, labels, and issues created."
echo "Next: Create a GitHub Project board manually at https://github.com/ReebalSami/portfolio-website/projects"
echo "Or use: gh project create --title 'Portfolio Website' --owner ReebalSami"
