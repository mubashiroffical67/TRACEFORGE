"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const demoData_1 = require("../demo/demoData");
exports.demoRoutes = (0, express_1.Router)();
// POST /api/demo/seed — seeds the demo incident if it doesn't exist
exports.demoRoutes.post('/seed', async (_req, res, next) => {
    try {
        const existing = await prisma_1.prisma.incident.findUnique({
            where: { incidentId: demoData_1.DEMO_INCIDENT.incidentId },
        });
        if (existing) {
            res.json({ message: 'Demo incident already exists', incident: existing });
            return;
        }
        const incident = await prisma_1.prisma.incident.create({
            data: {
                incidentId: demoData_1.DEMO_INCIDENT.incidentId,
                title: demoData_1.DEMO_INCIDENT.title,
                description: demoData_1.DEMO_INCIDENT.description,
                severity: demoData_1.DEMO_INCIDENT.severity,
                status: 'OPEN',
                errorMessage: demoData_1.DEMO_INCIDENT.errorMessage,
                stackTrace: demoData_1.DEMO_INCIDENT.stackTrace,
                logs: demoData_1.DEMO_INCIDENT.logs,
                affectedService: demoData_1.DEMO_INCIDENT.affectedService,
                expectedBehavior: demoData_1.DEMO_INCIDENT.expectedBehavior,
                actualBehavior: demoData_1.DEMO_INCIDENT.actualBehavior,
                isDemo: true,
            },
        });
        res.json({ message: 'Demo incident created', incident });
    }
    catch (e) {
        next(e);
    }
});
// GET /api/demo/incident — get the demo incident
exports.demoRoutes.get('/incident', async (_req, res, next) => {
    try {
        const incident = await prisma_1.prisma.incident.findUnique({
            where: { incidentId: demoData_1.DEMO_INCIDENT.incidentId },
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
        res.json(incident);
    }
    catch (e) {
        next(e);
    }
});
// DELETE /api/demo/reset — resets demo data for a fresh demo
exports.demoRoutes.delete('/reset', async (_req, res, next) => {
    try {
        const incident = await prisma_1.prisma.incident.findUnique({
            where: { incidentId: demoData_1.DEMO_INCIDENT.incidentId },
        });
        if (incident) {
            const investigation = await prisma_1.prisma.investigation.findUnique({
                where: { incidentId: incident.id },
            });
            if (investigation) {
                await prisma_1.prisma.timelineEvent.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.evidence.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.rootCauseHypothesis.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.patch.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.testResult.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.securityFinding.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.review.deleteMany({ where: { investigationId: investigation.id } });
                await prisma_1.prisma.investigation.delete({ where: { id: investigation.id } });
            }
            await prisma_1.prisma.knowledgeCard.deleteMany({ where: { incidentId: incident.id } });
            await prisma_1.prisma.incident.delete({ where: { id: incident.id } });
        }
        res.json({ message: 'Demo data reset' });
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=demo.js.map