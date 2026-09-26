'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { IncidentWorkspace } from '@/components/incident/IncidentWorkspace';

export default function IncidentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      // Handle 'demo' route — redirect to actual demo incident
      if (id === 'demo') {
        const demo = await api.getDemo();
        if (!demo) {
          await api.seedDemo();
          const seeded = await api.getDemo();
          if (seeded) router.replace(`/incidents/${seeded.id}`);
        } else {
          router.replace(`/incidents/${demo.id}`);
        }
        return;
      }
      const data = await api.getIncident(id);
      setIncident(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  // Poll while investigation is running
  useEffect(() => {
    if (!incident) return;
    const status = incident.investigation?.status;
    if (status === 'RUNNING' || incident.status === 'INVESTIGATING') {
      const interval = setInterval(() => {
        api.getIncident(id).then(setIncident).catch(() => {});
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [incident, id]);

  if (loading) return <div className="p-6"><PageSpinner /></div>;
  if (error) return (
    <div className="p-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!incident) return null;

  return <IncidentWorkspace incident={incident} onRefresh={load} />;
}
