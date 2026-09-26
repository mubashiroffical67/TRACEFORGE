# Bob Session 05 — Integration & Debugging

## Session Summary

**Task:** Wire everything together, run the full end-to-end workflow, and diagnose startup issues.

**IBM Bob capabilities used:**
- Integration testing via PowerShell REST calls
- Root cause diagnosis of backend startup issue
- Systematic diagnostic procedure (not guess-based)

## Integration Testing Results

End-to-end smoke test via PowerShell:

```powershell
# Seed demo → Investigate → Verify results
$demo = POST /api/demo/seed
$inv  = POST /api/incidents/{id}/investigate
$result = GET /api/incidents/{id}
```

### Results (all passing):
| Check | Result |
|-------|--------|
| Demo seeded | ✓ INC-0042 |
| Investigation triggered | ✓ |
| Post-investigation status | ✓ RESOLVED |
| Investigation status | ✓ COMPLETED |
| Evidence items | ✓ 5 |
| Hypotheses | ✓ 2 (1 primary HIGH confidence) |
| Patch summary | ✓ Generated |
| New tests | ✓ 3 |
| Security findings | ✓ 5 |
| Review outcome | ✓ APPROVED |
| Knowledge card | ✓ VERIFIED |

## Debugging Session — Backend Startup

### Symptom
Background process started with `node dist/index.js` appeared to exit silently (empty log).

### Diagnostic Procedure Used
1. Ruled out Prisma: `node -e "require('@prisma/client')"` — worked
2. Confirmed `@prisma/client` resolves to workspace root `node_modules/@prisma/client`
3. Ran `node --trace-uncaught dist/index.js` directly in foreground
4. **Actual error:** `EADDRINUSE: address already in use :::3001`

### Root Cause
The server **was already running** from a previous successful background start. The background process tool captures output asynchronously — the earlier `CANCELED` output actually showed the server had started successfully. The subsequent attempts failed because port 3001 was occupied by the already-running server.

### Fix
No code change required. The backend was confirmed running via:
```
GET http://localhost:3001/api/health → 200 OK
{"status":"ok","service":"TraceForge API","demoMode":true}
```

### Lesson
When a background Node.js process appears to exit silently:
1. Check if the port is already in use first
2. Run `node --trace-uncaught` in the foreground to capture real error output
3. Distinguish between "process crashed" and "process already running on that port"
