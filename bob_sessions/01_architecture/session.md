# Bob Session 01 — Architecture Design

## Session Summary

**Task:** Analyze the TraceForge requirements document and produce a concrete architecture proposal.

**IBM Bob capabilities used:**
- Requirements analysis from the master prompt
- Technology stack selection
- Data model design
- Agent architecture design

## Key Decisions Made

### Technology Stack

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind | SSR capability, modern DX, no separate API layer needed |
| Backend | Express + TypeScript | Lightweight, full control over API shape |
| Database | SQLite via Prisma | Zero-config for hackathon, easy migration to Postgres later |
| AI | OpenAI GPT-4o with demo fallback | Structured JSON output via `response_format`, demo mode works without API key |
| Monorepo | npm workspaces | Single repo, shared types possible |

### Agent Architecture Decisions

1. **AIProvider as abstraction layer** — all AI calls go through a single class with a `isDemo()` flag. This means the entire system works in demo mode without any API key.

2. **Orchestrator owns persistence** — agents return pure data; the Orchestrator writes to the database. Agents are stateless.

3. **Iteration loop is configurable** — `MAX_ITERATIONS` env var (default: 3) prevents infinite loops.

4. **Demo data is static TypeScript** — not loaded from files, avoiding filesystem dependencies during demo.

### Data Model Design

14 database entities designed to capture the full investigation lifecycle:
- `Incident` → `Investigation` → `Evidence`, `Hypothesis`, `Patch`, `TestResult`, `SecurityFinding`, `Review`, `TimelineEvent`
- `KnowledgeCard` links back to `Incident`

## Architecture Diagram Produced

See [`docs/architecture.md`](../../docs/architecture.md) for the full diagram.
