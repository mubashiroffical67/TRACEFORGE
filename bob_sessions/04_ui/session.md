# Bob Session 04 — Frontend UI

## Session Summary

**Task:** Build the complete Next.js frontend application.

**IBM Bob capabilities used:**
- Next.js App Router structure design
- Component hierarchy design
- TypeScript-strict React component implementation
- Tailwind CSS theming (dark developer aesthetic)
- Real-time polling implementation

## Component Architecture

```
app/
  layout.tsx           — Root layout with Sidebar
  page.tsx             — Dashboard with stats + recent incidents
  incidents/
    page.tsx           — Incidents list with filter + search
    new/page.tsx       — Incident creation form
    [id]/page.tsx      — Incident detail (polling, demo redirect)
  investigations/page.tsx
  knowledge/page.tsx
  repositories/page.tsx
  settings/page.tsx

components/
  layout/Sidebar.tsx   — Navigation with demo shortcut
  ui/
    Badge.tsx          — Semantic severity badges
    Button.tsx         — With loading state + icon
    Card.tsx           — Surface container
    Spinner.tsx        — Loading states
  incident/
    IncidentWorkspace.tsx  — Tab container + top bar
    TimelinePanel.tsx      — Real-time investigation timeline
    EvidenceChain.tsx      — Visual evidence chain
    RootCausePanel.tsx     — Hypotheses with evidence sections
    PatchPanel.tsx         — File diff viewer
    TestPanel.tsx          — Test results + generated test code
    SecurityPanel.tsx      — Security findings
    ReviewPanel.tsx        — Independent review result
    KnowledgeCardPanel.tsx — Knowledge card + export
    PRPanel.tsx            — PR generation
```

## Key UI Design Decisions

### Dark Developer Theme
Custom Tailwind palette (`forge-*` colors):
- `bg: #0d1117` — GitHub-inspired dark background
- `surface: #161b22` — Cards and panels
- `accent: #58a6ff` — Primary blue for interactions
- `text: #e6edf3` — High-contrast readable text

### Real-Time Polling
The incident page polls every 2 seconds while `investigation.status === 'RUNNING'`:
```typescript
useEffect(() => {
  if (status === 'RUNNING') {
    const interval = setInterval(() => api.getIncident(id).then(setIncident), 2000);
    return () => clearInterval(interval);
  }
}, [incident, id]);
```

### Evidence Chain Visualization
Numbered steps with connector lines, color-coded by category (red = problem, green = fix, blue = verification).

### Diff Viewer
Custom hunk renderer without external diff library dependency. Lines prefixed with `+`/`-`/ are colored green/red/gray.

## Build Result

```
Route (app)                              Size     First Load JS
┌ ○ /                                    4.04 kB        99.3 kB
├ λ /incidents/[id]                      15.5 kB         111 kB
├ ○ /incidents/new                       2.7 kB         94.4 kB
...
✓ Compiled successfully — 10 routes
```

All routes compile clean. No TypeScript errors.
