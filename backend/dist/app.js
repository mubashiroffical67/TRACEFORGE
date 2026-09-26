"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const incidents_1 = require("./api/incidents");
const repositories_1 = require("./api/repositories");
const investigations_1 = require("./api/investigations");
const demo_1 = require("./api/demo");
const health_1 = require("./api/health");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/health', health_1.healthRoutes);
app.use('/api/incidents', incidents_1.incidentRoutes);
app.use('/api/repositories', repositories_1.repositoryRoutes);
app.use('/api/investigations', investigations_1.investigationRoutes);
app.use('/api/demo', demo_1.demoRoutes);
// 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map