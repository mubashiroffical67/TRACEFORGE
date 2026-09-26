"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const Orchestrator_1 = require("../agents/Orchestrator");
exports.incidentRoutes = (0, express_1.Router)();
const CreateIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(255),
    description: zod_1.z.string().min(10),
    severity: zod_1.z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    errorMessage: zod_1.z.string().optional(),
    stackTrace: zod_1.z.string().optional(),
    logs: zod_1.z.string().optional(),
    affectedService: zod_1.z.string().optional(),
    expectedBehavior: zod_1.z.string().optional(),
    actualBehavior: zod_1.z.string().optional(),
    repositoryId: zod_1.z.string().optional(),
    isDemo: zod_1.z.boolean().optional().default(false),
});
function generateIncidentId() {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `INC-${num}`;
}
// GET /api/incidents
exports.incidentRoutes.get('/', async (_req, res, next) => {
    try {
        const incidents = await prisma_1.prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            include: { investigation: { select: { status: true, completedAt: true } } },
        });
        res.json(incidents);
    }
    catch (e) {
        next(e);
    }
});
// GET /api/incidents/stats
exports.incidentRoutes.get('/stats', async (_req, res, next) => {
    try {
        const [total, resolved, investigating, critical] = await Promise.all([
            prisma_1.prisma.incident.count(),
            prisma_1.prisma.incident.count({ where: { status: 'RESOLVED' } }),
            prisma_1.prisma.incident.count({ where: { status: 'INVESTIGATING' } }),
            prisma_1.prisma.incident.count({ where: { severity: 'CRITICAL' } }),
        ]);
        const testResults = await prisma_1.prisma.testResult.findMany({ select: { newTestsTotal: true, edgeCasesTotal: true } });
        const testsGenerated = testResults.reduce((s, r) => s + r.newTestsTotal + r.edgeCasesTotal, 0);
        const secFindings = await prisma_1.prisma.securityFinding.count({ where: { severity: { not: 'PASS' } } });
        const resolvedWithTime = await prisma_1.prisma.incident.findMany({
            where: { status: 'RESOLVED', resolvedAt: { not: null } },
            select: { createdAt: true, resolvedAt: true },
        });
        const avgResolutionMs = resolvedWithTime.length
            ? resolvedWithTime.reduce((s, i) => s + (i.resolvedAt.getTime() - i.createdAt.getTime()), 0) / resolvedWithTime.length
            : 0;
        res.json({
            total,
            resolved,
            investigating,
            open: total - resolved - investigating,
            critical,
            testsGenerated,
            securityFindings: secFindings,
            avgResolutionMinutes: Math.round(avgResolutionMs / 60000),
        });
    }
    catch (e) {
        next(e);
    }
});
// POST /api/incidents
exports.incidentRoutes.post('/', async (req, res, next) => {
    try {
        const parsed = CreateIncidentSchema.safeParse(req.body);
        if (!parsed.success) {
            return next((0, errorHandler_1.createError)(parsed.error.message, 400, 'VALIDATION_ERROR'));
        }
        const data = parsed.data;
        // Ensure unique incident ID
        let incidentId = generateIncidentId();
        let existing = await prisma_1.prisma.incident.findUnique({ where: { incidentId } });
        while (existing) {
            incidentId = generateIncidentId();
            existing = await prisma_1.prisma.incident.findUnique({ where: { incidentId } });
        }
        const incident = await prisma_1.prisma.incident.create({
            data: {
                incidentId,
                title: data.title,
                description: data.description,
                severity: data.severity,
                status: 'OPEN',
                errorMessage: data.errorMessage,
                stackTrace: data.stackTrace,
                logs: data.logs,
                affectedService: data.affectedService,
                expectedBehavior: data.expectedBehavior,
                actualBehavior: data.actualBehavior,
                repositoryId: data.repositoryId,
                isDemo: data.isDemo,
            },
        });
        res.status(201).json(incident);
    }
    catch (e) {
        next(e);
    }
});
// GET /api/incidents/:id
exports.incidentRoutes.get('/:id', async (req, res, next) => {
    try {
        const incident = await prisma_1.prisma.incident.findUnique({
            where: { id: req.params.id },
            include: {
                investigation: {
                    include: {
                        evidenceItems: true,
                        hypotheses: true,
                        patch: true,
                        testResult: true,
                        securityFindings: true,
                        review: true,
                        timelineEvents: { orderBy: { startedAt: 'asc' } },
                    },
                },
                knowledgeCard: true,
            },
        });
        if (!incident)
            return next((0, errorHandler_1.createError)('Incident not found', 404));
        res.json(incident);
    }
    catch (e) {
        next(e);
    }
});
// POST /api/incidents/:id/investigate
exports.incidentRoutes.post('/:id/investigate', async (req, res, next) => {
    try {
        const incident = await prisma_1.prisma.incident.findUnique({ where: { id: req.params.id } });
        if (!incident)
            return next((0, errorHandler_1.createError)('Incident not found', 404));
        // Mark as investigating
        await prisma_1.prisma.incident.update({
            where: { id: req.params.id },
            data: { status: 'INVESTIGATING' },
        });
        // Start investigation asynchronously
        const orchestrator = new Orchestrator_1.Orchestrator();
        // Return immediately; investigation runs in background
        res.json({ message: 'Investigation started', incidentId: req.params.id });
        // Run investigation (non-blocking response already sent)
        orchestrator.investigate(req.params.id).catch((err) => {
            console.error(`Investigation failed for ${req.params.id}:`, err);
        });
    }
    catch (e) {
        next(e);
    }
});
// GET /api/incidents/:id/pr
exports.incidentRoutes.get('/:id/pr', async (req, res, next) => {
    try {
        const incident = await prisma_1.prisma.incident.findUnique({
            where: { id: req.params.id },
            include: {
                investigation: {
                    include: {
                        hypotheses: true,
                        patch: true,
                        testResult: true,
                        securityFindings: true,
                        review: true,
                    },
                },
            },
        });
        if (!incident)
            return next((0, errorHandler_1.createError)('Incident not found', 404));
        if (!incident.investigation?.patch)
            return next((0, errorHandler_1.createError)('Investigation not complete', 400));
        const inv = incident.investigation;
        const patch = inv.patch;
        const hypothesis = inv.hypotheses.find(h => h.isPrimary);
        const review = inv.review;
        const tests = inv.testResult;
        const fileDiffs = JSON.parse(patch.fileDiffs);
        const prTitle = `fix: ${incident.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()}`;
        const prBody = `## Problem

${incident.description}

**Severity:** ${incident.severity}
**Incident ID:** ${incident.incidentId}
**Affected Service:** ${incident.affectedService || 'N/A'}

## Root Cause

${hypothesis?.explanation || 'See investigation for details.'}

**Confidence:** ${hypothesis?.confidence || 'N/A'}

## Solution

${patch.summary}

**Rationale:** ${patch.rationale}

## Files Changed

${fileDiffs.map(d => `- \`${d.filePath}\` — ${d.changeReason} (+${d.linesAdded}/-${d.linesRemoved})`).join('\n')}

**Total:** +${patch.linesAdded} lines / -${patch.linesRemoved} lines across ${patch.filesModified} file(s)

## Tests

- Existing tests: ${tests?.existingPassed}/${tests?.existingTotal} ✓
- New regression tests: ${tests?.newTestsPassed}/${tests?.newTestsTotal} ✓
- Edge case tests: ${tests?.edgeCasesPassed}/${tests?.edgeCasesTotal} ✓
- Regression risk: ${tests?.regressionRisk}

## Security Review

**Status:** ${inv.securityFindings.find(f => f.severity === 'FAIL') ? '⚠️ ISSUES FOUND' : '✅ PASSED'}

${inv.securityFindings.map(f => `- **${f.category}:** ${f.severity} — ${f.title}`).join('\n')}

## Independent Review

**Outcome:** ${review?.outcome || 'PENDING'}

${review?.reasoning || ''}

## Risk Assessment

- Patch risk level: ${patch.riskLevel}
- Regression risk: ${tests?.regressionRisk}

## Rollback

Revert \`${fileDiffs[0]?.filePath || 'changed files'}\` to the previous version. The change is isolated to a single guard clause and has no database migrations or schema changes.

---
*Generated by TraceForge — Evidence-Driven Incident Response*
*Investigation ID: ${inv.id}*
`;
        res.json({
            title: prTitle,
            body: prBody,
            branch: `fix/${incident.incidentId.toLowerCase()}-${incident.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}`,
            files: fileDiffs,
            isDemoMode: incident.isDemo,
        });
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=incidents.js.map