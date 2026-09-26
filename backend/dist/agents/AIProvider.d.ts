/**
 * AI Provider — wraps OpenAI with demo simulation fallback.
 * When DEMO_MODE=true or OPENAI_API_KEY is not set, returns pre-crafted demo responses.
 */
import { DetectiveOutput, RootCauseOutput, PatchOutput, TestOutput, SecurityOutput, ReviewOutput, IncidentInput } from '../types';
export declare class AIProvider {
    private isDemoMode;
    private openai;
    constructor();
    isDemo(): boolean;
    runDetective(incident: IncidentInput, repoFiles: Record<string, string>): Promise<DetectiveOutput>;
    runRootCause(incident: IncidentInput, detective: DetectiveOutput, repoFiles: Record<string, string>): Promise<RootCauseOutput>;
    runFixer(incident: IncidentInput, rootCause: RootCauseOutput, repoFiles: Record<string, string>): Promise<PatchOutput>;
    runTestEngineer(incident: IncidentInput, patch: PatchOutput, repoFiles: Record<string, string>): Promise<TestOutput>;
    runSecurity(incident: IncidentInput, patch: PatchOutput): Promise<SecurityOutput>;
    runReviewer(incident: IncidentInput, rootCause: RootCauseOutput, patch: PatchOutput, tests: TestOutput, security: SecurityOutput): Promise<ReviewOutput>;
    private demoDetectiveOutput;
    private demoRootCauseOutput;
    private demoPatchOutput;
    private demoTestOutput;
    private demoSecurityOutput;
    private demoReviewOutput;
}
//# sourceMappingURL=AIProvider.d.ts.map