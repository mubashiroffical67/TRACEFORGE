"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
exports.healthRoutes = (0, express_1.Router)();
exports.healthRoutes.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'TraceForge API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        demoMode: process.env.DEMO_MODE === 'true',
    });
});
//# sourceMappingURL=health.js.map