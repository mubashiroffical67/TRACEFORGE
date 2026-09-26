'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewIncidentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'HIGH',
    errorMessage: '',
    stackTrace: '',
    logs: '',
    affectedService: '',
    expectedBehavior: '',
    actualBehavior: '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const inc = await api.createIncident(form);
      router.push(`/incidents/${inc.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/incidents">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />}>Back</Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">New Incident</h1>
          <p className="text-forge-muted text-sm">Report a production incident for investigation</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Incident Details</h3>
          <div className="space-y-3">
            <Field label="Title *" required>
              <input
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Brief description of the incident"
                className={inputCls}
              />
            </Field>
            <Field label="Severity *">
              <select value={form.severity} onChange={e => set('severity', e.target.value)} className={inputCls}>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Description *" required>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="What is happening? Include impact, frequency, and any context..."
                className={inputCls}
              />
            </Field>
            <Field label="Affected Service">
              <input
                value={form.affectedService}
                onChange={e => set('affectedService', e.target.value)}
                placeholder="e.g. checkout-api, payment-service"
                className={inputCls}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-3">Error Information</h3>
          <div className="space-y-3">
            <Field label="Error Message">
              <input
                value={form.errorMessage}
                onChange={e => set('errorMessage', e.target.value)}
                placeholder="TypeError: Cannot read properties of undefined..."
                className={inputCls}
              />
            </Field>
            <Field label="Stack Trace">
              <textarea
                rows={6}
                value={form.stackTrace}
                onChange={e => set('stackTrace', e.target.value)}
                placeholder="Paste the full stack trace here..."
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>
            <Field label="Logs">
              <textarea
                rows={4}
                value={form.logs}
                onChange={e => set('logs', e.target.value)}
                placeholder="Paste relevant log lines here..."
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-3">Behavior</h3>
          <div className="space-y-3">
            <Field label="Expected Behavior">
              <textarea
                rows={2}
                value={form.expectedBehavior}
                onChange={e => set('expectedBehavior', e.target.value)}
                placeholder="What should happen?"
                className={inputCls}
              />
            </Field>
            <Field label="Actual Behavior">
              <textarea
                rows={2}
                value={form.actualBehavior}
                onChange={e => set('actualBehavior', e.target.value)}
                placeholder="What is actually happening?"
                className={inputCls}
              />
            </Field>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" loading={submitting} icon={<AlertCircle size={13} />}>
            Create Incident
          </Button>
          <Link href="/incidents">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full bg-forge-bg border border-forge-border rounded-md px-3 py-2 text-sm text-forge-text placeholder-forge-muted focus:outline-none focus:border-forge-accent transition-colors resize-none';

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-forge-muted mb-1.5 font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
