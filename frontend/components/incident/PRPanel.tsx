'use client';
import { useState } from 'react';
import { GitPullRequest, Copy, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function PRPanel({ incident }: { incident: any }) {
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const inv = incident.investigation;
  if (!inv?.patch) {
    return <div className="text-center py-12 text-forge-muted text-sm">PR generation requires a completed investigation with a proposed fix.</div>;
  }

  async function generatePR() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPR(incident.id);
      setPr(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyBody() {
    if (pr) {
      await navigator.clipboard.writeText(pr.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      {incident.isDemo && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-blue-400 text-xs">
          <AlertCircle size={13} />
          <span>
            <strong>DEMO MODE</strong> — Pull request generation shows the PR content.
            Automatic GitHub push requires a real repository integration.
          </span>
        </div>
      )}

      {!pr ? (
        <div className="border border-dashed border-forge-border rounded-lg p-8 text-center">
          <GitPullRequest size={24} className="text-forge-muted mx-auto mb-3" />
          <h3 className="font-medium mb-1">Generate Pull Request</h3>
          <p className="text-forge-muted text-sm mb-4">
            Create a PR-ready package with title, description, files changed, test summary, and security review.
          </p>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <Button icon={<GitPullRequest size={13} />} loading={loading} onClick={generatePR}>
            Generate PR Package
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* PR title */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <GitPullRequest size={14} className="text-forge-accent" />
              <span className="text-xs text-forge-muted font-medium">PR Title</span>
            </div>
            <div className="font-mono text-sm text-forge-text bg-forge-bg rounded px-3 py-2">
              {pr.title}
            </div>
          </Card>

          {/* Branch */}
          <Card>
            <div className="text-xs text-forge-muted font-medium mb-1.5">Branch</div>
            <div className="font-mono text-xs text-green-400 bg-forge-bg rounded px-3 py-1.5">
              {pr.branch}
            </div>
          </Card>

          {/* Files */}
          {pr.files?.length > 0 && (
            <Card>
              <div className="text-xs text-forge-muted font-medium mb-2">Files Changed</div>
              {pr.files.map((f: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm mb-1">
                  <FileCode size={12} className="text-forge-muted" />
                  <span className="font-mono text-forge-accent">{f.filePath}</span>
                  <span className="text-green-400 text-xs">+{f.linesAdded}</span>
                  <span className="text-red-400 text-xs">-{f.linesRemoved}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Body */}
          <div className="border border-forge-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-forge-surface border-b border-forge-border">
              <span className="text-xs font-medium text-forge-muted">PR Description (Markdown)</span>
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                onClick={copyBody}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="text-xs font-mono p-4 overflow-x-auto bg-forge-bg text-forge-muted leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
              {pr.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
