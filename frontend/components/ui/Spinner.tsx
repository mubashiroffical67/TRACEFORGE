import { Loader2 } from 'lucide-react';

export function Spinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-forge-muted text-sm">
      <Loader2 size={14} className="animate-spin text-forge-accent" />
      {text && <span>{text}</span>}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 size={24} className="animate-spin text-forge-accent" />
      <span className="text-forge-muted text-sm">Loading...</span>
    </div>
  );
}
