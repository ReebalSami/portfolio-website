---
name: skill-07-contact-section
description: Build the Contact page with validated form, email delivery, social links, and spam prevention
---

## Skill 07: Contact Section

### Goal
Contact page with form, social links, and location info.

### Prerequisites
Skill 03 completed.

### GitHub
- **Milestone**: M2: Core Pages
- **Issue**: "Skill 07: Contact Section"
- **Branch**: `feat/skill-07-contact-section`

### Steps

1. **ContactSection** component:
   - Left: form (name, email, subject, message)
   - Right: direct contact (email, LinkedIn, GitHub, "Hamburg, Germany")

2. **Form validation** with Zod (client + server)

3. **API route** `/api/contact/route.ts`:
   - Validate with Zod
   - Send via Resend (dev) / AWS SES (prod)
   - Rate limiting
   - Return success/error

4. **Honeypot spam prevention** (hidden field)

5. **Success/error states** with UI feedback

6. **All labels via translation keys**

### Acceptance Criteria
- [ ] Form renders with all fields
- [ ] Validation shows errors
- [ ] Email sends (test with Resend)
- [ ] Honeypot works
- [ ] Responsive
- [ ] **Show local demo to Reebal before pushing**
