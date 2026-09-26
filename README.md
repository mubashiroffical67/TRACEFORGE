# TraceForge

> **From Production Incident to Verified Fix.**

TraceForge is an AI-powered, evidence-driven incident response platform that takes developers from a production failure to an independently reviewed, tested and verified resolution — in minutes, not hours.

---

## Problem

Most AI coding tools help developers write new code. But when production software breaks, teams face a different challenge: understanding _why_ it broke, determining the _smallest safe fix_, generating _regression tests_, and getting the change _reviewed_ and _verified_ before merging.

Traditional incident response is slow, manual, and error-prone:
- Engineers spend hours reading logs and stack traces
- Root cause identification is tribal knowledge
- Fixes are often untested patches
- Security review is skipped under pressure
- Institutional knowledge is lost after resolution

---

## Solution

TraceForge connects six specialized AI agents into an orchestrated investigation workflow:

```
Incident → Detective → Root Cause → Fix → Tests → Security → Review → Verification → PR
```

Each agent has a specific job. The **Independent Reviewer** can reject a solution and send it back for revision — up to 3 configurable iterations. Every conclusion references supporting evidence. No speculation presented as fact.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Evidence Chain** | Every AI conclusion linked to stack traces, logs, files, and code paths |
| **Root Cause Analysis** | Multiple hypotheses with confidence ratings and supporting/contradicting evidence |
| **Minimal Fix Generation** | Smallest safe change — no unnecessary refactoring |
| **Regression Tests** | Auto-generated tests with explanation of what bug each test prevents |
| **Security Review** | OWASP-style analysis of the proposed patch |
| **Independent Review** | Critic agent that can reject the solution and trigger re-iteration |
| **Knowledge Card** | Exportable incident record with prevention recommendations |
| **PR Package** | Pull-request-ready title, description, branch, and file diff |
| **Demo Mode** | Built-in demo incident (INC-0042) that demonstrates the full workflow |

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via Prisma ORM |
| AI | OpenAI GPT-4o (with demo simulation fallback) |
| Package Management | npm workspaces |

### Repository Structure

```
/
├── frontend/           # Next.js 14 application
│   ├── app/            # App router pages
│   ├── components/     # React components
│   │   ├── incident/   # Incident workspace panels
│   │   ├── layout/     # Sidebar, navigation
│   │   └── ui/         # Badge, Button, Card, Spinner
│   └── lib/            # API client
│
├── backend/            # Express API server
│   ├── src/
│   │   ├── agents/     # AIProvider + Orchestrator
│   │   ├── api/        # Route handlers
│   │   ├── demo/       # Demo data (INC-0042)
│   │   ├── lib/        # Prisma client
│   │   ├── middleware/ # Error handler
│   │   └── types/      # Shared TypeScript types
│   └── prisma/         # Schema + migrations
│
├── docs/               # Documentation
│   ├── architecture.md
│   └── demo-script.md
│
└── bob_sessions/       # IBM Bob development evidence
    ├── 01_architecture/
    ├── 02_project_scaffold/
    └── ...
```

---

## Agent Architecture

### Agent 1 — Incident Detective
Parses the incident, analyzes logs and stack traces, identifies candidate files, builds an evidence inventory.

### Agent 2 — Root Cause Analyst
Inspects evidence from the Detective, traces execution flow, generates hypotheses with confidence levels and supporting/contradicting evidence.

### Agent 3 — Fix Engineer
Designs the smallest reasonable fix, produces a file diff, explains every change. Does not modify unrelated code.

### Agent 4 — Test Engineer
Generates regression tests and edge-case tests. Each test explains what bug it prevents and why it is relevant.

### Agent 5 — Security Engineer
Analyzes the proposed fix for injection, auth, input validation, secrets exposure, data leakage, and OWASP-style issues.

### Agent 6 — Independent Reviewer
Acts as a critic. Evaluates whether the fix addresses the root cause, whether tests are sufficient, whether assumptions are supported. Can reject and trigger re-iteration (max 3 iterations by default).

### Orchestrator
Coordinates agents in sequence. Manages the iteration loop when the reviewer rejects a solution. Persists all results to the database.

---

## IBM Bob Usage

IBM Bob 2.0 was used as the primary development environment throughout this project.

Evidence of Bob sessions is documented in [`/bob_sessions`](./bob_sessions/).

Bob was used for:
- **Architecture design** — analyzing requirements, proposing technology stack and data model
- **Project scaffold** — generating monorepo structure, tsconfig, Prisma schema
- **Backend development** — Express routes, Prisma models, middleware, validation
- **Agent architecture** — designing the AIProvider, Orchestrator, and all 6 agent contracts
- **Demo data design** — crafting realistic INC-0042 demo scenario with intentional bug
- **Frontend development** — Next.js pages, component hierarchy, Tailwind theme
- **Integration** — end-to-end wiring between orchestrator and database
- **Testing** — writing and running API integration tests
- **Debugging** — diagnosing backend startup issue (EADDRINUSE — server was already running)
- **Documentation** — README, demo script, architecture docs

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone / navigate to the project
cd TraceForge

# Install backend dependencies
cd backend && npm install

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

**Backend** (`backend/.env`):

```env
NODE_ENV=development
DATABASE_URL="file:./dev.db"
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
DEMO_MODE=true
FRONTEND_URL=http://localhost:3000
MAX_ITERATIONS=3
```

Copy from `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

> **Note:** `DEMO_MODE=true` uses pre-crafted analysis responses. Set to `false` and provide a real `OPENAI_API_KEY` for live AI analysis.

---

## Running Locally

### Start Backend

```bash
cd backend
npm run build
node dist/index.js
# OR for development with auto-reload:
npm run dev
```

Backend runs on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Demo Instructions

1. Open `http://localhost:3000`
2. Click **"Load Demo Incident"** on the dashboard (or navigate to **Incidents → Demo**)
3. You will see **INC-0042**: Payment checkout failure — CRITICAL
4. Click **"Investigate Incident"**
5. Watch the investigation timeline progress in real-time
6. Navigate through the tabs:
   - **Evidence** — the evidence chain connecting incident → root cause
   - **Root Cause** — HIGH confidence hypothesis with supporting evidence
   - **Fix** — minimal patch diff (+5/-2 lines in one file)
   - **Tests** — 3 new regression tests + 4 edge cases
   - **Security** — 5-category security review (PASSED WITH WARNINGS)
   - **Review** — APPROVED by the Independent Reviewer
   - **Pull Request** — generate the PR package
   - **Knowledge Card** — export the incident knowledge document

The complete demo takes approximately 2–3 minutes.

---

## Testing

```bash
cd backend
npm test
```

8 tests covering health, incidents CRUD, validation, and demo API.

---

## Future Roadmap

- **P2:** GitHub OAuth and real PR creation
- **P2:** Real repository file fetching via GitHub API
- **P2:** Team collaboration and assignment
- **P2:** Incident similarity search
- **P2:** Slack/PagerDuty integrations
- **P3:** Multi-model AI provider support
- **P3:** Custom agent configuration

---

## Hackathon Submission

**Product:** TraceForge — Evidence-Driven Incident Response  
**Category:** Developer Tools / AI Agents  
**Demo:** Built-in (INC-0042, no external services required)  
**IBM Bob:** Core development environment, documented in `/bob_sessions`

> TraceForge is NOT "ChatGPT for debugging."  
> TraceForge IS an evidence-driven, multi-agent incident-response workflow that takes developers from production failure to independently reviewed, tested and verified resolution.
