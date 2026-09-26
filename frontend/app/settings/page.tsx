import { Card } from '@/components/ui/Card';
import { Settings, Shield, Zap } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-forge-muted text-sm">Configuration and integrations</p>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-forge-accent" />
            <span className="text-sm font-semibold">AI Configuration</span>
          </div>
          <div className="space-y-2 text-sm text-forge-muted">
            <p>AI provider is configured via <code className="font-mono bg-forge-bg px-1.5 py-0.5 rounded text-xs">OPENAI_API_KEY</code> environment variable.</p>
            <p>When <code className="font-mono bg-forge-bg px-1.5 py-0.5 rounded text-xs">DEMO_MODE=true</code>, pre-crafted analysis responses are used without calling the AI API.</p>
            <p>Max iterations: <code className="font-mono bg-forge-bg px-1.5 py-0.5 rounded text-xs">MAX_ITERATIONS</code> (default: 3)</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-blue-400" />
            <span className="text-sm font-semibold">Security</span>
          </div>
          <div className="space-y-2 text-sm text-forge-muted">
            <p>No credentials or secrets are stored in the database.</p>
            <p>API keys are read from environment variables only.</p>
            <p>GitHub integration requires OAuth configuration (not enabled in demo mode).</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} className="text-forge-muted" />
            <span className="text-sm font-semibold">Environment Variables</span>
          </div>
          <div className="font-mono text-xs space-y-1 text-forge-muted">
            {[
              ['DATABASE_URL', 'SQLite database path', 'required'],
              ['PORT', 'Backend API port', '3001'],
              ['OPENAI_API_KEY', 'OpenAI API key for AI agents', 'optional'],
              ['DEMO_MODE', 'Use demo simulation instead of AI', 'true'],
              ['FRONTEND_URL', 'Frontend URL for CORS', 'http://localhost:3000'],
              ['MAX_ITERATIONS', 'Max agent iteration loops', '3'],
            ].map(([key, desc, def]) => (
              <div key={key} className="flex gap-3 py-1 border-b border-forge-border/50 last:border-0">
                <span className="text-forge-accent w-36 flex-shrink-0">{key}</span>
                <span className="flex-1">{desc}</span>
                <span className="text-forge-muted/60">default: {def}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
