---
id: 005
title: implement-classification-and-skills
stage: tasks
date: 2026-02-18
surface: agent
model: gemini-2.0-flash
feature: personal-ai-employee
branch: 001-personal-ai-employee
user: user
command: /sp.implement
labels: ["tasks", "implementation", "personal-ai"]
links:
  spec: specs/001-personal-ai-employee/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - apps/backend/src/core/classifier.ts
 - apps/backend/src/skills/client_query.ts
 - apps/backend/src/skills/important_message.ts
 - apps/backend/src/skills/index.ts
 - apps/backend/src/core/queue.ts
 - apps/backend/src/services.ts
 - apps/backend/src/connectors/whatsapp.ts
 - apps/backend/src/core/draft_manager.ts
 - apps/backend/tests/classification.test.ts
tests: []
---

## Prompt

continue implementataioncontinue implementataion

## Response snapshot

Completed Phase 3 (WhatsApp Integration). Started Phase 4 (Classification & Response).
- Implemented Classifier service (`apps/backend/src/core/classifier.ts`).
- Updated worker to use classifier and introduced `ClientQuerySkill` and `ImportantMessageSkill`.
- Created `ClientQuerySkill` for auto-replies.
- Updated `WhatsAppConnector` to send replies.
- Created `ImportantMessageSkill` to create drafts.
- Added skills to `skills/index.ts`.
- Created integration tests for classification flow (`apps/backend/tests/classification.test.ts`).

## Outcome

- ✅ Impact: Core message classification and initial response logic implemented.
- 🧪 Tests: Added classification integration tests.
- 📁 Files: 7 files modified/created.
- 🔁 Next prompts: Continue implementation (Phase 5: Gmail Integration).
- 🧠 Reflection: Phase 4 is complete. Testing covers basic classification and skill execution. Next steps involve handling Gmail integration and dashboard.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
