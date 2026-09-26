# TraceForge Demo Script

## 2–3 Minute Hackathon Presentation

---

### 0:00 — The Problem (20 seconds)

> "When production software breaks, engineering teams spend hours manually reading logs, tracing stack traces, and guessing at root causes. Fixes go unreviewed. Tests are skipped. Institutional knowledge is lost."

> "TraceForge solves this. It connects incident evidence, repository context, root-cause analysis, code changes, testing, security review, and verification into one workflow."

**Action:** Show the TraceForge dashboard. Point to the agent workflow diagram at the bottom.

---

### 0:20 — The Incident (20 seconds)

> "This is INC-0042 — a CRITICAL production incident. Customers are receiving 500 errors during checkout. Revenue impact: $3,200/hour."

**Action:** Click the demo incident card. Show:
- Severity: CRITICAL
- Error message: `TypeError: Cannot read properties of undefined (reading 'token')`
- Stack trace pointing to `paymentService.ts:42`
- Logs showing 12% failure rate

---

### 0:40 — Start Investigation (20 seconds)

> "Instead of manually reading the stack trace and grepping the codebase, we hit Investigate."

**Action:** Click **"Investigate Incident"**. Show the Investigation Timeline panel as steps appear in real-time:
- Incident Detective
- Root Cause Analyst
- Fix Engineer
- Test Engineer
- Security Engineer
- Independent Reviewer
- Verification

---

### 1:00 — Evidence Chain (20 seconds)

> "TraceForge doesn't just say 'the bug is in paymentService.js'. It builds an evidence chain."

**Action:** Click the **Evidence** tab. Walk through the chain:
- Stack trace → pinpoints `paymentService.ts:42`
- Log analysis → confirms 12% failure rate
- Code path → checkout controller passes undefined
- TypeScript interface → `paymentMethod` is optional with no runtime guard
- Test gap → existing tests don't cover this case

---

### 1:20 — Root Cause (20 seconds)

> "The Root Cause Analyst evaluates all evidence and generates hypotheses."

**Action:** Click the **Root Cause** tab. Show:
- Primary hypothesis: HIGH confidence (92%)
- Explanation: "Missing validation of paymentMethod before use"
- Supporting evidence: 5 signals
- Contradicting evidence: 1 unresolved
- Alternative hypothesis: Database timeout — LOW confidence (8%)

> "It also distinguishes between what we know, what contradicts, and what's missing. This is not speculation presented as fact."

---

### 1:40 — The Fix (20 seconds)

> "The Fix Engineer proposes the smallest safe change."

**Action:** Click the **Fix** tab. Show:
- 1 file modified
- +5 lines / -2 lines
- A single null guard: `if (!request.paymentMethod) { return error; }`
- Rationale: why this is the right place to add the guard

> "It does not refactor the entire codebase. Smallest safe change first."

---

### 2:00 — Tests + Security (20 seconds)

**Action:** Click the **Tests** tab. Show:
- 2 existing tests still pass
- 3 new regression tests generated
- 4 edge cases (null, empty token, etc.)
- Test code visible and explains exactly what bug each test prevents

**Action:** Click the **Security** tab. Show:
- 5-category security review
- PASSED WITH WARNINGS
- Pre-existing authorization concern flagged (out of scope, not blocking)

---

### 2:20 — Independent Review (20 seconds)

> "This is the differentiator. An independent critic agent reviews the entire solution."

**Action:** Click the **Review** tab. Show:
- Outcome: APPROVED
- Checklist: addresses root cause ✓, sufficient evidence ✓, tests sufficient ✓, security clear ✓
- Simplification note: alternative approach discussed
- The reviewer explains its reasoning — it does not simply agree

---

### 2:40 — PR + Knowledge Card (20 seconds)

**Action:** Click **Pull Request** → **Generate PR Package**. Show the PR title, branch name, and full PR description auto-generated.

**Action:** Click the **Knowledge Card** tab. Show:
- Root cause summary
- Prevention recommendations (5 items)
- Similar bug patterns
- Click **Export Markdown**

> "Every resolved incident builds institutional knowledge. The next developer doesn't start from zero."

---

### 3:00 — Close

> "TraceForge takes a production incident and produces an evidence chain, minimal fix, regression tests, security review, and independent verification — in under 3 minutes."

> "Built with IBM Bob 2.0 as the core development environment."

---

## Key Points to Emphasize

1. **Not a chatbot** — structured, agent-based workflow with defined outputs
2. **Evidence chain** — every conclusion is linked to evidence
3. **Independent review** — the reviewer can reject and trigger re-iteration
4. **Minimal fix** — smallest safe change, not a refactor
5. **Knowledge preservation** — every incident produces a reusable knowledge card
6. **Demo mode** — this works without any external services or real GitHub repository

## What to Avoid Saying

- Do NOT claim tests were actually executed (they are generated, not run, in demo mode)
- Do NOT claim the PR was pushed to GitHub (it generates the PR content, push requires integration)
- Do NOT claim the 92% confidence is a mathematical probability (it is an AI estimate)
