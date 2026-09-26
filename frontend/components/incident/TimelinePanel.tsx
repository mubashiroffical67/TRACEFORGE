import { CheckCircle2, Clock, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STEP_LABELS: Record<string, string> = {
  detective: 'Incident Detective',
  root_cause: 'Root Cause Analyst',
  fix: 'Fix Engineer',
  tests: 'Test Engineer',
  security: 'Security Engineer',
  review: 'Independent Reviewer',
  verification: 'Verification',
  completed: 'Resolved',
};

export function TimelinePanel({ inv, isRunning }: { inv: any; isRunning?: boolean }) {
  if (!inv) return null;

  const events = inv.timelineEvents || [];
  const currentStep = inv.currentStep;

  // If running but no events yet, show placeholder
  if (isRunning && events.length === 0) {
    return (
      <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={14} className="text-yellow-400 animate-spin" />
          Investigation Timeline
        </h3>
        <div className="flex items-center gap-2 text-forge-muted text-sm">
          <Loader2 size={13} className="animate-spin text-forge-accent" />
          Starting investigation...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forge-surface border border-forge-border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        {isRunning ? <Clock size={14} className="text-yellow-400" /> : <CheckCircle2 size={14} className="text-green-400" />}
        Investigation Timeline
        {inv.iterationCount > 0 && (
          <span className="text-xs text-forge-muted ml-auto">{inv.iterationCount} iteration(s)</span>
        )}
      </h3>

      <div className="relative">
        {events.map((event: any, i: number) => (
          <div key={event.id} className="flex gap-3 mb-3 last:mb-0">
            {/* Connector line */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                event.status === 'COMPLETED' ? 'bg-green-500/15 border border-green-500/30' :
                event.status === 'RUNNING' ? 'bg-yellow-500/15 border border-yellow-500/30' :
                event.status === 'FAILED' ? 'bg-red-500/15 border border-red-500/30' :
                'bg-forge-border/50'
              }`}>
                {event.status === 'COMPLETED' && <CheckCircle2 size={12} className="text-green-400" />}
                {event.status === 'RUNNING' && <Loader2 size={12} className="text-yellow-400 animate-spin" />}
                {event.status === 'FAILED' && <XCircle size={12} className="text-red-400" />}
              </div>
              {i < events.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 mb-0 min-h-4 ${
                  event.status === 'COMPLETED' ? 'bg-green-500/20' : 'bg-forge-border'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-forge-text">
                  {STEP_LABELS[event.step] || event.step}
                </span>
                {event.durationMs && (
                  <span className="text-xs text-forge-muted">
                    {event.durationMs < 1000 ? `${event.durationMs}ms` : `${(event.durationMs / 1000).toFixed(1)}s`}
                  </span>
                )}
              </div>
              <div className="text-xs text-forge-muted mt-0.5">{event.description}</div>
              <div className="text-xs text-forge-muted opacity-60 mt-0.5">
                {formatDistanceToNow(new Date(event.startedAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}

        {/* Running step placeholder */}
        {isRunning && currentStep && currentStep !== 'completed' && (
          <div className="flex gap-3">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-500/15 border border-yellow-500/30">
                <Loader2 size={12} className="text-yellow-400 animate-spin" />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-yellow-400">
                {STEP_LABELS[currentStep] || currentStep}
              </span>
              <span className="text-xs text-forge-muted animate-pulse">Running...</span>
            </div>
          </div>
        )}
      </div>

      {inv.status === 'COMPLETED' && (
        <div className="mt-3 pt-3 border-t border-forge-border flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 size={14} />
          Investigation complete
          {inv.completedAt && (
            <span className="text-forge-muted text-xs ml-auto">
              {formatDistanceToNow(new Date(inv.completedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
