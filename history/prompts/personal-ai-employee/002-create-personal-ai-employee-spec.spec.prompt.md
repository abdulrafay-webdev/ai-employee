---
id: 002
title: create-personal-ai-employee-spec
stage: spec
date: 2026-02-18
surface: agent
model: gemini-2.0-flash
feature: personal-ai-employee
branch: 001-personal-ai-employee
user: user
command: /sp.specify
labels: ["spec", "feature-definition", "personal-ai"]
links:
  spec: specs/001-personal-ai-employee/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-personal-ai-employee/spec.md
 - specs/001-personal-ai-employee/checklists/requirements.md
tests: []
---

## Prompt

Create a full specification for a Personal AI Employee system.
Features:
- WhatsApp automation via QR login (no API key)
- Email automation via Gmail API
- Auto-reply to client & service queries
- Draft unnecessary messages
- Skills-based architecture
- Admin dashboard in Next.js + React
- Message classification (important vs unimportant)
Important Rule:
If credentials are required, ask the user and explain where to get them.
Output:
- System overview
- Feature list
- Tech stack
- Required credentials list

## Response snapshot

Created feature specification for "Personal AI Employee" (branch `001-personal-ai-employee`). Defined user stories for WhatsApp via QR, Gmail integration, automated classification/response, and admin dashboard. Established success criteria (90% auto-reply rate) and verified constitution compliance.

## Outcome

- ✅ Impact: Formalized requirements for personal AI assistant.
- 🧪 Tests: Defined independent test scenarios for each user story.
- 📁 Files: created `specs/001-personal-ai-employee/spec.md`, `specs/001-personal-ai-employee/checklists/requirements.md`
- 🔁 Next prompts: /sp.plan
- 🧠 Reflection: Spec is solid. Key technical challenge will be robust WhatsApp Web automation without official API.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
