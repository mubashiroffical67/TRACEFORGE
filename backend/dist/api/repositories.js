"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
exports.repositoryRoutes = (0, express_1.Router)();
exports.repositoryRoutes.get('/', async (_req, res, next) => {
    try {
        const repos = await prisma_1.prisma.repository.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(repos);
    }
    catch (e) {
        next(e);
    }
});
exports.repositoryRoutes.post('/', async (req, res, next) => {
    try {
        const { name, url, branch, isDemo } = req.body;
        if (!name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        const repo = await prisma_1.prisma.repository.create({
            data: { name, url, branch: branch || 'main', isDemo: isDemo || false },
        });
        res.status(201).json(repo);
    }
    catch (e) {
        next(e);
    }
});
//# sourceMappingURL=repositories.js.map