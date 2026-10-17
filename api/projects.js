import { getCache } from './_sync.js';
import { withMeta, projectsView } from './lib/viewHelpers.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  try {
    const cache = await getCache();
    const m = withMeta(cache);
    json(res, 200, projectsView(m.repos, m.commitsByRepo));
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
