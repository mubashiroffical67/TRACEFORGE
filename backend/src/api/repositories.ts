import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const repositoryRoutes = Router();

repositoryRoutes.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const repos = await prisma.repository.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(repos);
  } catch (e) { next(e); }
});

repositoryRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, url, branch, isDemo } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const repo = await prisma.repository.create({
      data: { name, url, branch: branch || 'main', isDemo: isDemo || false },
    });
    res.status(201).json(repo);
  } catch (e) { next(e); }
});
