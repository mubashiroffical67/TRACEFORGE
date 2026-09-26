# Bob Session 03 — Demo Incident + Agent System

## Session Summary

**Task:** Design and implement the demo scenario (INC-0042) and all 6 AI agents.

**IBM Bob capabilities used:**
- Demo data design (realistic bug scenario)
- Agent contract design (typed interfaces)
- AIProvider implementation with dual mode (demo/live)
- Orchestrator implementation with iteration loop

## Demo Scenario Design

### INC-0042: Payment Checkout Failure

**The bug:** `paymentMethod` is typed as `optional` in the `PaymentRequest` interface but never validated at runtime. When a client submits a checkout request without `paymentDetails`, `paymentDetails?.paymentMethod` evaluates to `undefined`, which is passed to `processPayment()`, which immediately reads `paymentMethod.token` — causing a `TypeError`.

**Why this is realistic:**
- TypeScript optional fields are a common source of null-dereference bugs
- The bug is intermittent (only ~12% of requests) — harder to reproduce
- The stack trace is clear enough to start investigation
- The fix is genuinely minimal (5 lines in 1 file)
- The test gap is real (existing tests covered happy path, not missing-field case)

### Files in Demo Repository

```
src/services/paymentService.ts     — contains the bug (line 42)
src/controllers/checkoutController.ts — passes undefined paymentMethod
src/utils/validator.ts             — shows missing validation
tests/paymentService.test.ts       — shows missing test coverage
src/services/orderService.ts       — context file
```

## Agent Implementation

### Key AIProvider Design

```typescript
// Single abstraction with demo/live branching
class AIProvider {
  isDemo(): boolean  // true if no real API key
  runDetective(incident, repoFiles): DetectiveOutput
  runRootCause(incident, detective, repoFiles): RootCauseOutput
  runFixer(incident, rootCause, repoFiles): PatchOutput
  runTestEngineer(incident, patch, repoFiles): TestOutput
  runSecurity(incident, patch): SecurityOutput
  runReviewer(incident, rootCause, patch, tests, security): ReviewOutput
}
```

All demo methods return carefully crafted responses that:
- Reference real evidence (exact line numbers, real code snippets)
- Include realistic confidence scores with explanations
- Have supporting AND contradicting evidence (not just positive signals)
- Include a simplification note in the review (alternative approach discussion)

### Orchestrator Iteration Loop

```typescript
while (!approved && iterationCount < maxIterations) {
  iterationCount++;
  patch = await ai.runFixer(...)
  tests = await ai.runTestEngineer(...)
  security = await ai.runSecurity(...)
  review = await ai.runReviewer(...)
  if (review.outcome === 'APPROVED') approved = true;
}
```

### Timeline Events

Each agent step creates a `TimelineEvent` record with:
- `startedAt` timestamp
- `completedAt` timestamp  
- `durationMs` for performance measurement

This enables the real-time investigation timeline UI.

## Test Results

```
8 tests passing:
✓ GET /api/health returns 200
✓ POST /api/incidents creates an incident
✓ GET /api/incidents returns list
✓ GET /api/incidents/:id returns incident
✓ GET /api/incidents/stats returns stats
✓ POST /api/incidents validates required fields
✓ POST /api/demo/seed creates demo incident
✓ GET /api/demo/incident returns demo incident
```
