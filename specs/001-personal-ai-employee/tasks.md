# Tasks: Personal AI Employee

**Input**: Design documents from `/specs/001-personal-ai-employee/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL but recommended for critical components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**:
  - `apps/backend/src/`
  - `apps/dashboard/src/`
  - `shared/src/`
- Paths shown below match the monorepo structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (apps/backend, apps/dashboard, shared)
- [x] T002 Initialize Node.js workspace and shared types package in shared/package.json
- [x] T003 Initialize Backend project with Typescript, Express/Fastify, and BullMQ in apps/backend/package.json
- [x] T004 Initialize Dashboard project with Next.js, Tailwind, and Shadcn in apps/dashboard/package.json
- [x] T005 [P] Configure shared types (Message, Classification) in shared/src/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Setup SQLite database and Prisma schema in apps/backend/prisma/schema.prisma
- [x] T007 [P] Implement core configuration loader (env vars) in apps/backend/src/config/env.ts
- [x] T008 [P] Setup In-Memory Message Processor in `apps/backend/src/core/processor.ts`
- [x] T009 [P] Create basic logger utility in `apps/backend/src/core/logger.ts`
- [x] T010 [P] Implement abstract Skill interface in apps/backend/src/skills/interface.ts
- [x] T011 [P] Create Message and Conversation models in apps/backend/src/models/message.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - WhatsApp Connection & Message Ingestion (Priority: P1) 🎯 MVP

**Goal**: Enable WhatsApp QR login, message ingestion, and basic logging.

**Independent Test**: Start backend, scan QR code, send message to self, verify message appears in logs/DB.

### Implementation for User Story 1

- [x] T012 [P] [US1] Install `whatsapp-web.js` and `qrcode-terminal` in apps/backend/package.json
- [x] T013 [US1] Implement WhatsApp connector service in apps/backend/src/connectors/whatsapp.ts
- [x] T014 [US1] Create QR code display logic (console + API endpoint) in apps/backend/src/api/auth.ts
- [x] T015 [US1] Implement incoming message listener and normalization in apps/backend/src/core/ingest.ts
- [x] T016 [US1] Connect ingestion to BullMQ "incoming" queue in apps/backend/src/core/ingest.ts
- [x] T017 [US1] Implement basic "LogOnly" processor for queue to verify end-to-end flow in apps/backend/src/skills/log_skill.ts

**Checkpoint**: User can log in via QR and system logs incoming messages.

---

## Phase 4: User Story 2 - Automated Classification & Response (Priority: P1)

**Goal**: Classify messages (Client/Important/Unimportant) and trigger auto-responses or drafts.

**Independent Test**: Send "What are your hours?" (expect reply), "Urgent help" (expect draft), "Spam" (expect ignore).

### Implementation for User Story 2

- [x] T018 [P] [US2] Implement Keyword/LLM-based Classifier service in `apps/backend/src/core/classifier.ts`
- [x] T019 [US2] Update Queue Worker to use Classifier on incoming messages in `apps/backend/src/core/worker.ts`
- [x] T020 [US2] Implement "Client Query" Skill (Auto-responder) in `apps/backend/src/skills/client_query.ts`
- [x] T021 [US2] Implement "Important Message" logic (Create Draft) in `apps/backend/src/core/draft_manager.ts`
- [x] T022 [US2] Implement WhatsApp outbound message sender in `apps/backend/src/connectors/whatsapp.ts`
- [x] T023 [US2] Create integration test for classification flow in `apps/backend/tests/classification.test.ts`

**Checkpoint**: System automatically replies to queries and creates drafts for important messages.

---

## Phase 5: User Story 3 - Gmail Integration (Priority: P2)

**Goal**: Connect Gmail account and apply classification logic to emails.

**Independent Test**: Send email, verify it enters the same queue and gets classified/drafted.

### Implementation for User Story 3

- [x] T024 [P] [US3] Install `googleapis` and configure OAuth credentials flow in `apps/backend/src/config/env.ts`
- [x] T025 [US3] Implement Gmail connector (polling/push) in `apps/backend/src/connectors/gmail.ts`
- [x] T026 [US3] specific normalization for Email -> Message type in `apps/backend/src/connectors/gmail.ts` (email parsing logic)
- [x] T027 [US3] Implement "Draft Reply" for Gmail (logic handled by dashboard, backend only ingests)
- [x] T028 [US3] CLI script to generate/refresh Gmail tokens in `apps/backend/scripts/auth_gmail.ts`

**Checkpoint**: Gmail messages are ingested and processed alongside WhatsApp messages.

---

## Phase 6: User Story 4 - Admin Dashboard (Priority: P3)

**Goal**: Web UI to monitor system status and manage drafts.

**Independent Test**: Open dashboard, see QR code (if logged out), see message stats, edit and send a draft.

### Implementation for User Story 4

- [x] T029 [P] [US4] Create API endpoints for System Status & Drafts in `apps/backend/src/api/routes.ts`
- [x] T030 [US4] Implement Status Card component in `apps/dashboard/src/components/status-card.tsx`
- [x] T031 [US4] Implement Drafts Review List component in `apps/dashboard/src/components/draft-list.tsx`
- [x] T032 [US4] Implement "Approve/Send" action in `apps/dashboard/src/lib/actions.ts`
- [x] T033 [US4] Create Dashboard Main Page layout in `apps/dashboard/src/app/page.tsx`
- [x] T034 [US4] E2E test for loading dashboard and viewing drafts in `apps/dashboard/tests/e2e.spec.ts`

**Checkpoint**: Full control via web interface.

---

## Phase 7: Constitution Compliance & Polish

**Purpose**: Improvements that ensure strict adherence to core principles and production readiness

- [x] T035 [P] Verify **Automation First**: Review logs to ensure auto-reply rate is tracked.
- [x] T036 [P] Verify **Intelligent Escalation**: Test draft creation for ambiguous inputs.
- [x] T037 [P] Verify **Secure Credentials**: Audit code for hardcoded secrets; verify CLI prompts.
- [x] T038 [P] Add README documentation with Setup & Auth guides in README.md
- [ ] T039 [P] Optimize Dockerfile for deployment (optional) in Dockerfile
- [x] T040 [P] Run final linting and type-checking across monorepo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (WhatsApp)**: Depends on Foundational.
- **User Story 2 (Automation)**: Depends on US1 (needs ingestion).
- **User Story 3 (Gmail)**: Depends on Foundational (can run parallel to US1/US2, but reuses logic).
- **User Story 4 (Dashboard)**: Depends on Foundational (API). Best done after US2 to have data to show.

### Parallel Opportunities

- US1 (WhatsApp) and US3 (Gmail) can theoretically be built in parallel after Foundation.
- US4 (Dashboard) UI components can be built using mock data while Backend is being built.

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. **Setup & Foundation**: Get the repo and DB ready.
2. **US1**: Get WhatsApp connected and logging messages.
3. **US2**: Add the "brain" (classification) and auto-reply.
4. **Validation**: Test end-to-end via WhatsApp.

### Incremental Delivery

1. **v0.1**: WhatsApp Logger (US1)
2. **v0.2**: Auto-Responder (US2)
3. **v0.3**: Admin Dashboard (US4) - visibility into v0.2
4. **v0.4**: Gmail Integration (US3) - channel expansion