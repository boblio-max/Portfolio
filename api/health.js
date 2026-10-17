import { json } from './lib/respond.js';

export default async function handler(req, res) {
  json(res, 200, { ok: true });
}
