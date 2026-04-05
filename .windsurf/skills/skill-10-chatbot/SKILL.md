---
name: skill-10-chatbot
description: Build the AI chatbot widget powered by in-context RAG that answers visitor questions about Reebal
---

## Skill 10: AI Chatbot Widget

### Goal
Floating chatbot answering questions about Reebal via in-context RAG with OpenAI.

### Prerequisites
Skill 03 completed.

### GitHub
- **Milestone**: M3: Content & Features
- **Issues**:
  - "Skill 10: AI Chatbot Widget"
  - "ACTION @ReebalSami: Set up OpenAI API key" (assigned to Reebal)

### Steps

1. **Context document**: `src/content/chatbot-context.md`
   - Compiled resume + projects + skills + bio
   - Small enough for in-context (no vector DB needed)

2. **API route** `/api/chat/route.ts`:
   - Accept user message
   - System prompt + context + user message → OpenAI `gpt-4o-mini` streaming
   - Rate limit: 10 req/IP/hour
   - Input sanitization
   - API key from `CHATBOT_API_KEY` env var

3. **System prompt**:
   ```
   You are an AI assistant on Reebal Sami's portfolio. Answer based ONLY on
   the provided context. Be helpful, concise, professional. If unknown, say
   "I don't have that info, reach Reebal at reebal.sami@gmail.com."
   Respond in the user's language.
   ```

4. **ChatWidget** — floating button (bottom-right) → chat dialog
5. **ChatMessage** — message bubbles (user + assistant)
6. **ChatInput** — input + send button
7. **Feature flag**: `config/site.yaml` → `features.chatbot`
8. **"Powered by AI" disclaimer**

### Acceptance Criteria
- [ ] Chat widget appears as floating button
- [ ] Opens dialog on click
- [ ] Streaming AI responses work
- [ ] AI answers accurately from context
- [ ] Responds in user's language
- [ ] Rate limiting works
- [ ] Feature toggle works
- [ ] Mobile-friendly
- [ ] API key NOT exposed to client
- [ ] **Show local demo to Reebal before pushing**
