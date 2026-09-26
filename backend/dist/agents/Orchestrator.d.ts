import { OrchestratorResult } from '../types';
export declare class Orchestrator {
    private ai;
    constructor();
    investigate(incidentId: string): Promise<OrchestratorResult>;
    private startStep;
    private completeStep;
    private saveEvidence;
    private saveHypotheses;
    private savePatch;
    private saveTests;
    private saveSecurityFindings;
    private saveReview;
    private generateKnowledgeCard;
}
//# sourceMappingURL=Orchestrator.d.ts.map