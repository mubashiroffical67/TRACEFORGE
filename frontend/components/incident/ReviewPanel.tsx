import { UserCheck, CheckCircle2, AlertCircle, XCircle, Lightbulb } from 'lucide-react';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function ReviewPanel({ inv }: { inv: any }) {
  if (!inv?.review) {
    return <div className="text-center py-12 text-forge-muted text-sm">Independent review not yet available.</div>;
  }

  const r = inv.review;

  const outcomeIcon = r.outcome === 'APPROVED'
    ? <CheckCircle2 size={20} className="text-green-400" />
    : r.outcome === 'NEEDS_REVISION'
    ? <AlertCircle size={20} className="text-yellow-400" />
    : <XCircle size={20} className="text-red-400" />;

  const outcomeBg = r.outcome === 'APPROVED'
    ? 'bg-green-500/5 border-green-500/20'
    : r.outcome === 'NEEDS_REVISION'
    ? 'bg-yellow-500/5 border-yellow-500/20'
    : 'bg-red-500/5 border-red-500/20';

  return (
    <div className="space-y-4">
      {/* Outcome banner */}
      <div className={`border rounded-lg p-4 flex items-start gap-3 ${outcomeBg}`}>
        {outcomeIcon}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">Independent Review</span>
            <Badge variant={severityVariant(r.outcome)}>{r.outcome.replace(/_/g, ' ')}</Badge>
            <span className="text-xs text-forge-muted ml-auto">Reviewed independently of other agents</span>
          </div>
          <p className="text-sm leading-relaxed">{r.reasoning}</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-3">
        <ReviewCheck label="Addresses Root Cause" value={r.addressesRootCause} />
        <ReviewCheck label="Sufficient Evidence" value={r.sufficientEvidence} />
        <ReviewCheck label="Tests Sufficient" value={r.testsSufficient} />
        <ReviewCheck label="Security Clear" value={r.securityClear} />
      </div>

      <Card>
        <div className="text-xs text-forge-muted mb-1.5 font-medium">Regression Risk Assessment</div>
        <Badge variant={r.regressionRisk === 'LOW' ? 'success' : r.regressionRisk === 'HIGH' ? 'critical' : 'warning'}>
          {r.regressionRisk} REGRESSION RISK
        </Badge>
      </Card>

      {r.simplificationNote && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Lightbulb size={13} className="text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Simplification Note</span>
          </div>
          <p className="text-sm text-forge-muted">{r.simplificationNote}</p>
        </div>
      )}
    </div>
  );
}

function ReviewCheck({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-3 flex items-center gap-2">
      {value
        ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
        : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
      <span className="text-sm">{label}</span>
    </div>
  );
}
