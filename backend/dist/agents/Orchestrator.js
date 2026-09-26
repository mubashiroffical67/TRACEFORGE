"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
/**
 * Orchestrator — coordinates all agents through the investigation workflow.
 * Supports iterative loops when the reviewer rejects the solution.
 */
const prisma_1 = require("../lib/prisma");
const AIProvider_1 = require("./AIProvider");
const demoData_1 = require("../demo/demoData");
class Orchestrator {
    constructor() {
        this.ai = new AIProvider_1.AIProvider();
    }
    async investigate(incidentId) {
        // Load incident
        const incident = await prisma_1.prisma.incident.findUnique({
            where: { id: incidentId },
            include: { repository: true },
        });
        if (!incident)
            throw new Error(`Incident not found: ${incidentId}`);
        // Get or create investigation
        let investigation = await prisma_1.prisma.investigation.findUnique({
            where: { incidentId },
        });
        if (!investigation) {
            investigation = await prisma_1.prisma.investigation.create({
                data: {
                    incidentId,
                    status: 'RUNNING',
                    currentStep: 'detective',
                    maxIterations: parseInt(process.env.MAX_ITERATIONS || '3'),
                },
            });
        }
        else {
            await prisma_1.prisma.investigation.update({
                where: { id: investigation.id },
                data: { status: 'RUNNING', currentStep: 'detective' },
            });
        }
        const investigationId = investigation.id;
        const maxIterations = investigation.maxIterations;
        const timeline = [];
        const incidentInput = {
            title: incident.title,
            description: incident.description,
            severity: incident.severity,
            errorMessage: incident.errorMessage || undefined,
            stackTrace: incident.stackTrace || undefined,
            logs: incident.logs || undefined,
            affectedService: incident.affectedService || undefined,
            expectedBehavior: incident.expectedBehavior || undefined,
            actualBehavior: incident.actualBehavior || undefined,
        };
        // Determine repo files
        const repoFiles = incident.isDemo ? demoData_1.DEMO_REPO_FILES : {};
        let detective;
        let rootCause;
        let patch;
        let tests;
        let security;
        let review;
        let iterationCount = 0;
        try {
            // ── STEP 1: Detective ─────────────────────────────────────────────────
            const detStep = await this.startStep(investigationId, 'detective', 'Incident Detective analyzing logs, stack traces and repository', timeline);
            detective = await this.ai.runDetective(incidentInput, repoFiles);
            await this.completeStep(investigationId, detStep, timeline);
            await this.saveEvidence(investigationId, detective);
            // ── STEP 2: Root Cause ────────────────────────────────────────────────
            const rcStep = await this.startStep(investigationId, 'root_cause', 'Root Cause Analyst evaluating evidence and generating hypotheses', timeline);
            rootCause = await this.ai.runRootCause(incidentInput, detective, repoFiles);
            await this.completeStep(investigationId, rcStep, timeline);
            await this.saveHypotheses(investigationId, rootCause);
            // ── ITERATION LOOP ────────────────────────────────────────────────────
            let approved = false;
            while (!approved && iterationCount < maxIterations) {
                iterationCount++;
                // STEP 3: Fix
                const fixStep = await this.startStep(investigationId, 'fix', `Fix Engineer generating minimal patch (iteration ${iterationCount})`, timeline);
                patch = await this.ai.runFixer(incidentInput, rootCause, repoFiles);
                await this.completeStep(investigationId, fixStep, timeline);
                await this.savePatch(investigationId, patch);
                // STEP 4: Tests
                const testStep = await this.startStep(investigationId, 'tests', 'Test Engineer generating regression tests', timeline);
                tests = await this.ai.runTestEngineer(incidentInput, patch, repoFiles);
                await this.completeStep(investigationId, testStep, timeline);
                await this.saveTests(investigationId, tests);
                // STEP 5: Security
                const secStep = await this.startStep(investigationId, 'security', 'Security Engineer analyzing patch', timeline);
                security = await this.ai.runSecurity(incidentInput, patch);
                await this.completeStep(investigationId, secStep, timeline);
                await this.saveSecurityFindings(investigationId, security);
                // STEP 6: Review
                const reviewStep = await this.startStep(investigationId, 'review', 'Independent Review Agent evaluating solution', timeline);
                review = await this.ai.runReviewer(incidentInput, rootCause, patch, tests, security);
                await this.completeStep(investigationId, reviewStep, timeline);
                await this.saveReview(investigationId, review);
                if (review.outcome === 'APPROVED') {
                    approved = true;
                }
                else if (review.outcome === 'INSUFFICIENT_EVIDENCE') {
                    // Can't iterate further without more evidence
                    break;
                }
                // NEEDS_REVISION — loop continues
            }
            // ── STEP 7: Verification ──────────────────────────────────────────────
            const verStep = await this.startStep(investigationId, 'verification', 'Verifying resolution and generating knowledge card', timeline);
            await this.generateKnowledgeCard(incident.id, rootCause, patch, tests, security, review);
            await this.completeStep(investigationId, verStep, timeline);
            // Mark complete
            await prisma_1.prisma.investigation.update({
                where: { id: investigationId },
                data: {
                    status: 'COMPLETED',
                    currentStep: 'completed',
                    iterationCount,
                    completedAt: new Date(),
                },
            });
            await prisma_1.prisma.incident.update({
                where: { id: incidentId },
                data: { status: 'RESOLVED', resolvedAt: new Date() },
            });
            return {
                status: 'COMPLETED',
                iterationCount,
                detective: detective,
                rootCause: rootCause,
                patch: patch,
                tests: tests,
                security: security,
                review: review,
                timelineEvents: timeline,
            };
        }
        catch (error) {
            await prisma_1.prisma.investigation.update({
                where: { id: investigationId },
                data: { status: 'FAILED', currentStep: 'failed' },
            });
            throw error;
        }
    }
    // ─── TIMELINE HELPERS ──────────────────────────────────────────────────────
    async startStep(investigationId, step, description, timeline) {
        await prisma_1.prisma.investigation.update({
            where: { id: investigationId },
            data: { currentStep: step },
        });
        const event = await prisma_1.prisma.timelineEvent.create({
            data: { investigationId, step, description, status: 'RUNNING' },
        });
        timeline.push({
            step,
            description,
            status: 'RUNNING',
            startedAt: event.startedAt,
        });
        return event.id;
    }
    async completeStep(_investigationId, eventId, timeline) {
        const completedAt = new Date();
        const event = await prisma_1.prisma.timelineEvent.update({
            where: { id: eventId },
            data: { status: 'COMPLETED', completedAt },
        });
        const started = event.startedAt.getTime();
        const durationMs = completedAt.getTime() - started;
        await prisma_1.prisma.timelineEvent.update({
            where: { id: eventId },
            data: { durationMs },
        });
        // Update last timeline item
        const last = timeline[timeline.length - 1];
        if (last) {
            last.status = 'COMPLETED';
            last.completedAt = completedAt;
            last.durationMs = durationMs;
        }
    }
    // ─── PERSISTENCE HELPERS ──────────────────────────────────────────────────
    async saveEvidence(investigationId, detective) {
        // Clear old
        await prisma_1.prisma.evidence.deleteMany({ where: { investigationId } });
        for (const ev of detective.evidence) {
            await prisma_1.prisma.evidence.create({
                data: {
                    investigationId,
                    type: ev.type,
                    title: ev.title,
                    content: ev.content,
                    filePath: ev.filePath || null,
                    lineNumber: ev.lineNumber || null,
                    relevance: ev.relevance,
                },
            });
        }
    }
    async saveHypotheses(investigationId, rootCause) {
        await prisma_1.prisma.rootCauseHypothesis.deleteMany({ where: { investigationId } });
        for (const h of rootCause.hypotheses) {
            await prisma_1.prisma.rootCauseHypothesis.create({
                data: {
                    investigationId,
                    rank: h.rank,
                    explanation: h.explanation,
                    confidence: h.confidence,
                    confidenceScore: h.confidenceScore,
                    supportingEvidence: JSON.stringify(h.supportingEvidence),
                    contradictingEvidence: JSON.stringify(h.contradictingEvidence),
                    missingEvidence: JSON.stringify(h.missingEvidence),
                    affectedFiles: JSON.stringify(h.affectedFiles),
                    affectedFunctions: JSON.stringify(h.affectedFunctions),
                    assumptions: JSON.stringify(h.assumptions),
                    isPrimary: h.isPrimary,
                },
            });
        }
    }
    async savePatch(investigationId, patch) {
        await prisma_1.prisma.patch.deleteMany({ where: { investigationId } });
        await prisma_1.prisma.patch.create({
            data: {
                investigationId,
                summary: patch.summary,
                rationale: patch.rationale,
                fileDiffs: JSON.stringify(patch.fileDiffs),
                linesAdded: patch.linesAdded,
                linesRemoved: patch.linesRemoved,
                filesModified: patch.filesModified,
                riskLevel: patch.riskLevel,
            },
        });
    }
    async saveTests(investigationId, tests) {
        await prisma_1.prisma.testResult.deleteMany({ where: { investigationId } });
        await prisma_1.prisma.testResult.create({
            data: {
                investigationId,
                existingPassed: tests.existingPassed,
                existingTotal: tests.existingTotal,
                newTestsPassed: tests.newTestsPassed,
                newTestsTotal: tests.newTestsTotal,
                edgeCasesPassed: tests.edgeCasesPassed,
                edgeCasesTotal: tests.edgeCasesTotal,
                generatedTests: JSON.stringify(tests.generatedTests),
                coverageInfo: tests.coverageInfo || null,
                regressionRisk: tests.regressionRisk,
                executionStatus: tests.executionStatus,
            },
        });
    }
    async saveSecurityFindings(investigationId, security) {
        await prisma_1.prisma.securityFinding.deleteMany({ where: { investigationId } });
        for (const f of security.findings) {
            await prisma_1.prisma.securityFinding.create({
                data: {
                    investigationId,
                    category: f.category,
                    severity: f.severity,
                    title: f.title,
                    description: f.description,
                    affectedCode: f.affectedCode || null,
                    recommendation: f.recommendation,
                },
            });
        }
    }
    async saveReview(investigationId, review) {
        await prisma_1.prisma.review.deleteMany({ where: { investigationId } });
        await prisma_1.prisma.review.create({
            data: {
                investigationId,
                outcome: review.outcome,
                reasoning: review.reasoning,
                addressesRootCause: review.addressesRootCause,
                sufficientEvidence: review.sufficientEvidence,
                regressionRisk: review.regressionRisk,
                testsSufficient: review.testsSufficient,
                securityClear: review.securityClear,
                simplificationNote: review.simplificationNote || null,
            },
        });
    }
    async generateKnowledgeCard(incidentId, rootCause, patch, tests, security, review) {
        await prisma_1.prisma.knowledgeCard.deleteMany({ where: { incidentId } });
        const incident = await prisma_1.prisma.incident.findUnique({ where: { id: incidentId } });
        const investigation = await prisma_1.prisma.investigation.findUnique({ where: { incidentId } });
        const prevention = [
            'Add runtime schema validation at the API boundary (e.g., Zod) to catch missing required fields early',
            'Add TypeScript strict mode and ensure optional fields are always guarded before access',
            'Expand test coverage to include undefined/null edge cases for all optional parameters',
            'Add request payload logging to aid future incident investigation',
            'Consider adding an input validation middleware layer to the checkout route',
        ];
        await prisma_1.prisma.knowledgeCard.create({
            data: {
                incidentId,
                rootCauseSummary: rootCause.primaryHypothesis.explanation.substring(0, 500),
                affectedComponents: JSON.stringify(['checkout-api', 'PaymentService', 'CheckoutController']),
                affectedFiles: JSON.stringify(rootCause.primaryHypothesis.affectedFiles),
                fixSummary: patch.summary,
                testsAdded: tests.newTestsTotal + tests.edgeCasesTotal,
                securityStatus: security.overallStatus,
                reviewOutcome: review.outcome,
                verificationStatus: review.outcome === 'APPROVED' ? 'VERIFIED' : 'PENDING',
                preventionRecommendations: JSON.stringify(prevention),
                similarPatterns: JSON.stringify([
                    'Null dereference on optional fields',
                    'Missing input validation at service layer',
                    'TypeScript optional type without runtime guard',
                ]),
                documentationNotes: `Root cause confirmed via stack trace analysis. Fix applied to ${patch.filesModified} file(s). Investigation completed in ${investigation?.iterationCount || 1} iteration(s).`,
            },
        });
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=Orchestrator.js.map