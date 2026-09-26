import { Brain, ChevronDown, ChevronRight, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

export function RootCausePanel({ inv }: { inv: any }) {
  if (!inv?.hypotheses?.length) {
    return <EmptyState />;
  }

  const primary = inv.hypotheses.find((h: any) => h.isPrimary) || inv.hypotheses[0];
  const alternatives = inv.hypotheses.filter((h: any) => !h.isPrimary);

  return (
    <div className="space-y-4">
      {/* Primary hypothesis */}
      <div className="bg-forge-surface border border-forge-accent/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-forge-accent" />
          <span className="text-sm font-semibold text-forge-text">Primary Root Cause Hypothesis</span>
          <span className="ml-auto text-xs text-forge-muted italic">AI-generated assessment</span>
        </div>

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge variant={severityVariant(primary.confidence)}>
            {primary.confidence} CONFIDENCE
          </Badge>
          {primary.confidenceScore && (
            <span className="text-xs text-forge-muted">
              ({Math.round(primary.confidenceScore * 100)}% — AI estimate)
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-forge-text mb-4">{primary.explanation}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <EvidenceSection
            title="Supporting Evidence"
            items={parseJson(primary.supportingEvidence)}
            icon={<CheckCircle2 size={12} className="text-green-400" />}
            color="text-green-400"
          />
          <EvidenceSection
            title="Contradicting Evidence"
            items={parseJson(primary.contradictingEvidence)}
            icon={<XCircle size={12} className="text-red-400" />}
            color="text-red-400"
            empty="None identified"
          />
          <EvidenceSection
            title="Missing Evidence"
            items={parseJson(primary.missingEvidence)}
            icon={<HelpCircle size={12} className="text-yellow-400" />}
            color="text-yellow-400"
            empty="None identified"
          />
        </div>
      </div>

      {/* Affected files & functions */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-xs text-forge-muted font-medium mb-2">Affected Files</div>
          {parseJson(primary.affectedFiles).map((f: string) => (
            <div key={f} className="font-mono text-xs text-forge-accent bg-forge-bg rounded px-2 py-1 mb-1">{f}</div>
          ))}
        </Card>
        <Card>
          <div className="text-xs text-forge-muted font-medium mb-2">Affected Functions</div>
          {parseJson(primary.affectedFunctions).map((f: string) => (
            <div key={f} className="font-mono text-xs text-purple-400 bg-forge-bg rounded px-2 py-1 mb-1">{f}</div>
          ))}
        </Card>
      </div>

      {/* Assumptions */}
      {parseJson(primary.assumptions).length > 0 && (
        <Card>
          <div className="text-xs text-forge-muted font-medium mb-2">Assumptions</div>
          <ul className="space-y-1">
            {parseJson(primary.assumptions).map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-forge-muted">
                <span className="text-yellow-400 mt-0.5 flex-shrink-0">⚠</span>
                {a}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Alternative hypotheses */}
      {alternatives.length > 0 && (
        <Card>
          <div className="text-xs text-forge-muted font-medium mb-3">Alternative Hypotheses</div>
          {alternatives.map((h: any) => (
            <AlternativeHypothesis key={h.id} hypothesis={h} />
          ))}
        </Card>
      )}
    </div>
  );
}

function EvidenceSection({ title, items, icon, color, empty }: any) {
  return (
    <div className="bg-forge-bg rounded-lg p-3">
      <div className={`text-xs font-medium mb-2 flex items-center gap-1.5 ${color}`}>
        {icon} {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-forge-muted italic">{empty || 'None'}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item: string, i: number) => (
            <li key={i} className="text-xs text-forge-text leading-relaxed flex items-start gap-1.5">
              <span className={`${color} mt-0.5 flex-shrink-0`}>·</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AlternativeHypothesis({ hypothesis }: { hypothesis: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-forge-border rounded-md mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/3 transition-colors"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span className="text-sm text-forge-text flex-1">{hypothesis.explanation.substring(0, 80)}...</span>
        <Badge variant={severityVariant(hypothesis.confidence)}>{hypothesis.confidence}</Badge>
      </button>
      {open && (
        <div className="px-3 pb-3 text-sm text-forge-muted">{hypothesis.explanation}</div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-forge-muted text-sm">
      Root cause analysis not yet available. Start an investigation first.
    </div>
  );
}

function parseJson(val: any): any[] {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
