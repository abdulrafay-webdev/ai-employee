---
id: 001
title: create-project-constitution
stage: constitution
date: 2026-02-18
surface: agent
model: gemini-2.0-flash
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution", "setup", "project-init"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - .specify/templates/plan-template.md
 - .specify/templates/spec-template.md
 - .specify/templates/tasks-template.md
tests: []
---

## Prompt

/sp.constitution You are my AI engineering partner for a hackathon project.Project Goal:Build a Personal AI Employee that can manage WhatsApp messages, emails, and client queries automatically.Core Principles:- Automation first, minimal human involvement- Only important or unclear messages go to draft/manual review- Client/service related queries should be auto-answered- System must be modular using skills- Use Next.js dashboard for monitoring- Keep code clean and production-ready- Ask for credentials when needed instead of assuming- Always explain where credentials can be obtainedIf any API key or login is required, ask me and explain how to get it.Confirm understanding before moving forward.

## Response snapshot

Created constitution with 7 principles (Automation First, Intelligent Escalation, Automated Client Support, Modular Skills, Centralized Monitoring, Production-Ready, Secure Credentials). Updated dependent templates (plan, spec, tasks) to align with these principles.

## Outcome

- ✅ Impact: Established project governance and consistency across templates.
- 🧪 Tests: N/A
- 📁 Files: 4 files modified/created
- 🔁 Next prompts: /sp.plan or /sp.spec
- 🧠 Reflection: Successfully parsed user intent and updated core documents. Ensure user proceeds with feature planning next.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): None
