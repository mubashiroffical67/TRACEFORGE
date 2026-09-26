import { FileText, Code, Terminal, TestTube, Settings, AlertTriangle, Link2 } from 'lucide-react';
import { Badge, severityVariant } from '@/components/ui/Badge';

const typeIcons: Record<string, React.ReactNode> = {
  STACK_TRACE: <Terminal size={13} className="text-red-400" />,
  LOG: <FileText size={13} className="text-yellow-400" />,
  FILE: <Code size={13} className="text-blue-400" />,
  CODE_PATH: <Link2 size={13} className="text-purple-400" />,
  TEST: <TestTube size={13} className="text-green-400" />,
  CONFIG: <Settings size={13} className="text-orange-400" />,
  ERROR: <AlertTriangle size={13} className="text-red-400" />,
};

export function EvidenceChain({ incident, inv }: { incident: any; inv: any }) {
  if (!inv || !inv.evidenceItems?.length) {
    return (
      <div className="text-center py-12 text-forge-muted text-sm">
        No evidence collected yet. Start an investigation to analyze this incident.
      </div>
    );
  }

  const evidence = inv.evidenceItems;
  const hypothesis = inv.hypotheses?.find((h: any) => h.isPrimary);

  return (
    <div className="space-y-4">
      {/* Chain visualization */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Evidence Chain</h3>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['Incident', 'Error', 'Stack Trace', 'Function', 'File', 'Code Path', 'Root Cause', 'Fix', 'Test', 'Verification'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-1">
              <div className={`px-2.5 py-1.5 rounded border text-xs ${
                i < 6 ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                i < 8 ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}>
                {step}
              </div>
              {i < arr.length - 1 && <span className="text-forge-muted">↓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Incident header in chain */}
      <ChainNode
        step="1"
        title="Incident"
        type="INCIDENT"
        content={incident.description}
        badge={<Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>}
      />

      {/* Evidence items */}
      {evidence.map((ev: any, i: number) => (
        <ChainNode
          key={ev.id}
          step={String(i + 2)}
          title={ev.title}
          type={ev.type}
          content={ev.content}
          filePath={ev.filePath}
          lineNumber={ev.lineNumber}
          badge={<Badge variant={severityVariant(ev.relevance)}>{ev.relevance} RELEVANCE</Badge>}
          icon={typeIcons[ev.type]}
        />
      ))}

      {/* Root cause conclusion */}
      {hypothesis && (
        <ChainNode
          step={String(evidence.length + 2)}
          title="Root Cause Hypothesis"
          type="ROOT_CAUSE"
          content={hypothesis.explanation}
          badge={<Badge variant={severityVariant(hypothesis.confidence)}>{hypothesis.confidence} CONFIDENCE</Badge>}
          highlight
        />
      )}

      {/* Patch */}
      {inv.patch && (
        <ChainNode
          step={String(evidence.length + 3)}
          title="Proposed Fix"
          type="FIX"
          content={inv.patch.summary}
          badge={<Badge variant="muted">{inv.patch.filesModified} file(s) · +{inv.patch.linesAdded}/-{inv.patch.linesRemoved} lines</Badge>}
        />
      )}
    </div>
  );
}

function ChainNode({
  step, title, type, content, filePath, lineNumber, badge, icon, highlight,
}: {
  step: string;
  title: string;
  type: string;
  content: string;
  filePath?: string;
  lineNumber?: number;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${highlight ? 'ring-1 ring-forge-accent/30 rounded-lg' : ''}`}>
      {/* Step number + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
          highlight ? 'bg-forge-accent/15 border-forge-accent/40 text-forge-accent' :
          'bg-forge-surface border-forge-border text-forge-muted'
        }`}>
          {step}
        </div>
        <div className="w-0.5 flex-1 bg-forge-border min-h-4 mt-1" />
      </div>

      {/* Card */}
      <div className={`flex-1 mb-3 bg-forge-surface border rounded-lg p-3.5 ${highlight ? 'border-forge-accent/30' : 'border-forge-border'}`}>
        <div className="flex items-center gap-2 mb-2">
          {icon || <div className="w-3 h-3" />}
          <span className="text-sm font-medium text-forge-text">{title}</span>
          <span className="text-xs text-forge-muted/60 uppercase tracking-wider ml-0.5">{type.replace('_', ' ')}</span>
          <div className="ml-auto">{badge}</div>
        </div>
        {filePath && (
          <div className="text-xs font-mono text-forge-accent mb-1.5">
            {filePath}{lineNumber ? `:${lineNumber}` : ''}
          </div>
        )}
        <p className="text-sm text-forge-muted leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
