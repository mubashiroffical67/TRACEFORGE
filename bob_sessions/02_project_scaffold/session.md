# Bob Session 02 — Project Scaffold

## Session Summary

**Task:** Create the monorepo structure, all configuration files, and package manifests.

**IBM Bob capabilities used:**
- File generation across multiple directories
- TypeScript configuration
- Prisma schema design
- Tailwind CSS configuration
- Next.js configuration

## Files Created

### Root
- `package.json` — npm workspace root with `concurrently` for running both services

### Backend
- `backend/package.json` — Express + Prisma + TypeScript + Jest
- `backend/tsconfig.json` — strict TypeScript with CommonJS output to `dist/`
- `backend/prisma/schema.prisma` — 10 Prisma models covering the full investigation lifecycle
- `backend/.env.example` — documented environment variables

### Frontend
- `frontend/package.json` — Next.js 14 + Tailwind + lucide-react
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js` — custom `forge-` color palette for developer aesthetic
- `frontend/next.config.js` — API proxy rewrites to backend
- `frontend/postcss.config.js`

## Prisma Schema Design

10 models: `User`, `Repository`, `Incident`, `Investigation`, `Evidence`, `RootCauseHypothesis`, `Patch`, `TestResult`, `SecurityFinding`, `Review`, `TimelineEvent`, `KnowledgeCard`

Key design decisions:
- `Investigation.currentStep` enables real-time UI polling
- `TimelineEvent.durationMs` enables measuring agent performance
- JSON fields (stored as strings in SQLite) for arrays like `supportingEvidence`, `affectedFiles`
- `isDemo` flags on `Incident` and `Repository` for clean demo/real separation

## Commands Run

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## Result

Database created at `backend/prisma/dev.db` with all 10 tables.
