import { syncAll } from '../server/github.js';
import { TRACKED } from '../server/config.js';

export async function getCache() {
  return await syncAll(TRACKED);
}
