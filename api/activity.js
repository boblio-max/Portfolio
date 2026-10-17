import { getCache } from './_sync.js';
import { withMeta, buildActivity } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    const url = new URL(req.url, 'http://localhost');
    const scope = url.searchParams.get('scope') === 'hardware'
      ? new Set(m.repos.filter((r) => r.hardware).map((r) => r.key))
      : null;
    const onlyRepo = url.searchParams.get('repo');
    const keys = onlyRepo ? new Set([onlyRepo.toLowerCase()]) : scope;
    json(res, 200, buildActivity(m.commitsByRepo, keys));
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
