'use client';
import { useState } from 'react';
import { GitCommit, Plus, Minus, ChevronDown, ChevronRight, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function PatchPanel({ inv }: { inv: any }) {
  if (!inv?.patch) return <div className="text-center py-12 text-forge-muted text-sm">Fix not yet generated.</div>;

  const patch = inv.patch;
  const fileDiffs = parseJson(patch.fileDiffs);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <GitCommit size={15} className="text-forge-accent" />
          <span className="text-sm font-semibold">Proposed Fix</span>
          <Badge variant={patch.riskLevel === 'LOW' ? 'success' : patch.riskLevel === 'MEDIUM' ? 'warning' : 'critical'}>
            {patch.riskLevel} RISK
          </Badge>
        </div>
        <p className="text-sm text-forge-text mb-3">{patch.summary}</p>
        <div className="flex items-center gap-4 text-xs text-forge-muted">
          <span className="text-green-400">+{patch.linesAdded} lines</span>
          <span className="text-red-400">-{patch.linesRemoved} lines</span>
          <span>{patch.filesModified} file(s) modified</span>
        </div>
      </div>

      <Card>
        <div className="text-xs text-forge-muted font-medium mb-2">Rationale</div>
        <p className="text-sm leading-relaxed">{patch.rationale}</p>
      </Card>

      {/* File diffs */}
      {fileDiffs.map((diff: any, i: number) => (
        <FileDiffView key={i} diff={diff} />
      ))}
    </div>
  );
}

function FileDiffView({ diff }: { diff: any }) {
  const [open, setOpen] = useState(true);
  const hunks = diff.hunks || [];

  return (
    <div className="border border-forge-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-forge-surface hover:bg-white/3 transition-colors text-left"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <FileCode size={13} className="text-forge-muted" />
        <span className="font-mono text-sm text-forge-accent flex-1">{diff.filePath}</span>
        <span className="text-xs text-green-400">+{diff.linesAdded}</span>
        <span className="text-xs text-red-400 ml-1">-{diff.linesRemoved}</span>
      </button>

      {open && (
        <>
          {diff.changeReason && (
            <div className="px-4 py-2 bg-blue-500/5 border-t border-forge-border text-xs text-forge-muted">
              <span className="text-blue-400 font-medium">Why:</span> {diff.changeReason}
            </div>
          )}
          <div className="font-mono text-xs overflow-x-auto">
            {hunks.map((hunk: any, hi: number) => (
              <div key={hi} className="border-t border-forge-border">
                <div className="px-4 py-1.5 bg-blue-500/5 text-blue-400/70 text-xs">
                  @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                </div>
                {hunk.lines.map((line: string, li: number) => (
                  <DiffLine key={li} line={line} />
                ))}
              </div>
            ))}
            {hunks.length === 0 && (
              <div>
                {/* Show old vs new directly if no hunks */}
                <div className="px-4 py-1.5 bg-red-500/5 text-red-400/70 text-xs border-t border-forge-border">
                  Previous
                </div>
                {diff.oldContent.split('\n').map((line: string, i: number) => (
                  <DiffLine key={`old-${i}`} line={`-  ${line}`} />
                ))}
                <div className="px-4 py-1.5 bg-green-500/5 text-green-400/70 text-xs border-t border-forge-border">
                  New
                </div>
                {diff.newContent.split('\n').map((line: string, i: number) => (
                  <DiffLine key={`new-${i}`} line={`+  ${line}`} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DiffLine({ line }: { line: string }) {
  const prefix = line[0];
  const isAdd = prefix === '+';
  const isRemove = prefix === '-';

  return (
    <div className={`px-4 py-0.5 whitespace-pre ${
      isAdd ? 'bg-green-500/10 text-green-300' :
      isRemove ? 'bg-red-500/10 text-red-300' :
      'text-forge-muted'
    }`}>
      {line}
    </div>
  );
}

function parseJson(val: any): any[] {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
