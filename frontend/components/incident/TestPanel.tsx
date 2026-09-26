'use client';
import { useState } from 'react';
import { TestTube, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, severityVariant } from '@/components/ui/Badge';

export function TestPanel({ inv }: { inv: any }) {
  if (!inv?.testResult) return <div className="text-center py-12 text-forge-muted text-sm">Tests not yet generated.</div>;

  const t = inv.testResult;
  const tests = parseJson(t.generatedTests);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TestStat
          label="Existing Tests"
          passed={t.existingPassed}
          total={t.existingTotal}
        />
        <TestStat
          label="New Regression Tests"
          passed={t.newTestsPassed}
          total={t.newTestsTotal}
          highlight
        />
        <TestStat
          label="Edge Cases"
          passed={t.edgeCasesPassed}
          total={t.edgeCasesTotal}
        />
        <div className="bg-forge-surface border border-forge-border rounded-lg p-3">
          <div className="text-xs text-forge-muted mb-1">Regression Risk</div>
          <Badge variant={t.regressionRisk === 'LOW' ? 'success' : t.regressionRisk === 'MEDIUM' ? 'warning' : 'critical'}>
            {t.regressionRisk}
          </Badge>
        </div>
      </div>

      {/* Execution status */}
      {t.executionStatus === 'SIMULATED' && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-yellow-400 text-xs">
          <AlertCircle size={13} />
          <span>
            <strong>DEMO SIMULATION</strong> — Tests shown are generated but not executed in this environment.
            {t.executionStatus === 'SIMULATED' && ' Results are illustrative.'}
          </span>
        </div>
      )}

      {t.coverageInfo && (
        <Card>
          <div className="text-xs text-forge-muted font-medium mb-1">Coverage</div>
          <div className="text-sm text-green-400 font-mono">{t.coverageInfo}</div>
        </Card>
      )}

      {/* Generated tests */}
      {tests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Generated Tests</h3>
          <div className="space-y-3">
            {tests.map((test: any, i: number) => (
              <TestCard key={i} test={test} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TestStat({ label, passed, total, highlight }: { label: string; passed: number; total: number; highlight?: boolean }) {
  const allPass = passed === total && total > 0;
  return (
    <div className={`bg-forge-surface border rounded-lg p-3 ${highlight ? 'border-forge-accent/30' : 'border-forge-border'}`}>
      <div className="text-xs text-forge-muted mb-1.5">{label}</div>
      <div className="flex items-center gap-1.5">
        {allPass ? <CheckCircle2 size={13} className="text-green-400" /> : <XCircle size={13} className="text-red-400" />}
        <span className={`text-sm font-semibold ${allPass ? 'text-green-400' : 'text-red-400'}`}>
          {passed}/{total}
        </span>
      </div>
    </div>
  );
}

function TestCard({ test }: { test: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-forge-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-forge-surface hover:bg-white/3 transition-colors text-left"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
        <span className="text-sm font-mono flex-1">{test.name}</span>
        <Badge variant={test.type === 'REGRESSION' ? 'critical' : test.type === 'EDGE_CASE' ? 'warning' : 'info'}>
          {test.type}
        </Badge>
      </button>
      {open && (
        <div className="border-t border-forge-border p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-forge-muted mb-1">Bug Prevented</div>
              <p className="text-sm text-red-300">{test.bugPrevented}</p>
            </div>
            <div>
              <div className="text-xs text-forge-muted mb-1">Expected Behavior</div>
              <p className="text-sm text-green-300">{test.expectedBehavior}</p>
            </div>
          </div>
          <div>
            <div className="text-xs text-forge-muted mb-1.5 font-mono">{test.filePath}</div>
            <pre className="text-xs font-mono bg-forge-bg rounded p-3 overflow-x-auto text-forge-text leading-relaxed">
              {test.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function parseJson(val: any): any[] {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}
