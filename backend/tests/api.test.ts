import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Health', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Incidents API', () => {
  let createdId: string;

  it('POST /api/incidents creates an incident', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'Test incident for unit test',
      description: 'A test incident description that is long enough',
      severity: 'HIGH',
      errorMessage: 'Test error',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.severity).toBe('HIGH');
    createdId = res.body.id;
  });

  it('GET /api/incidents returns list', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/incidents/:id returns incident', async () => {
    const res = await request(app).get(`/api/incidents/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('GET /api/incidents/stats returns stats', async () => {
    const res = await request(app).get('/api/incidents/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.total).toBe('number');
  });

  it('POST /api/incidents validates required fields', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'x', // too short
    });
    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    if (createdId) {
      await prisma.incident.delete({ where: { id: createdId } });
    }
  });
});

describe('Demo API', () => {
  it('POST /api/demo/seed creates demo incident', async () => {
    // Reset first
    await request(app).delete('/api/demo/reset');
    const res = await request(app).post('/api/demo/seed');
    expect(res.status).toBe(200);
    expect(res.body.incident.incidentId).toBe('INC-0042');
  });

  it('GET /api/demo/incident returns demo incident', async () => {
    const res = await request(app).get('/api/demo/incident');
    expect(res.status).toBe(200);
    expect(res.body.incidentId).toBe('INC-0042');
  });
});
