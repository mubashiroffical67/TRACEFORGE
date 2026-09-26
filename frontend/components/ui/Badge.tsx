import clsx from 'clsx';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info' | 'muted';

const variants: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
  high: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  low: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  success: 'bg-green-500/15 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20',
  info: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  muted: 'bg-white/5 text-forge-muted border border-forge-border',
};

export function severityVariant(s: string): BadgeVariant {
  const m: Record<string, BadgeVariant> = {
    CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
    PASS: 'success', WARNING: 'warning', FAIL: 'critical', INFO: 'info',
    APPROVED: 'success', NEEDS_REVISION: 'warning', INSUFFICIENT_EVIDENCE: 'muted',
    COMPLETED: 'success', FAILED: 'critical', RUNNING: 'info', PENDING: 'muted',
    RESOLVED: 'success', INVESTIGATING: 'info', OPEN: 'muted', CLOSED: 'muted',
  };
  return m[s?.toUpperCase()] ?? 'muted';
}

export function Badge({ children, variant, className }: {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
