import { getCache } from './_sync.js';
import { withMeta, projectsView } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');
    const p = projectsView(m.repos, m.commitsByRepo).find((x) => x.id === id);
    if (!p) {
      json(res, 404, { error: 'Unknown project' });
      return;
    }
    json(res, 200, p);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
