'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { AlertCircle, Play, Clock, CheckCircle2, ArrowLeft, Zap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge, severityVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EvidenceChain } from './EvidenceChain';
import { RootCausePanel } from './RootCausePanel';
import { PatchPanel } from './PatchPanel';
import { TestPanel } from './TestPanel';
import { SecurityPanel } from './SecurityPanel';
import { ReviewPanel } from './ReviewPanel';
import { KnowledgeCardPanel } from './KnowledgeCardPanel';
import { TimelinePanel } from './TimelinePanel';
import { PRPanel } from './PRPanel';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'root-cause', label: 'Root Cause' },
  { id: 'patch', label: 'Fix' },
  { id: 'tests', label: 'Tests' },
  { id: 'security', label: 'Security' },
  { id: 'review', label: 'Review' },
  { id: 'pr', label: 'Pull Request' },
  { id: 'knowledge', label: 'Knowledge Card' },
];

interface Props {
  incident: any;
  onRefresh: () => void;
}

export function IncidentWorkspace({ incident, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState('summary');
  const [investigating, setInvestigating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const inv = incident.investigation;
  const isRunning = inv?.status === 'RUNNING' || incident.status === 'INVESTIGATING';
  const isComplete = inv?.status === 'COMPLETED';

  async function startInvestigation() {
    setInvestigating(true);
    try {
      await api.investigateIncident(incident.id);
      onRefresh();
    } finally {
      setInvestigating(false);
    }
  }

  async function resetDemo() {
    if (!incident.isDemo) return;
    setResetting(true);
    try {
      await api.resetDemo();
      await api.seedDemo();
      window.location.reload();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="border-b border-forge-border px-6 py-3 flex items-center gap-4 bg-forge-surface flex-shrink-0">
        <Link href="/incidents">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />}>Incidents</Button>
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-xs text-forge-muted">{incident.incidentId}</span>
          <span className="text-forge-muted">·</span>
          <span className="text-sm font-medium text-forge-text truncate">{incident.title}</span>
          {incident.isDemo && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-medium border border-blue-500/20 flex-shrink-0">
              DEMO SIMULATION
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
          <Badge variant={severityVariant(incident.status)}>{incident.status}</Badge>
          {incident.isDemo && (
            <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />} loading={resetting} onClick={resetDemo}>
              Reset Demo
            </Button>
          )}
          {!isComplete && !isRunning && (
            <Button size="sm" icon={<Play size={12} />} loading={investigating} onClick={startInvestigation}>
              Investigate
            </Button>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 text-yellow-400 text-xs">
              <Clock size={12} className="animate-spin" />
              Investigating...
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <CheckCircle2 size={12} />
              Resolved
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-forge-border px-6 flex gap-0 bg-forge-surface flex-shrink-0 overflow-x-auto">
        {TABS.map(tab => {
          const hasData = tabHasData(tab.id, inv, incident);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-forge-accent text-forge-accent'
                  : 'border-transparent text-forge-muted hover:text-forge-text'
              } ${!hasData && tab.id !== 'summary' ? 'opacity-40' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">
          {activeTab === 'summary' && <SummaryTab incident={incident} inv={inv} isRunning={isRunning} onInvestigate={startInvestigation} investigating={investigating} />}
          {activeTab === 'evidence' && <EvidenceChain incident={incident} inv={inv} />}
          {activeTab === 'root-cause' && <RootCausePanel inv={inv} />}
          {activeTab === 'patch' && <PatchPanel inv={inv} />}
          {activeTab === 'tests' && <TestPanel inv={inv} />}
          {activeTab === 'security' && <SecurityPanel inv={inv} />}
          {activeTab === 'review' && <ReviewPanel inv={inv} />}
          {activeTab === 'pr' && <PRPanel incident={incident} />}
          {activeTab === 'knowledge' && <KnowledgeCardPanel incident={incident} />}
        </div>
      </div>
    </div>
  );
}

function tabHasData(tabId: string, inv: any, incident: any): boolean {
  if (tabId === 'summary') return true;
  if (!inv) return false;
  if (tabId === 'evidence') return inv.evidenceItems?.length > 0;
  if (tabId === 'root-cause') return inv.hypotheses?.length > 0;
  if (tabId === 'patch') return !!inv.patch;
  if (tabId === 'tests') return !!inv.testResult;
  if (tabId === 'security') return inv.securityFindings?.length > 0;
  if (tabId === 'review') return !!inv.review;
  if (tabId === 'pr') return !!inv.patch;
  if (tabId === 'knowledge') return !!incident.knowledgeCard;
  return false;
}

function SummaryTab({ incident, inv, isRunning, onInvestigate, investigating }: any) {
  return (
    <div className="space-y-4">
      {/* Incident header */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-forge-muted mb-1">Incident ID</div>
            <div className="font-mono text-sm text-forge-accent">{incident.incidentId}</div>
          </div>
          <div>
            <div className="text-xs text-forge-muted mb-1">Severity</div>
            <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
          </div>
          <div>
            <div className="text-xs text-forge-muted mb-1">Status</div>
            <Badge variant={severityVariant(incident.status)}>{incident.status}</Badge>
          </div>
          <div>
            <div className="text-xs text-forge-muted mb-1">Affected Service</div>
            <div className="text-sm">{incident.affectedService || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-forge-muted mb-1">Created</div>
            <div className="text-sm">{format(new Date(incident.createdAt), 'MMM d, yyyy HH:mm')}</div>
          </div>
          {incident.resolvedAt && (
            <div>
              <div className="text-xs text-forge-muted mb-1">Resolved</div>
              <div className="text-sm text-green-400">{formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}</div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-xs text-forge-muted mb-1.5 font-medium">Description</div>
        <p className="text-sm leading-relaxed">{incident.description}</p>
      </Card>

      {incident.errorMessage && (
        <Card>
          <div className="text-xs text-forge-muted mb-1.5 font-medium">Error Message</div>
          <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono bg-red-500/5 rounded p-2">{incident.errorMessage}</pre>
        </Card>
      )}

      {incident.stackTrace && (
        <Card>
          <div className="text-xs text-forge-muted mb-1.5 font-medium">Stack Trace</div>
          <pre className="text-xs text-forge-muted whitespace-pre-wrap font-mono bg-black/20 rounded p-3 overflow-x-auto max-h-48">{incident.stackTrace}</pre>
        </Card>
      )}

      {(incident.expectedBehavior || incident.actualBehavior) && (
        <div className="grid grid-cols-2 gap-4">
          {incident.expectedBehavior && (
            <Card>
              <div className="text-xs text-forge-muted mb-1.5 font-medium">Expected Behavior</div>
              <p className="text-sm">{incident.expectedBehavior}</p>
            </Card>
          )}
          {incident.actualBehavior && (
            <Card>
              <div className="text-xs text-forge-muted mb-1.5 font-medium">Actual Behavior</div>
              <p className="text-sm text-red-300">{incident.actualBehavior}</p>
            </Card>
          )}
        </div>
      )}

      {/* Investigation CTA or timeline */}
      {!inv && !isRunning && (
        <div className="border border-dashed border-forge-border rounded-lg p-6 text-center">
          <Zap size={20} className="text-forge-accent mx-auto mb-3" />
          <h3 className="font-medium mb-1">Ready to Investigate</h3>
          <p className="text-forge-muted text-sm mb-4">
            Start the multi-agent investigation workflow to identify root cause, generate a fix, tests, and security review.
          </p>
          <Button icon={<Play size={13} />} loading={investigating} onClick={onInvestigate}>
            Investigate Incident
          </Button>
        </div>
      )}

      {(isRunning || inv) && <TimelinePanel inv={inv} isRunning={isRunning} />}
    </div>
  );
}
