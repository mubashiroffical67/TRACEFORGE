import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export const investigationRoutes = Router();

// GET /api/investigations/:id
investigationRoutes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inv = await prisma.investigation.findUnique({
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
    if (!inv) return next(createError('Investigation not found', 404));
    res.json(inv);
  } catch (e) { next(e); }
});

// GET /api/investigations/incident/:incidentId
investigationRoutes.get('/incident/:incidentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inv = await prisma.investigation.findUnique({
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
    if (!inv) return next(createError('Investigation not found', 404));
    res.json(inv);
  } catch (e) { next(e); }
});
