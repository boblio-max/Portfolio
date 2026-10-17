import { getCache } from './_sync.js';
import { withMeta, statsFor } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';
import { GITHUB_USERNAME } from '../server/config.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    const url = new URL(req.url, 'http://localhost');
    const scope = url.searchParams.get('scope') === 'hardware'
      ? new Set(m.repos.filter((r) => r.hardware).map((r) => r.key))
      : null;
    const s = statsFor(m.commitsByRepo, scope);
    json(res, 200, { ...s, generatedAt: cache.generatedAt, username: GITHUB_USERNAME });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
