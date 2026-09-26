export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type InvestigationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type ReviewOutcome = 'APPROVED' | 'NEEDS_REVISION' | 'INSUFFICIENT_EVIDENCE';
export type SecuritySeverity = 'PASS' | 'WARNING' | 'FAIL' | 'INFO';
export type ExecutionStatus = 'SIMULATED' | 'EXECUTED' | 'FAILED';
export interface FileDiff {
    filePath: string;
    language: string;
    oldContent: string;
    newContent: string;
    hunks: DiffHunk[];
    linesAdded: number;
    linesRemoved: number;
    changeReason: string;
}
export interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
}
export interface GeneratedTest {
    name: string;
    description: string;
    type: 'REGRESSION' | 'EDGE_CASE' | 'UNIT' | 'INTEGRATION';
    language: string;
    filePath: string;
    code: string;
    bugPrevented: string;
    expectedBehavior: string;
}
export interface IncidentInput {
    title: string;
    description: string;
    severity: Severity;
    errorMessage?: string;
    stackTrace?: string;
    logs?: string;
    affectedService?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    repositoryId?: string;
    isDemo?: boolean;
}
export interface DetectiveOutput {
    summary: string;
    affectedComponents: string[];
    candidateFiles: CandidateFile[];
    evidence: EvidenceItem[];
    keywords: string[];
    dependencies: string[];
}
export interface CandidateFile {
    filePath: string;
    relevance: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    codeSnippet?: string;
}
export interface EvidenceItem {
    type: 'STACK_TRACE' | 'LOG' | 'FILE' | 'CODE_PATH' | 'TEST' | 'CONFIG' | 'ERROR';
    title: string;
    content: string;
    filePath?: string;
    lineNumber?: number;
    relevance: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface RootCauseOutput {
    hypotheses: Hypothesis[];
    primaryHypothesis: Hypothesis;
}
export interface Hypothesis {
    rank: number;
    explanation: string;
    confidence: Confidence;
    confidenceScore: number;
    supportingEvidence: string[];
    contradictingEvidence: string[];
    missingEvidence: string[];
    affectedFiles: string[];
    affectedFunctions: string[];
    assumptions: string[];
    isPrimary: boolean;
}
export interface PatchOutput {
    summary: string;
    rationale: string;
    fileDiffs: FileDiff[];
    linesAdded: number;
    linesRemoved: number;
    filesModified: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface TestOutput {
    existingPassed: number;
    existingTotal: number;
    newTestsPassed: number;
    newTestsTotal: number;
    edgeCasesPassed: number;
    edgeCasesTotal: number;
    generatedTests: GeneratedTest[];
    coverageInfo?: string;
    regressionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    executionStatus: ExecutionStatus;
}
export interface SecurityOutput {
    overallStatus: 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED';
    findings: SecurityFindingItem[];
}
export interface SecurityFindingItem {
    category: string;
    severity: SecuritySeverity;
    title: string;
    description: string;
    affectedCode?: string;
    recommendation: string;
}
export interface ReviewOutput {
    outcome: ReviewOutcome;
    reasoning: string;
    addressesRootCause: boolean;
    sufficientEvidence: boolean;
    regressionRisk: string;
    testsSufficient: boolean;
    securityClear: boolean;
    simplificationNote?: string;
}
export interface OrchestratorResult {
    status: InvestigationStatus;
    iterationCount: number;
    detective: DetectiveOutput;
    rootCause: RootCauseOutput;
    patch: PatchOutput;
    tests: TestOutput;
    security: SecurityOutput;
    review: ReviewOutput;
    timelineEvents: TimelineEventItem[];
}
export interface TimelineEventItem {
    step: string;
    description: string;
    status: 'COMPLETED' | 'FAILED' | 'RUNNING';
    startedAt: Date;
    completedAt?: Date;
    durationMs?: number;
}
//# sourceMappingURL=index.d.ts.map