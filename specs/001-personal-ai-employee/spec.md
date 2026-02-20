# Feature Specification: Personal AI Employee

**Feature Branch**: `001-personal-ai-employee`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Create a full specification for a Personal AI Employee system.Features:- WhatsApp automation via QR login (no API key)- Email automation via Gmail API- Auto-reply to client & service queries- Draft unnecessary messages- Skills-based architecture- Admin dashboard in Next.js + React- Message classification (important vs unimportant)Important Rule:If credentials are required, ask the user and explain where to get them.Output:- System overview- Feature list- Tech stack- Required credentials list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - WhatsApp Connection & Message Ingestion (Priority: P1)

The user connects their WhatsApp account via QR code scanning (simulating a web client) to enable the system to read and process incoming messages without an official business API key.

**Why this priority**: Core channel for communication; without this, the "Personal Employee" has no input stream.

**Independent Test**: Can be tested by starting the service, scanning a QR code, sending a message to the connected number, and verifying the system logs the incoming message content.

**Acceptance Scenarios**:

1. **Given** the system is started, **When** the user accesses the console/dashboard, **Then** a QR code is displayed for WhatsApp Web login.
2. **Given** a successful QR scan, **When** a new message arrives on WhatsApp, **Then** the message content, sender, and timestamp are captured by the system.
3. **Given** the session expires, **When** the system detects disconnection, **Then** it prompts the user to re-scan the QR code.

---

### User Story 2 - Automated Classification & Response (Priority: P1)

Incoming messages are analyzed to determine if they are "Client/Service Queries" (auto-reply), "Important" (notify/draft), or "Unimportant" (ignore/archive).

**Why this priority**: Delivers the primary value of automation and time-saving.

**Independent Test**: Send 3 distinct test messages (a known client query, an urgent personal message, a spam message) and verify correct classification and action (reply sent vs. draft created).

**Acceptance Scenarios**:

1. **Given** a message classified as a "Client Query", **When** processed, **Then** an appropriate response is generated and sent automatically via WhatsApp.
2. **Given** a message classified as "Important" but not a simple query, **When** processed, **Then** a draft response is created and added to the manual review queue.
3. **Given** a message classified as "Unimportant", **When** processed, **Then** it is logged but triggers no notification or action.

---

### User Story 3 - Gmail Integration (Priority: P2)

The system connects to a user's Gmail account to read emails and apply the same classification and automation logic as WhatsApp.

**Why this priority**: Expands the scope of the "Employee" to the second most critical communication channel.

**Independent Test**: Send a test email to the connected account and verify it appears in the system's processing log with correct classification.

**Acceptance Scenarios**:

1. **Given** the system needs email access, **When** initializing, **Then** it requests Gmail API credentials from the user securely (not hardcoded).
2. **Given** valid credentials, **When** a new email arrives, **Then** the system ingests the subject and body for processing.
3. **Given** an email classified as "Client Query", **When** processed, **Then** a draft reply is prepared (auto-sending emails is higher risk, defaulting to draft for MVP).

---

### User Story 4 - Admin Dashboard (Priority: P3)

A web-based dashboard (Next.js) allows the user to view system status, monitor automation stats, and approve/edit draft responses.

**Why this priority**: Provides visibility and control, essential for trust in an autonomous system.

**Independent Test**: Launch the web app and verify it loads stats and displays a list of "Pending Drafts".

**Acceptance Scenarios**:

1. **Given** the dashboard is running, **When** the user visits the home page, **Then** they see system health (WhatsApp connected/disconnected) and recent activity logs.
2. **Given** pending drafts exist, **When** the user clicks "Review", **Then** they can edit the text and click "Send" to dispatch the message via the appropriate channel.

### Edge Cases

- **WhatsApp Disconnection**: System handles connection drops gracefully, pausing automation until re-authenticated.
- **Rate Limiting**: System respects platform rate limits to avoid account bans (especially for WhatsApp Web automation).
- **Ambiguous Classification**: Messages with low classification confidence default to "Manual Review" to prevent inappropriate auto-replies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support WhatsApp Web protocol for login via QR code.
- **FR-002**: System MUST allow users to input Gmail API credentials (client_id, client_secret) at runtime or via secure env config.
- **FR-003**: System MUST classify text inputs into at least three categories: Client Query, Important, Unimportant.
- **FR-004**: System MUST support a "Skill" interface allowing new capabilities (e.g., "Schedule Meeting", "Lookup Price") to be added modularly.
- **FR-005**: System MUST provide a Next.js-based web interface for monitoring and manual intervention.
- **FR-006**: System MUST NEVER hardcode credentials; it must prompt the user or read from `.env` files explicitly excluded from version control.
- **FR-007**: System MUST store a history of processed messages and actions taken for audit purposes.

### Key Entities

- **Message**: Represents an incoming item (Source: WhatsApp/Email, Sender, Content, Timestamp).
- **Classification**: The derived intent/category of a message.
- **Action**: The automated or proposed response (Type: Reply, Draft, Ignore; Content).
- **Skill**: A modular unit of logic that can process a specific type of message (e.g., specific client queries).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of standard client queries (e.g., "What are your hours?", "Price list?") are answered automatically without human intervention.
- **SC-002**: System setup (from clone to running) takes less than 15 minutes, including credential acquisition steps.
- **SC-003**: Dashboard loads main view in under 2 seconds.
- **SC-004**: Zero (0) incidents of credentials being committed to the repository (verified by pre-commit hooks or code review).

## Constitution Compliance *(mandatory)*

- [x] **Automation First**: Feature automates message handling; manual review is only for exceptions.
- [x] **Intelligent Escalation**: "Important" and ambiguous messages are routed to a draft queue for human review.
- [x] **Modular Skills**: Architecture explicitly requires a "Skills-based" approach for extensibility.
- [x] **Centralized Monitoring**: Includes a Next.js dashboard for system visibility.
- [x] **Secure Credentials**: Requirement FR-006 explicitly mandates secure credential handling (prompting user).