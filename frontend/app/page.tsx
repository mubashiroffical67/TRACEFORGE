'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Shield, TestTube, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, i] = await Promise.all([api.getStats(), api.getIncidents()]);
      setStats(s);
      setIncidents(i.slice(0, 8));
    } catch {
      // backend may not be up yet
    } finally {
      setLoading(false);
    }
  }

  async function seedDemo() {
    setSeeding(true);
    try {
      await api.seedDemo();
      await loadData();
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return (
    <div className="p-6">
      <PageSpinner />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-forge-text">Dashboard</h1>
          <p className="text-forge-muted text-sm mt-0.5">Incident response overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" loading={seeding} onClick={seedDemo}>
            Load Demo Incident
          </Button>
          <Link href="/incidents/new">
            <Button size="sm" icon={<AlertCircle size={13} />}>New Incident</Button>
          </Link>
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-forge-accent/10 via-purple-500/5 to-transparent border border-forge-accent/20 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-forge-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-forge-accent" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-forge-text mb-1">From Production Incident to Verified Fix</h2>
            <p className="text-forge-muted text-sm leading-relaxed">
              TraceForge uses a multi-agent workflow to investigate software incidents, trace evidence, propose minimal fixes,
              generate regression tests, perform security analysis, and independently review the result.
            </p>
          </div>
          <Link href="/incidents/demo">
            <Button size="sm" variant="secondary" icon={<ArrowRight size={12} />}>
              View Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Active Incidents" value={stats?.investigating ?? 0} icon={<AlertCircle size={14} />} color="text-yellow-400" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<CheckCircle2 size={14} />} color="text-green-400" />
        <StatCard label="Avg Resolution" value={`${stats?.avgResolutionMinutes ?? 0}m`} icon={<Clock size={14} />} color="text-blue-400" />
        <StatCard label="Tests Generated" value={stats?.testsGenerated ?? 0} icon={<TestTube size={14} />} color="text-purple-400" />
        <StatCard label="Security Findings" value={stats?.securityFindings ?? 0} icon={<Shield size={14} />} color="text-orange-400" />
        <StatCard label="Total Incidents" value={stats?.total ?? 0} icon={<TrendingUp size={14} />} color="text-forge-accent" />
      </div>

      {/* Recent incidents */}
      <Card noPadding>
        <div className="flex items-center justify-between px-4 py-3 border-b border-forge-border">
          <h3 className="text-sm font-semibold">Recent Incidents</h3>
          <Link href="/incidents" className="text-xs text-forge-accent hover:underline">View all</Link>
        </div>
        {incidents.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle size={24} className="text-forge-muted mx-auto mb-3 opacity-40" />
            <p className="text-forge-muted text-sm">No incidents yet.</p>
            <p className="text-forge-muted text-xs mt-1">
              <button onClick={seedDemo} className="text-forge-accent hover:underline">Load the demo incident</button>{' '}
              or <Link href="/incidents/new" className="text-forge-accent hover:underline">create a new one</Link>.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forge-border">
            {incidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {inc.status === 'RESOLVED'
                    ? <CheckCircle2 size={15} className="text-green-400" />
                    : inc.status === 'INVESTIGATING'
                    ? <Clock size={15} className="text-yellow-400 animate-pulse-forge" />
                    : <AlertCircle size={15} className="text-forge-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-forge-muted">{inc.incidentId}</span>
                    <span className="text-sm text-forge-text truncate group-hover:text-forge-accent transition-colors">{inc.title}</span>
                  </div>
                  <div className="text-xs text-forge-muted mt-0.5">
                    {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true })}
                    {inc.affectedService && <> · {inc.affectedService}</>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={severityVariant(inc.severity)}>{inc.severity}</Badge>
                  <Badge variant={severityVariant(inc.status)}>{inc.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Architecture flow */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3">Agent Workflow</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {['Incident', 'Detective', 'Root Cause', 'Fix Engineer', 'Test Engineer', 'Security', 'Review', 'Verification', 'PR'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-1">
              <div className="px-3 py-1.5 bg-forge-surface border border-forge-border rounded text-xs text-forge-text">
                {step}
              </div>
              {i < arr.length - 1 && <span className="text-forge-muted text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-forge-muted">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-forge-text">{value}</div>
    </Card>
  );
}
