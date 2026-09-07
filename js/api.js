// Tiny fetch wrapper. All data comes from our own server (/api/*),
// which in turn reads real GitHub API data. No tokens here, ever.
export async function get(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${path}`);
  return data;
}
export const api = {
  health: () => get('/api/health'),
  summary: (scope) => get(`/api/summary${scope ? `?scope=${scope}` : ''}`),
  repos: () => get('/api/repositories'),
  activity: (q = '') => get(`/api/activity${q}`),
  commits: (q = '') => get(`/api/commits${q}`),
  projects: () => get('/api/projects'),
  project: (id) => get(`/api/project?id=${encodeURIComponent(id)}`),
};
export async function postSync() {
  const res = await fetch('/api/sync', { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Sync failed');
  return data;
}
