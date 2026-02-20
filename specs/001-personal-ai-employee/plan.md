# Implementation Plan: Personal AI Employee

**Branch**: `001-personal-ai-employee` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-personal-ai-employee/spec.md`

## Summary

The Personal AI Employee is an automated system designed to handle communications via WhatsApp and Gmail. It features a Node.js backend that ingests messages using a QR-code based WhatsApp client (simulating a web session) and the Gmail API. The system uses a modular "skills" architecture to classify and process messages, automating responses for routine client queries while routing important or ambiguous items to a draft queue. A Next.js admin dashboard provides system monitoring and manual review capabilities.

## Technical Context

**Language/Version**: Node.js v20+ (LTS), React 18+ (Next.js 14+)
**Primary Dependencies**: 
- Backend: `whatsapp-web.js` (for QR login), `googleapis` (Gmail), `express` or `fastify` (API), `bullmq` (queues)
- Frontend: `next`, `react`, `tailwindcss`, `shadcn/ui` (optional for speed)
**Storage**: SQLite (via `better-sqlite3` or `prisma`) for local, self-contained persistence of messages/drafts.
**Testing**: `vitest` (unit/integration), `playwright` (e2e for dashboard)
**Target Platform**: Local server/VPS (Windows/Linux) - intended to run persistently.
**Project Type**: Monorepo (Frontend + Backend)
**Performance Goals**: <2s dashboard load, realtime message ingestion.
**Constraints**: WhatsApp web session must be maintained; credentials must be prompted/secure.
**Scale/Scope**: Single user (Personal Employee), extensible skills.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Automation First**: Core loop is automated message processing.
- [x] **Intelligent Escalation**: Queue system for "Important/Ambiguous" items defined.
- [x] **Automated Client Support**: "Client Query" classification triggers auto-response.
- [x] **Modular Skills**: Architecture splits logic into discrete skill modules.
- [x] **Centralized Monitoring**: Next.js dashboard is the primary interface.
- [x] **Production-Ready**: Uses standard LTS Node, Typescript, and testing frameworks.
- [x] **Secure Credentials**: Plan includes CLI prompt for Gmail/Auth tokens, no hardcoding.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-ai-employee/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Monorepo Structure
apps/
├── backend/             # Node.js Service
│   ├── src/
│   │   ├── config/      # Env & Credential mgmt
│   │   ├── core/        # Message loop, Queue logic
│   │   ├── connectors/  # WhatsApp, Gmail adapters
│   │   ├── skills/      # Modular skill definitions
│   │   ├── api/         # Internal API for dashboard
│   │   └── models/      # DB entities
│   ├── tests/
│   └── package.json
│
└── dashboard/           # Next.js Admin UI
    ├── src/
    │   ├── app/         # App router pages
    │   ├── components/  # UI components
    │   └── lib/         # API client
    ├── tests/
    └── package.json

shared/                  # Shared types/constants
└── src/
    └── types.ts

package.json             # Root workspace config
```

**Structure Decision**: A monorepo workspace allows sharing types (like `Message` and `Classification` enums) between the backend and the dashboard while keeping their dependencies and build processes distinct.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Monorepo | Shared types between API and Frontend | Copy-pasting types leads to drift/bugs |
| Queue System (BullMQ) | Reliability for async message processing | In-memory arrays lose data on restart |