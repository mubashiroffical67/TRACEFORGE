import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { DEMO_INCIDENT } from '../demo/demoData';

export const demoRoutes = Router();

// POST /api/demo/seed — seeds the demo incident if it doesn't exist
demoRoutes.post('/seed', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.incident.findUnique({
      where: { incidentId: DEMO_INCIDENT.incidentId },
    });

    if (existing) {
      res.json({ message: 'Demo incident already exists', incident: existing });
      return;
    }

    const incident = await prisma.incident.create({
      data: {
        incidentId: DEMO_INCIDENT.incidentId,
        title: DEMO_INCIDENT.title,
        description: DEMO_INCIDENT.description,
        severity: DEMO_INCIDENT.severity,
        status: 'OPEN',
        errorMessage: DEMO_INCIDENT.errorMessage,
        stackTrace: DEMO_INCIDENT.stackTrace,
        logs: DEMO_INCIDENT.logs,
        affectedService: DEMO_INCIDENT.affectedService,
        expectedBehavior: DEMO_INCIDENT.expectedBehavior,
        actualBehavior: DEMO_INCIDENT.actualBehavior,
        isDemo: true,
      },
    });

    res.json({ message: 'Demo incident created', incident });
  } catch (e) { next(e); }
});

// GET /api/demo/incident — get the demo incident
demoRoutes.get('/incident', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { incidentId: DEMO_INCIDENT.incidentId },
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
  } catch (e) { next(e); }
});

// DELETE /api/demo/reset — resets demo data for a fresh demo
demoRoutes.delete('/reset', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { incidentId: DEMO_INCIDENT.incidentId },
    });

    if (incident) {
      const investigation = await prisma.investigation.findUnique({
        where: { incidentId: incident.id },
      });

      if (investigation) {
        await prisma.timelineEvent.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.evidence.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.rootCauseHypothesis.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.patch.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.testResult.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.securityFinding.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.review.deleteMany({ where: { investigationId: investigation.id } });
        await prisma.investigation.delete({ where: { id: investigation.id } });
      }

      await prisma.knowledgeCard.deleteMany({ where: { incidentId: incident.id } });
      await prisma.incident.delete({ where: { id: incident.id } });
    }

    res.json({ message: 'Demo data reset' });
  } catch (e) { next(e); }
});
