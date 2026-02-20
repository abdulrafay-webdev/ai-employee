# Personal AI Employee

This project builds a Personal AI Employee system that automates WhatsApp messages, emails, and client queries.

## Features

-   **WhatsApp Automation**: Connects via QR login (simulating WhatsApp Web) for message processing without an official API key.
-   **Email Automation**: Integrates with Gmail API to read and process incoming emails.
-   **Automated Responses**: Auto-replies to client/service queries based on classification.
-   **Intelligent Escalation**: Drafts important or unclear messages for manual review.
-   **Skills-Based Architecture**: Modular design allows easy addition of new processing capabilities.
-   **Admin Dashboard**: A Next.js + React dashboard for monitoring system status, viewing drafts, and managing responses.
-   **Message Classification**: Identifies messages as 'Client Query', 'Important', or 'Unimportant'.
-   **Secure Credential Handling**: Never hardcodes secrets; prompts for credentials and explains acquisition.

## Setup

### Prerequisites

- Node.js (v20 LTS recommended)
- npm or yarn (npm v10+ recommended)
- Git

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    This project uses npm workspaces. Navigate to the root directory and run:
    ```bash
    npm install
    ```
    This command installs dependencies for the backend (`apps/backend`), dashboard (`apps/dashboard`), and shared packages.

## Authentication & Credentials

This system requires credentials for WhatsApp and Gmail. **NEVER HARDCODE THESE SECRETS.** They should be managed via environment variables.

### WhatsApp Setup

1.  When the backend starts, it will generate a QR code in the console.
2.  Scan this QR code using your WhatsApp mobile app to link your account.
3.  The session will be managed locally and does not require API keys.

### Gmail API Setup

To enable Gmail integration, you need to set up OAuth 2.0 credentials in the Google Cloud Console:

1.  **Create a Google Cloud Project**: If you don't have one, create it at the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable Gmail API**: Navigate to "APIs & Services" -> "Library" and enable the "Gmail API".
3.  **Configure OAuth Consent Screen**:
    *   Go to "APIs & Services" -> "OAuth consent screen".
    *   Choose "External" user type and click "Create".
    *   Fill in required app information (App name: Personal AI Employee).
    *   Add your email address as the "User support email".
    *   Add `https://www.googleapis.com/auth/gmail.readonly` as a scope if not already present (though the connector currently uses `gmail.readonly` scope implicitly through `google.auth.OAuth2` setup).
    *   Define your app's developer contact information.
4.  **Create OAuth 2.0 Client ID**:
    *   Go to "Credentials" -> "Create Credentials" -> "OAuth client ID".
    *   Select "Desktop app" as the application type.
    *   Name it something like "Personal AI Employee Backend".
    *   Click "Create". You will receive a `Client ID` and `Client Secret`.
5.  **Obtain Refresh Token**:
    *   This is the most involved step for a desktop app. You will need to use the obtained `Client ID` and `Client Secret` to perform an OAuth 2.0 flow that grants a refresh token. This typically involves running a local script that opens a browser window for user authorization and then exchanges the authorization code for tokens.
    *   **For Hackathon Simplicity**: You can use tools like `google-auth-library` or the `google-auth-oauth2-client` Node.js library to perform an initial OAuth flow and obtain the refresh token. Alternatively, use Google's own discovery and authentication tools.
    *   **Instructions**: Once you have your `Client ID`, `Client Secret`, and a `Refresh Token`, add them to your `.env` file.

### Environment Variables

Create a `.env` file in the project root with the following structure:

```dotenv
# Backend Configuration
PORT=3000
DATABASE_URL="file:./dev.db" # For SQLite
REDIS_HOST="localhost"
REDIS_PORT="6379"

# WhatsApp Configuration
WHATSAPP_SESSION_ID="personal-employee" # Used by whatsapp-web.js

# Gmail API Configuration
GMAIL_CLIENT_ID="YOUR_GMAIL_CLIENT_ID"
GMAIL_CLIENT_SECRET="YOUR_GMAIL_CLIENT_SECRET"
GMAIL_REFRESH_TOKEN="YOUR_GMAIL_REFRESH_TOKEN"
# GMAIL_ACCESS_TOKEN="..." # Optional: Can be obtained from refresh token
# GMAIL_EXPIRY=... # Optional: Expiry timestamp

# For Development/Testing - these might not be needed for running the app directly
# For Production, use proper secrets management.
```

## Running the Application

### Backend

1.  Navigate to the backend directory:
    ```bash
    cd apps/backend
    ```
2.  Build the backend (if not running in watch mode):
    ```bash
    npm run build
    ```
3.  Start the backend server:
    ```bash
    npm run dev  # For development with hot-reloading (using ts-node)
    # OR
    npm start    # For production (after building)
    ```
    Upon starting, the WhatsApp QR code will be displayed in the console. Scan it.

### Dashboard

1.  Navigate to the dashboard directory:
    ```bash
    cd ../dashboard
    ```
2.  Start the dashboard development server:
    ```bash
    npm run dev
    ```
    The dashboard will be accessible at `http://localhost:3000` (or the port specified in `PORT`).

## Project Structure

```
.
├── apps/
│   ├── backend/         # Node.js Service
│   │   ├── src/
│   │   │   ├── config/      # Env & Credential mgmt
│   │   │   ├── core/        # Message loop, Queue logic
│   │   │   ├── connectors/  # WhatsApp, Gmail adapters
│   │   │   ├── skills/      # Modular skill definitions
│   │   │   ├── api/         # Internal API for dashboard
│   │   │   └── models/      # DB entities
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── dashboard/       # Next.js Admin UI
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # UI components
│       │   └── lib/         # API client
│       ├── tests/
│       └── package.json
│
├── shared/              # Shared types/constants
│   └── src/
│       └── types.ts
│
├── .env                 # Environment variables (DO NOT COMMIT)
├── .gitignore           # Git ignore patterns
├── GEMINI.md            # Agent specific info
├── package.json         # Root workspace config
├── tsconfig.json        # TypeScript config
└── ...
```

## Core Principles

This project adheres to the following core principles:

### I. Automation First
The system MUST prioritize automated handling of all tasks. The primary goal is to achieve zero-touch processing for messages, emails, and queries, minimizing the need for human intervention.

### II. Intelligent Escalation
Messages or queries that are identified as high-importance, ambiguous, or failing automation rules MUST be moved to a draft/manual review queue. They should never be dropped or ignored.

### III. Automated Client Support
All client and service-related queries with identifiable solutions MUST be answered automatically. The system should leverage a knowledge base or predefined skills to provide instant, accurate responses.

### IV. Modular, Skill-Based Architecture
The system MUST be built on a modular architecture where discrete functionalities are encapsulated as "skills." Each skill should be independently developable, testable, and deployable to encourage scalability and maintainability.

### V. Centralized Monitoring
A monitoring dashboard built with Next.js MUST be provided. This dashboard will serve as the single pane of glass for observing system status, automation rates, and manual review queues.

### VI. Production-Ready Code
All code committed to the repository MUST be clean, well-documented, and adhere to production-quality standards. This includes comprehensive testing and clear, maintainable logic.

### VII. Secure Credential Handling
The system MUST NEVER assume credentials or hardcode sensitive information. When an API key, login, or other secret is required, the system MUST ask for it and provide clear instructions on how and where to obtain it.

## Governance

This Constitution is the authoritative source for all project standards and practices. All development work, code reviews, and architectural decisions must align with these principles. Amendments to this document require team consensus and must be recorded with a version bump.

**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
