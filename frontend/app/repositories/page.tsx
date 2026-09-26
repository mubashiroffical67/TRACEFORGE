'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { GitBranch, Plus } from 'lucide-react';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', branch: 'main' });

  useEffect(() => {
    api.getRepositories().then(setRepos).finally(() => setLoading(false));
  }, []);

  async function addRepo(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const repo = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json());
      setRepos(r => [...r, repo]);
      setForm({ name: '', url: '', branch: 'main' });
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="p-6"><PageSpinner /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Repositories</h1>
        <p className="text-forge-muted text-sm">Connected repositories for analysis</p>
      </div>

      <Card className="mb-6">
        <h3 className="text-sm font-semibold mb-3">Add Repository</h3>
        <form onSubmit={addRepo} className="flex gap-2">
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Repository name" required className="flex-1 bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-forge-accent" />
          <input value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="URL (optional)" className="flex-1 bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-forge-accent" />
          <input value={form.branch} onChange={e => setForm(f => ({...f, branch: e.target.value}))} placeholder="Branch" className="w-24 bg-forge-bg border border-forge-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-forge-accent" />
          <Button type="submit" loading={adding} icon={<Plus size={13} />} size="sm">Add</Button>
        </form>
      </Card>

      {repos.length === 0 ? (
        <div className="text-center py-16 text-forge-muted">
          <GitBranch size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No repositories connected.</p>
          <p className="text-xs mt-1">The demo uses a built-in simulated repository.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repos.map((r: any) => (
            <div key={r.id} className="bg-forge-surface border border-forge-border rounded-lg px-4 py-3 flex items-center gap-3">
              <GitBranch size={14} className="text-forge-muted" />
              <div className="flex-1">
                <div className="text-sm font-medium">{r.name}</div>
                {r.url && <div className="text-xs text-forge-muted font-mono">{r.url}</div>}
              </div>
              <div className="text-xs font-mono text-forge-muted bg-forge-bg px-2 py-1 rounded">{r.branch}</div>
              {r.isDemo && <span className="text-xs text-blue-400">DEMO</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
