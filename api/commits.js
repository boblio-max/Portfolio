import { getCache } from './_sync.js';
import { withMeta } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    const url = new URL(req.url, 'http://localhost');
    const key = (url.searchParams.get('repo') || '').toLowerCase();
    const limit = Math.min(Number(url.searchParams.get('limit') || 30), 100);
    let all;
    if (!key) {
      const hardware = new Set(
        m.repos.filter((r) => r.hardware).map((r) => r.key)
      );
      all = [...hardware]
        .flatMap((k) => m.commitsByRepo[k] || [])
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
    } else {
      all = [...(m.commitsByRepo[key] || [])]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
    }
    json(res, 200, all);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
