import { Shield, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const severityIcon: Record<string, React.ReactNode> = {
  PASS: <CheckCircle2 size={13} className="text-green-400" />,
  WARNING: <AlertTriangle size={13} className="text-yellow-400" />,
  FAIL: <XCircle size={13} className="text-red-400" />,
  INFO: <Info size={13} className="text-blue-400" />,
};

const severityColor: Record<string, string> = {
  PASS: 'border-green-500/20',
  WARNING: 'border-yellow-500/20',
  FAIL: 'border-red-500/20',
  INFO: 'border-blue-500/20',
};

export function SecurityPanel({ inv }: { inv: any }) {
  if (!inv?.securityFindings?.length) {
    return <div className="text-center py-12 text-forge-muted text-sm">Security analysis not yet available.</div>;
  }

  const findings = inv.securityFindings;
  const hasFailures = findings.some((f: any) => f.severity === 'FAIL');
  const hasWarnings = findings.some((f: any) => f.severity === 'WARNING');
  const overallStatus = hasFailures ? 'FAILED' : hasWarnings ? 'PASSED_WITH_WARNINGS' : 'PASSED';

  return (
    <div className="space-y-4">
      {/* Overall status */}
      <div className={`border rounded-lg p-4 flex items-center gap-3 ${
        hasFailures ? 'bg-red-500/5 border-red-500/20' :
        hasWarnings ? 'bg-yellow-500/5 border-yellow-500/20' :
        'bg-green-500/5 border-green-500/20'
      }`}>
        <Shield size={20} className={hasFailures ? 'text-red-400' : hasWarnings ? 'text-yellow-400' : 'text-green-400'} />
        <div>
          <div className="text-sm font-semibold">Security Review</div>
          <div className={`text-sm ${hasFailures ? 'text-red-400' : hasWarnings ? 'text-yellow-400' : 'text-green-400'}`}>
            {overallStatus.replace(/_/g, ' ')}
          </div>
        </div>
        <div className="ml-auto text-xs text-forge-muted">
          {findings.filter((f: any) => f.severity === 'PASS').length} passed ·{' '}
          {findings.filter((f: any) => f.severity === 'WARNING').length} warnings ·{' '}
          {findings.filter((f: any) => f.severity === 'FAIL').length} failures
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-2">
        {findings.map((f: any) => (
          <div key={f.id} className={`bg-forge-surface border rounded-lg p-3.5 ${severityColor[f.severity] || 'border-forge-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              {severityIcon[f.severity]}
              <span className="text-sm font-medium text-forge-text">{f.title}</span>
              <span className="text-xs text-forge-muted/60 uppercase tracking-wider">{f.category.replace(/_/g, ' ')}</span>
              <Badge variant={
                f.severity === 'PASS' ? 'success' :
                f.severity === 'WARNING' ? 'warning' :
                f.severity === 'FAIL' ? 'critical' : 'info'
              } className="ml-auto">
                {f.severity}
              </Badge>
            </div>
            <p className="text-sm text-forge-muted mb-2">{f.description}</p>
            {f.affectedCode && (
              <div className="bg-forge-bg rounded px-2.5 py-1.5 font-mono text-xs text-yellow-300 mb-2">
                {f.affectedCode}
              </div>
            )}
            {f.severity !== 'PASS' && (
              <div className="text-xs text-forge-muted border-t border-forge-border pt-2 mt-2">
                <span className="text-blue-400 font-medium">Recommendation:</span> {f.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
