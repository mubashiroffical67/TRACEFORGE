const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  health: () => apiFetch('/api/health'),

  // Incidents
  getIncidents: () => apiFetch<any[]>('/api/incidents'),
  getStats: () => apiFetch<any>('/api/incidents/stats'),
  getIncident: (id: string) => apiFetch<any>(`/api/incidents/${id}`),
  createIncident: (data: any) => apiFetch<any>('/api/incidents', { method: 'POST', body: JSON.stringify(data) }),
  investigateIncident: (id: string) => apiFetch<any>(`/api/incidents/${id}/investigate`, { method: 'POST' }),
  getPR: (id: string) => apiFetch<any>(`/api/incidents/${id}/pr`),

  // Demo
  seedDemo: () => apiFetch<any>('/api/demo/seed', { method: 'POST' }),
  getDemo: () => apiFetch<any>('/api/demo/incident'),
  resetDemo: () => apiFetch<any>('/api/demo/reset', { method: 'DELETE' }),

  // Repositories
  getRepositories: () => apiFetch<any[]>('/api/repositories'),
};
