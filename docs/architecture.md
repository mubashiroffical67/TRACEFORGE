# TraceForge Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User (Browser)                        │
│                    Next.js 14 Frontend                       │
│  Dashboard │ Incidents │ Repositories │ Knowledge │ Settings │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP (REST API)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express API (Port 3001)                     │
│  /api/incidents  /api/demo  /api/investigations               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Orchestrator                            │
│  Coordinates agent pipeline, manages iteration loop          │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Det. │→│ Root   │→│ Fix    │→│ Test   │→│ Sec.   │→│ Review │
│ ect. │ │ Cause  │ │ Eng.   │ │ Eng.   │ │ Eng.   │ │ Agent  │
└──────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────┬───┘
                                                           │
                                    ┌──────────────────────┘
                                    │  APPROVED → Verification → PR
                                    │  NEEDS_REVISION → loop back to Fix
                                    │  (max 3 iterations)
                                    ▼
                             ┌─────────────┐
                             │  AI Provider │
                             │  OpenAI / Demo│
                             └─────────────┘

                                    │
                                    ▼
                          ┌─────────────────┐
                          │  SQLite (Prisma) │
                          │  Incidents        │
                          │  Investigations   │
                          │  Evidence         │
                          │  Hypotheses       │
                          │  Patches          │
                          │  Tests            │
                          │  SecurityFindings │
                          │  Reviews          │
                          │  KnowledgeCards   │
                          │  TimelineEvents   │
                          └─────────────────┘
```

## Agent Pipeline

### Sequential + Iterative

```
Incident Input
      │
      ▼
Agent 1: Incident Detective
  - Parse incident, logs, stack trace
  - Identify candidate files
  - Build evidence inventory
      │
      ▼
Agent 2: Root Cause Analyst
  - Evaluate evidence
  - Generate hypotheses
  - Assign confidence levels
      │
      ▼
┌─── ITERATION LOOP (max 3) ───────────────────────────┐
│                                                       │
│  Agent 3: Fix Engineer                                │
│    - Design minimal fix                               │
│    - Produce file diffs                               │
│                                                       │
│  Agent 4: Test Engineer                               │
│    - Generate regression tests                        │
│    - Generate edge cases                              │
│                                                       │
│  Agent 5: Security Engineer                           │
│    - Analyze patch for vulnerabilities                │
│                                                       │
│  Agent 6: Independent Reviewer                        │
│    - APPROVED → exit loop                             │
│    - NEEDS_REVISION → loop again                      │
│    - INSUFFICIENT_EVIDENCE → exit with warning        │
│                                                       │
└───────────────────────────────────────────────────────┘
      │
      ▼
Verification + Knowledge Card Generation
      │
      ▼
Resolution (RESOLVED status, PR available)
```

## Data Model

```
Incident (1) ──────────────────────── (0..1) Investigation
                                               │
                                    ┌──────────┼──────────────┐
                                    │          │              │
                                 Evidence  Hypothesis      Patch
                                    │          │              │
                               TimelineEvent  (n)         TestResult
                                           SecurityFinding
                                           Review
                                    │
                              KnowledgeCard ── Incident
```

## AI Provider Interface

The `AIProvider` class provides a clean interface between the orchestrator and the AI backend.

- **Demo mode** (default): Returns pre-crafted, realistic responses for INC-0042. No API calls made.
- **Live mode**: Calls OpenAI GPT-4o with structured JSON prompts. Returns typed results.

Switching between modes: set `DEMO_MODE=false` and `OPENAI_API_KEY=sk-...` in backend `.env`.

## Security Considerations

- No secrets stored in database
- API keys read from environment variables only
- Input validated via Zod schemas on all API routes
- CORS restricted to frontend origin
- No arbitrary command execution
- Demo repository files are static strings, not executed
