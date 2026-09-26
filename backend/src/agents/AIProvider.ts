/**
 * AI Provider — wraps OpenAI with demo simulation fallback.
 * When DEMO_MODE=true or OPENAI_API_KEY is not set, returns pre-crafted demo responses.
 */
import {
  DetectiveOutput,
  RootCauseOutput,
  PatchOutput,
  TestOutput,
  SecurityOutput,
  ReviewOutput,
  IncidentInput,
} from '../types';

export class AIProvider {
  private isDemoMode: boolean;
  private openai: any;

  constructor() {
    this.isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here';

    if (!this.isDemoMode) {
      try {
        const OpenAI = require('openai');
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      } catch {
        this.isDemoMode = true;
      }
    }
  }

  isDemo(): boolean {
    return this.isDemoMode;
  }

  async runDetective(incident: IncidentInput, repoFiles: Record<string, string>): Promise<DetectiveOutput> {
    if (this.isDemoMode) return this.demoDetectiveOutput();

    const prompt = `You are an Incident Detective agent. Analyze this production incident and repository files.

INCIDENT:
Title: ${incident.title}
Description: ${incident.description}
Error: ${incident.errorMessage}
Stack Trace: ${incident.stackTrace}
Logs: ${incident.logs}
Affected Service: ${incident.affectedService}

REPOSITORY FILES:
${Object.entries(repoFiles).map(([path, content]) => `--- ${path} ---\n${content}`).join('\n\n')}

Return a JSON object matching this structure:
{
  "summary": "brief incident summary",
  "affectedComponents": ["list of affected components"],
  "candidateFiles": [{"filePath": "...", "relevance": "HIGH|MEDIUM|LOW", "reason": "...", "codeSnippet": "..."}],
  "evidence": [{"type": "STACK_TRACE|LOG|FILE|CODE_PATH|TEST|CONFIG|ERROR", "title": "...", "content": "...", "filePath": "...", "lineNumber": null, "relevance": "HIGH|MEDIUM|LOW"}],
  "keywords": ["keyword1", "keyword2"],
  "dependencies": ["dep1"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async runRootCause(incident: IncidentInput, detective: DetectiveOutput, repoFiles: Record<string, string>): Promise<RootCauseOutput> {
    if (this.isDemoMode) return this.demoRootCauseOutput();

    const prompt = `You are a Root Cause Analyst agent. Based on the detective findings, identify root causes.

INCIDENT: ${incident.title}
DETECTIVE SUMMARY: ${detective.summary}
CANDIDATE FILES: ${JSON.stringify(detective.candidateFiles)}
EVIDENCE: ${JSON.stringify(detective.evidence)}

REPOSITORY FILES:
${Object.entries(repoFiles).map(([path, content]) => `--- ${path} ---\n${content}`).join('\n\n')}

Return JSON matching:
{
  "hypotheses": [{
    "rank": 1,
    "explanation": "...",
    "confidence": "HIGH|MEDIUM|LOW",
    "confidenceScore": 0.85,
    "supportingEvidence": ["..."],
    "contradictingEvidence": [],
    "missingEvidence": [],
    "affectedFiles": ["..."],
    "affectedFunctions": ["..."],
    "assumptions": [],
    "isPrimary": true
  }],
  "primaryHypothesis": { ... same structure ... }
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async runFixer(incident: IncidentInput, rootCause: RootCauseOutput, repoFiles: Record<string, string>): Promise<PatchOutput> {
    if (this.isDemoMode) return this.demoPatchOutput();

    const prompt = `You are a Fix Engineer agent. Design the smallest safe fix.

INCIDENT: ${incident.title}
ROOT CAUSE: ${rootCause.primaryHypothesis.explanation}
AFFECTED FILES: ${rootCause.primaryHypothesis.affectedFiles.join(', ')}

REPOSITORY FILES:
${Object.entries(repoFiles).map(([path, content]) => `--- ${path} ---\n${content}`).join('\n\n')}

Return JSON matching:
{
  "summary": "brief fix description",
  "rationale": "why this is the right fix",
  "fileDiffs": [{
    "filePath": "...",
    "language": "typescript",
    "oldContent": "...",
    "newContent": "...",
    "hunks": [{"oldStart": 1, "oldLines": 5, "newStart": 1, "newLines": 7, "lines": ["+ added", "- removed", "  context"]}],
    "linesAdded": 3,
    "linesRemoved": 1,
    "changeReason": "..."
  }],
  "linesAdded": 5,
  "linesRemoved": 1,
  "filesModified": 1,
  "riskLevel": "LOW|MEDIUM|HIGH"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async runTestEngineer(incident: IncidentInput, patch: PatchOutput, repoFiles: Record<string, string>): Promise<TestOutput> {
    if (this.isDemoMode) return this.demoTestOutput();

    const prompt = `You are a Test Engineer agent. Generate regression tests for this fix.

INCIDENT: ${incident.title}
PATCH SUMMARY: ${patch.summary}
MODIFIED FILES: ${patch.fileDiffs.map(d => d.filePath).join(', ')}

Return JSON matching:
{
  "existingPassed": 2,
  "existingTotal": 2,
  "newTestsPassed": 3,
  "newTestsTotal": 3,
  "edgeCasesPassed": 4,
  "edgeCasesTotal": 4,
  "generatedTests": [{
    "name": "...",
    "description": "...",
    "type": "REGRESSION|EDGE_CASE|UNIT",
    "language": "typescript",
    "filePath": "tests/...",
    "code": "...",
    "bugPrevented": "...",
    "expectedBehavior": "..."
  }],
  "regressionRisk": "LOW",
  "executionStatus": "SIMULATED"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async runSecurity(incident: IncidentInput, patch: PatchOutput): Promise<SecurityOutput> {
    if (this.isDemoMode) return this.demoSecurityOutput();

    const prompt = `You are a Security Engineer agent. Analyze this patch for security issues.

INCIDENT: ${incident.title}
PATCH: ${JSON.stringify(patch.fileDiffs.map(d => ({ file: d.filePath, newContent: d.newContent })))}

Return JSON:
{
  "overallStatus": "PASSED|PASSED_WITH_WARNINGS|FAILED",
  "findings": [{
    "category": "INPUT_VALIDATION|INJECTION|AUTH|SECRETS|etc",
    "severity": "PASS|WARNING|FAIL|INFO",
    "title": "...",
    "description": "...",
    "affectedCode": "...",
    "recommendation": "..."
  }]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async runReviewer(
    incident: IncidentInput,
    rootCause: RootCauseOutput,
    patch: PatchOutput,
    tests: TestOutput,
    security: SecurityOutput
  ): Promise<ReviewOutput> {
    if (this.isDemoMode) return this.demoReviewOutput();

    const prompt = `You are an Independent Review Agent. Critically evaluate this solution.

INCIDENT: ${incident.title}
ROOT CAUSE: ${rootCause.primaryHypothesis.explanation} (confidence: ${rootCause.primaryHypothesis.confidence})
PATCH: ${patch.summary}
TESTS: ${tests.newTestsTotal} new tests, regression risk: ${tests.regressionRisk}
SECURITY: ${security.overallStatus}

Be an independent critic. Do NOT simply agree.

Return JSON:
{
  "outcome": "APPROVED|NEEDS_REVISION|INSUFFICIENT_EVIDENCE",
  "reasoning": "detailed reasoning",
  "addressesRootCause": true,
  "sufficientEvidence": true,
  "regressionRisk": "LOW|MEDIUM|HIGH",
  "testsSufficient": true,
  "securityClear": true,
  "simplificationNote": "optional note if a simpler fix exists"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // ─── DEMO SIMULATION RESPONSES ───────────────────────────────────────────────

  private demoDetectiveOutput(): DetectiveOutput {
    return {
      summary: 'A TypeError is crashing the payment service when paymentMethod is undefined. The checkout controller passes potentially-undefined payment data to processPayment(), which immediately dereferences paymentMethod.token without any null guard. This affects ~12% of requests where the client omits paymentDetails from the request body.',
      affectedComponents: ['checkout-api', 'PaymentService', 'CheckoutController'],
      candidateFiles: [
        {
          filePath: 'src/services/paymentService.ts',
          relevance: 'HIGH',
          reason: 'Stack trace pinpoints line 42 — paymentMethod.token dereference without null check',
          codeSnippet: 'token: request.paymentMethod.token,  // CRASH: TypeError if paymentMethod is undefined',
        },
        {
          filePath: 'src/controllers/checkoutController.ts',
          relevance: 'HIGH',
          reason: 'Passes paymentDetails?.paymentMethod which can be undefined when client omits paymentDetails',
          codeSnippet: 'paymentMethod: paymentDetails?.paymentMethod, // may be undefined',
        },
        {
          filePath: 'src/utils/validator.ts',
          relevance: 'MEDIUM',
          reason: 'Validation utility exists but does not validate paymentMethod field',
          codeSnippet: '// NOTE: paymentMethod validation is missing here',
        },
        {
          filePath: 'tests/paymentService.test.ts',
          relevance: 'MEDIUM',
          reason: 'Existing tests do not cover undefined paymentMethod scenario',
          codeSnippet: '// MISSING: test for undefined paymentMethod',
        },
      ],
      evidence: [
        {
          type: 'STACK_TRACE',
          title: 'TypeError at paymentService.ts:42',
          content: "TypeError: Cannot read properties of undefined (reading 'token')\n    at PaymentService.processPayment (src/services/paymentService.ts:42:38)",
          filePath: 'src/services/paymentService.ts',
          lineNumber: 42,
          relevance: 'HIGH',
        },
        {
          type: 'LOG',
          title: 'Intermittent payment failures in logs',
          content: '[2024-01-15 08:41:23] ERROR Payment failed: TypeError: Cannot read properties of undefined (reading \'token\')',
          relevance: 'HIGH',
        },
        {
          type: 'CODE_PATH',
          title: 'Undefined paymentMethod flow',
          content: 'CheckoutController receives request → extracts paymentDetails?.paymentMethod (undefined if missing) → passes to PaymentService.processPayment → immediately reads .token → crash',
          relevance: 'HIGH',
        },
        {
          type: 'TEST',
          title: 'Missing test coverage for undefined paymentMethod',
          content: 'Existing test suite covers happy path and gateway failure but not the case where paymentMethod itself is missing',
          filePath: 'tests/paymentService.test.ts',
          relevance: 'MEDIUM',
        },
        {
          type: 'CONFIG',
          title: 'TypeScript interface marks paymentMethod as optional',
          content: 'PaymentRequest interface declares paymentMethod?: PaymentMethod — optional field with no runtime guard',
          filePath: 'src/services/paymentService.ts',
          lineNumber: 14,
          relevance: 'HIGH',
        },
      ],
      keywords: ['TypeError', 'undefined', 'paymentMethod', 'token', 'processPayment', 'checkout'],
      dependencies: ['PaymentGateway', 'OrderService', 'CartService'],
    };
  }

  private demoRootCauseOutput(): RootCauseOutput {
    const primary = {
      rank: 1,
      explanation: 'Missing validation of paymentMethod before use in PaymentService.processPayment(). The TypeScript interface correctly marks paymentMethod as optional (paymentMethod?: PaymentMethod), but no runtime guard exists before the code reads paymentMethod.token on line 42. When a client submits a checkout request without paymentDetails or with an empty paymentDetails object, the optional chaining in CheckoutController (paymentDetails?.paymentMethod) produces undefined, which is passed directly to processPayment and immediately dereferenced.',
      confidence: 'HIGH' as const,
      confidenceScore: 0.92,
      supportingEvidence: [
        'Stack trace directly pinpoints paymentService.ts:42 — the exact line that reads paymentMethod.token',
        'TypeScript interface explicitly marks paymentMethod as optional with no runtime guard added',
        'Logs show intermittent failures (12%) consistent with some clients omitting paymentDetails',
        'CheckoutController uses optional chaining (paymentDetails?.paymentMethod) which produces undefined',
        'Test suite has no coverage for undefined paymentMethod scenario',
      ],
      contradictingEvidence: [
        'Some requests succeed, suggesting network or gateway issues cannot fully explain the pattern',
      ],
      missingEvidence: [
        'Production request payload samples to confirm clients are sending requests without paymentMethod',
        'Whether paymentMethod validation is enforced at any upstream layer (API gateway, frontend)',
      ],
      affectedFiles: ['src/services/paymentService.ts', 'src/controllers/checkoutController.ts'],
      affectedFunctions: ['PaymentService.processPayment', 'CheckoutController.processCheckout'],
      assumptions: [
        'Client code sometimes submits checkout requests without the paymentMethod field',
        'No upstream validation is catching this case before it reaches the service layer',
      ],
      isPrimary: true,
    };

    return {
      hypotheses: [
        primary,
        {
          rank: 2,
          explanation: 'Database connection timeout causing intermittent order creation failures, which could surface as 500 errors. However, the stack trace does not point to database code, making this unlikely.',
          confidence: 'LOW' as const,
          confidenceScore: 0.08,
          supportingEvidence: ['Intermittent nature of failures could suggest resource contention'],
          contradictingEvidence: ['Stack trace unambiguously points to paymentService.ts:42, not database code'],
          missingEvidence: ['Database connection pool metrics'],
          affectedFiles: [],
          affectedFunctions: [],
          assumptions: [],
          isPrimary: false,
        },
      ],
      primaryHypothesis: primary,
    };
  }

  private demoPatchOutput(): PatchOutput {
    const oldContent = `  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    logger.info(\`Processing payment for order \${request.orderId}\`);

    // BUG: paymentMethod is never validated before use
    // This causes a runtime TypeError when paymentMethod is undefined
    const chargePayload = {
      amount: request.amount,
      currency: request.currency,
      token: request.paymentMethod.token,  // CRASH: TypeError if paymentMethod is undefined
      type: request.paymentMethod.type,
    };`;

    const newContent = `  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    logger.info(\`Processing payment for order \${request.orderId}\`);

    if (!request.paymentMethod) {
      logger.error(\`Payment rejected for order \${request.orderId}: paymentMethod is required\`);
      return { success: false, error: 'Payment method is required to process payment' };
    }

    const chargePayload = {
      amount: request.amount,
      currency: request.currency,
      token: request.paymentMethod.token,
      type: request.paymentMethod.type,
    };`;

    return {
      summary: 'Add null guard for paymentMethod in PaymentService.processPayment() to prevent TypeError crash when paymentMethod is undefined',
      rationale: 'The root cause is a missing runtime check for the optional paymentMethod field. The smallest safe fix is a guard clause at the top of processPayment() that validates paymentMethod is present before any field access. This returns a clear error response instead of crashing with an unhandled TypeError, preserves all existing behavior for valid requests, and requires zero changes to calling code.',
      fileDiffs: [
        {
          filePath: 'src/services/paymentService.ts',
          language: 'typescript',
          oldContent,
          newContent,
          hunks: [
            {
              oldStart: 38,
              oldLines: 10,
              newStart: 38,
              newLines: 14,
              lines: [
                '   async processPayment(request: PaymentRequest): Promise<PaymentResult> {',
                "     logger.info(`Processing payment for order ${request.orderId}`);",
                '',
                '-    // BUG: paymentMethod is never validated before use',
                '-    // This causes a runtime TypeError when paymentMethod is undefined',
                '-    const chargePayload = {',
                '-      amount: request.amount,',
                '-      currency: request.currency,',
                '-      token: request.paymentMethod.token,  // CRASH: TypeError if paymentMethod is undefined',
                '-      type: request.paymentMethod.type,',
                '-    };',
                '+    if (!request.paymentMethod) {',
                "+      logger.error(`Payment rejected for order ${request.orderId}: paymentMethod is required`);",
                "+      return { success: false, error: 'Payment method is required to process payment' };",
                '+    }',
                '+',
                '+    const chargePayload = {',
                '+      amount: request.amount,',
                '+      currency: request.currency,',
                '+      token: request.paymentMethod.token,',
                '+      type: request.paymentMethod.type,',
                '+    };',
              ],
            },
          ],
          linesAdded: 5,
          linesRemoved: 2,
          changeReason: 'Guard clause to validate paymentMethod presence before dereference',
        },
      ],
      linesAdded: 5,
      linesRemoved: 2,
      filesModified: 1,
      riskLevel: 'LOW',
    };
  }

  private demoTestOutput(): TestOutput {
    return {
      existingPassed: 2,
      existingTotal: 2,
      newTestsPassed: 3,
      newTestsTotal: 3,
      edgeCasesPassed: 4,
      edgeCasesTotal: 4,
      generatedTests: [
        {
          name: 'should return error when paymentMethod is undefined',
          description: 'Regression test preventing recurrence of INC-0042 — verifies that processPayment returns a failure result instead of throwing TypeError when paymentMethod is missing',
          type: 'REGRESSION',
          language: 'typescript',
          filePath: 'tests/paymentService.test.ts',
          code: `it('should return error when paymentMethod is undefined', async () => {
  const result = await service.processPayment({
    orderId: 'order_test',
    customerId: 'cust_1',
    amount: 99.99,
    currency: 'USD',
    paymentMethod: undefined,
  });
  expect(result.success).toBe(false);
  expect(result.error).toBe('Payment method is required to process payment');
});`,
          bugPrevented: 'INC-0042: TypeError crash when paymentMethod is undefined',
          expectedBehavior: 'processPayment returns { success: false, error: "Payment method is required..." } instead of throwing',
        },
        {
          name: 'should return error when paymentMethod token is empty',
          description: 'Edge case: paymentMethod is provided but token is an empty string',
          type: 'EDGE_CASE',
          language: 'typescript',
          filePath: 'tests/paymentService.test.ts',
          code: `it('should return error when paymentMethod token is empty', async () => {
  const result = await service.processPayment({
    orderId: 'order_test',
    customerId: 'cust_1',
    amount: 99.99,
    currency: 'USD',
    paymentMethod: { type: 'card', token: '', last4: '4242' },
  });
  expect(result.success).toBe(false);
});`,
          bugPrevented: 'Downstream gateway failure from empty token submission',
          expectedBehavior: 'Empty token is rejected before gateway call',
        },
        {
          name: 'should return error when paymentMethod is null',
          description: 'Edge case: explicit null passed instead of undefined',
          type: 'EDGE_CASE',
          language: 'typescript',
          filePath: 'tests/paymentService.test.ts',
          code: `it('should handle null paymentMethod', async () => {
  const result = await service.processPayment({
    orderId: 'order_test',
    customerId: 'cust_1',
    amount: 99.99,
    currency: 'USD',
    paymentMethod: null as any,
  });
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});`,
          bugPrevented: 'Null coercion edge case similar to INC-0042',
          expectedBehavior: 'Null paymentMethod handled gracefully',
        },
      ],
      coverageInfo: 'paymentService.ts: 94% line coverage (up from 67%)',
      regressionRisk: 'LOW',
      executionStatus: 'SIMULATED',
    };
  }

  private demoSecurityOutput(): SecurityOutput {
    return {
      overallStatus: 'PASSED_WITH_WARNINGS',
      findings: [
        {
          category: 'INPUT_VALIDATION',
          severity: 'PASS',
          title: 'Input validation guard added',
          description: 'The fix correctly adds a null check for paymentMethod before any field access, preventing the TypeError.',
          recommendation: 'Consider adding a schema validation layer (e.g., Zod or Joi) at the API boundary for defense-in-depth.',
        },
        {
          category: 'ERROR_HANDLING',
          severity: 'PASS',
          title: 'Error response does not expose internal details',
          description: 'The error message "Payment method is required to process payment" is appropriate for client consumption and does not leak implementation details.',
          recommendation: 'No change required.',
        },
        {
          category: 'AUTHORIZATION',
          severity: 'WARNING',
          title: 'No authorization check on payment token',
          description: 'The payment token from the client is passed to the gateway without verifying it belongs to the authenticated customer. This is pre-existing and outside the scope of this fix, but warrants attention.',
          affectedCode: 'token: request.paymentMethod.token,',
          recommendation: 'Consider adding server-side tokenization or verifying payment token ownership in a future security sprint. Not blocking for this fix.',
        },
        {
          category: 'DATA_LEAKAGE',
          severity: 'PASS',
          title: 'No sensitive data exposed in error responses',
          description: 'The error path logs the order ID (not PII) and returns a generic user-facing error message.',
          recommendation: 'No change required.',
        },
        {
          category: 'INJECTION',
          severity: 'PASS',
          title: 'No injection risk in fix',
          description: 'The guard clause uses only boolean truthiness check — no string interpolation or dynamic query construction.',
          recommendation: 'No change required.',
        },
      ],
    };
  }

  private demoReviewOutput(): ReviewOutput {
    return {
      outcome: 'APPROVED',
      reasoning: 'The proposed fix directly addresses the root cause identified by evidence. The null guard in processPayment() prevents the TypeError by returning a clean error response when paymentMethod is absent. The single-file, 5-line change is appropriately minimal and preserves all existing behavior for valid requests. The regression test suite covers the exact failure mode from INC-0042 as well as related edge cases. The security review is acceptable — the pre-existing authorization concern is correctly flagged as out of scope. Evidence confidence is HIGH with strong stack trace and code path support.',
      addressesRootCause: true,
      sufficientEvidence: true,
      regressionRisk: 'LOW',
      testsSufficient: true,
      securityClear: true,
      simplificationNote: 'An alternative would be to add validation at the CheckoutController level before calling processPayment. This would be equally valid, but the chosen fix at the service layer provides better defense-in-depth since other callers of processPayment would also benefit.',
    };
  }
}
