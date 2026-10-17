import { syncAll } from '../server/github.js';
import { TRACKED } from '../server/config.js';
import { json } from './lib/respond.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    const result = await syncAll(TRACKED, (i, n, name) =>
      console.log(`  [${i}/${n}] ${name}`)
    );
    json(res, 200, {
      ok: true,
      repos: result.repositories.length,
      errors: result.errors,
      generatedAt: result.generatedAt,
    });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
