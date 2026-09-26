/**
 * One-shot seed script: creates INC-TEST-001
 * Run: npx ts-node src/seed-test-incident.ts
 * Safe to run multiple times — skips creation if already exists.
 */
import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';

async function seed() {
  const INCIDENT_ID = 'INC-TEST-001';

  const existing = await prisma.incident.findUnique({ where: { incidentId: INCIDENT_ID } });
  if (existing) {
    console.log(`✅ ${INCIDENT_ID} already exists (id: ${existing.id}) — nothing to do.`);
    await prisma.$disconnect();
    return;
  }

  const incident = await prisma.incident.create({
    data: {
      incidentId: INCIDENT_ID,
      title: 'API Response Time Spike',
      description:
        'The payment-api is experiencing unusually high response times. ' +
        'Users are reporting slow payment processing and intermittent request timeouts.',
      severity: 'HIGH',
      status: 'OPEN',
      affectedService: 'payment-api',
      errorMessage:
        'Gateway timeout: upstream payment-api did not respond within 30 s\n' +
        '    POST /v1/payments → 504 Gateway Timeout',
      stackTrace:
        'TimeoutError: Request to payment-api timed out after 30000ms\n' +
        '    at PaymentClient.post (src/clients/paymentClient.ts:58:11)\n' +
        '    at PaymentController.createPayment (src/controllers/paymentController.ts:34:22)\n' +
        '    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)\n' +
        '    at next (node_modules/express/lib/router/route.js:144:13)\n' +
        '    at Route.dispatch (node_modules/express/lib/router/route.js:114:3)',
      logs:
        '[2024-01-16 09:12:01] INFO  POST /v1/payments 200 42ms\n' +
        '[2024-01-16 09:12:44] INFO  POST /v1/payments 200 38ms\n' +
        '[2024-01-16 09:13:15] WARN  POST /v1/payments 200 1823ms  (slow)\n' +
        '[2024-01-16 09:14:02] WARN  POST /v1/payments 200 4210ms  (slow)\n' +
        '[2024-01-16 09:14:55] ERROR POST /v1/payments 504 30001ms (timeout)\n' +
        '[2024-01-16 09:15:03] ERROR POST /v1/payments 504 30001ms (timeout)\n' +
        '[2024-01-16 09:15:30] WARN  DB query avg=2340ms (threshold: 200ms)\n' +
        '[2024-01-16 09:15:31] WARN  Connection pool utilisation: 94%\n' +
        '[2024-01-16 09:15:45] ERROR POST /v1/payments 504 30001ms (timeout)\n' +
        '[2024-01-16 09:16:01] ERROR Error rate: 18.4% over last 5 minutes',
      expectedBehavior:
        'Payment API should respond within 500 ms for standard transactions. ' +
        'Error rate should remain below 0.5%. Database queries should complete in under 200 ms.',
      actualBehavior:
        'Response times have spiked to 1800–30 000 ms. Approximately 18% of requests are ' +
        'timing out with 504 errors. Database query average has risen to 2 340 ms. ' +
        'Connection pool utilisation is at 94%.',
      isDemo: false,
    },
  });

  console.log(`✅ Created ${incident.incidentId} — DB id: ${incident.id}`);
  console.log(`   Title   : ${incident.title}`);
  console.log(`   Severity: ${incident.severity}`);
  console.log(`   Service : ${incident.affectedService}`);
  console.log(`   Status  : ${incident.status}`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
