import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { incidentRoutes } from './api/incidents';
import { repositoryRoutes } from './api/repositories';
import { investigationRoutes } from './api/investigations';
import { demoRoutes } from './api/demo';
import { healthRoutes } from './api/health';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/demo', demoRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

export default app;
