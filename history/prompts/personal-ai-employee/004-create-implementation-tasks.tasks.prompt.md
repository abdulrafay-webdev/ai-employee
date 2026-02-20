---
id: 004
title: create-implementation-tasks
stage: tasks
date: 2026-02-18
surface: agent
model: gemini-2.0-flash
feature: personal-ai-employee
branch: 001-personal-ai-employee
user: user
command: /sp.tasks
labels: ["tasks", "planning", "monorepo"]
links:
  spec: specs/001-personal-ai-employee/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-personal-ai-employee/tasks.md
tests: []
---

## Prompt

Generate actionable tasks for the Personal AI Employee.
Include:
- Backend setup (Node.js, BullMQ, SQLite)
- WhatsApp integration (QR login, message ingestion)
- Gmail integration (OAuth, polling)
- Skills creation (Classifier, Auto-responder)
- Dashboard UI (Next.js, Tailwind)
- Testing and Deployment steps
Tasks should be step-by-step and beginner-friendly.
If credentials are needed, clearly ask and explain how to get them.

## Response snapshot

Generated `specs/001-personal-ai-employee/tasks.md` with 40 tasks across 7 phases.
- Phase 1: Setup (Monorepo structure)
- Phase 2: Foundational (DB, Env, Queue)
- Phase 3: US1 - WhatsApp Connection (MVP target)
- Phase 4: US2 - Auto-Classification/Response
- Phase 5: US3 - Gmail Integration
- Phase 6: US4 - Admin Dashboard
- Phase 7: Polish & Compliance

## Outcome

- ✅ Impact: Created a comprehensive, step-by-step task list for implementation.
- 🧪 Tests: Included tasks for integration tests and dashboard E2E.
- 📁 Files: created `specs/001-personal-ai-employee/tasks.md`
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: Tasks are granular and follow the monorepo structure defined in the plan. Ready for execution.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
