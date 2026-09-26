'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgePage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then(data => {
      setIncidents(data.filter((i: any) => i.knowledgeCard));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6"><PageSpinner /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Knowledge Base</h1>
        <p className="text-forge-muted text-sm">Lessons learned from resolved incidents</p>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-16 text-forge-muted">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No knowledge cards yet. Resolve incidents to build institutional knowledge.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((inc: any) => (
            <Link key={inc.id} href={`/incidents/${inc.id}?tab=knowledge`}>
              <Card className="hover:border-forge-accent/40 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="text-forge-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-forge-muted">{inc.incidentId}</span>
                      <span className="text-sm font-medium">{inc.title}</span>
                      <Badge variant={severityVariant(inc.severity)} className="ml-auto">{inc.severity}</Badge>
                    </div>
                    <p className="text-sm text-forge-muted line-clamp-2">{inc.knowledgeCard?.rootCauseSummary}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-forge-muted">{inc.knowledgeCard?.testsAdded} tests added</span>
                      <span className="text-xs text-forge-muted">·</span>
                      <span className="text-xs text-forge-muted">{inc.knowledgeCard?.securityStatus?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
