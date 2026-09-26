'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function InvestigationsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then(data => {
      setIncidents(data.filter((i: any) => i.investigation));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><PageSpinner /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Investigations</h1>
        <p className="text-forge-muted text-sm">Active and completed investigation workflows</p>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-16 text-forge-muted">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No investigations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.map((inc: any) => (
            <Link key={inc.id} href={`/incidents/${inc.id}`}>
              <div className="bg-forge-surface border border-forge-border rounded-lg px-4 py-3 hover:border-forge-accent/40 transition-colors cursor-pointer flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-forge-muted">{inc.incidentId}</span>
                    <span className="text-sm">{inc.title}</span>
                  </div>
                  <div className="text-xs text-forge-muted mt-0.5">
                    Started {formatDistanceToNow(new Date(inc.investigation.startedAt), { addSuffix: true })}
                    {inc.investigation.iterationCount > 0 && ` · ${inc.investigation.iterationCount} iteration(s)`}
                  </div>
                </div>
                <Badge variant={inc.investigation.status === 'COMPLETED' ? 'success' : inc.investigation.status === 'RUNNING' ? 'info' : inc.investigation.status === 'FAILED' ? 'critical' : 'muted'}>
                  {inc.investigation.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
