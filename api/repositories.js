import { getCache } from './_sync.js';
import { withMeta } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    const list = m.repos.map((r) => ({ ...r }));
    list.sort(
      (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '') || 0
    );
    json(res, 200, list);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
