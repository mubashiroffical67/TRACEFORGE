'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, AlertCircle, CheckCircle2, Clock, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(i => {
    if (filter !== 'ALL' && i.status !== filter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.incidentId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="p-6"><PageSpinner /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Incidents</h1>
          <p className="text-forge-muted text-sm">{incidents.length} total incidents</p>
        </div>
        <Link href="/incidents/new">
          <Button icon={<Plus size={13} />}>New Incident</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-forge-muted" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-forge-surface border border-forge-border rounded-md pl-8 pr-3 py-1.5 text-sm text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-accent"
          />
        </div>
        {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === s ? 'bg-forge-accent/10 text-forge-accent border border-forge-accent/20' : 'text-forge-muted hover:text-forge-text'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-forge-surface border border-forge-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-forge-border bg-white/2">
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Incident ID</th>
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Title</th>
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Severity</th>
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Status</th>
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Service</th>
              <th className="text-left px-4 py-2.5 text-xs text-forge-muted font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forge-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-forge-muted text-sm">
                  No incidents found.{' '}
                  <Link href="/incidents/new" className="text-forge-accent hover:underline">Create one</Link>
                </td>
              </tr>
            )}
            {filtered.map(inc => (
              <tr key={inc.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/incidents/${inc.id}`} className="font-mono text-xs text-forge-accent hover:underline">
                    {inc.incidentId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/incidents/${inc.id}`} className="text-sm text-forge-text hover:text-forge-accent transition-colors flex items-center gap-1.5">
                    {inc.status === 'RESOLVED' ? <CheckCircle2 size={12} className="text-green-400" /> :
                     inc.status === 'INVESTIGATING' ? <Clock size={12} className="text-yellow-400" /> :
                     <AlertCircle size={12} className="text-forge-muted" />}
                    {inc.title}
                    {inc.isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-medium">DEMO</span>}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={severityVariant(inc.severity)}>{inc.severity}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={severityVariant(inc.status)}>{inc.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-forge-muted">{inc.affectedService || '—'}</td>
                <td className="px-4 py-3 text-xs text-forge-muted">
                  {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
