"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investigationRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
exports.investigationRoutes = (0, express_1.Router)();
// GET /api/investigations/:id
exports.investigationRoutes.get('/:id', async (req, res, next) => {
    try {
        const inv = await prisma_1.prisma.investigation.findUnique({
            where: { id: req.params.id },
            include: {
                evidenceItems: true,
                hypotheses: { orderBy: { rank: 'asc' } },
                patch: true,
                testResult: true,
                securityFindings: true,
                review: true,
                timelineEvents: { orderBy: { startedAt: 'asc' } },
            },
        });
        if (!inv)
            return next((0, errorHandler_1.createError)('Investigation not found', 404));
        res.json(inv);
    }
    catch (e) {
        next(e);
    }
});
// GET /api/investigations/incident/:incidentId
exports.investigationRoutes.get('/incident/:incidentId', async (req, res, next) => {
    try {
        const inv = await prisma_1.prisma.investigation.findUnique({
            where: { incidentId: req.params.incidentId },
            include: {
                evidenceItems: true,
                hypotheses: { orderBy: { rank: 'asc' } },
                patch: true,
                testResult: true,
                securityFindings: true,
                review: true,
                timelineEvents: { orderBy: { startedAt: 'asc' } },
            },
        });
        if (!inv)
            return next((0, errorHandler_1.createError)('Investigation not found', 404));
        res.json(inv);
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=investigations.js.map