// Minimal portfolio server: static files + normalized JSON API + file cache.
// No frameworks, no dependencies. Run: `node server/server.js`
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRACKED, CATEGORIES, HARDWARE, FEATURED, GITHUB_USERNAME } from './config.js';
import { syncAll } from './github.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_FILE = path.join(__dirname, 'cache.json');
const PORT = Number(process.env.PORT || 3000);

let cache = null;
try {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  console.log(`Loaded cache from ${CACHE_FILE} (${cache.repositories?.length ?? 0} repos)`);
} catch {
  console.log('No cache yet. POST /api/sync (or set GITHUB_TOKEN) to fetch real GitHub data.');
}

function dayKey(iso) { return new Date(iso).toISOString().slice(0, 10); }

function withMeta() {
  if (!cache) return null;
  const repos = cache.repositories.map((r) => ({
    ...r,
    categories: CATEGORIES[r.key] || [],
    hardware: HARDWARE.has(r.key),
  }));
  return { repos, commitsByRepo: cache.commitsByRepo };
}

// Aggregate commits into ActivityDay[] sorted ascending.
function buildActivity(commitsByRepo, onlyKeys = null) {
  const map = new Map();
  for (const [key, commits] of Object.entries(commitsByRepo)) {
    if (onlyKeys && !onlyKeys.has(key)) continue;
    for (const c of commits) {
      const d = dayKey(c.date);
      if (!map.has(d)) map.set(d, { date: d, totalCommits: 0, repositories: {}, commits: [] });
      const day = map.get(d);
      day.totalCommits++;
      day.repositories[c.repositoryName] = (day.repositories[c.repositoryName] || 0) + 1;
      day.commits.push(c);
    }
  }
  const days = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of days) d.commits.sort((a, b) => b.date.localeCompare(a.date));
  return days;
}

function statsFor(commitsByRepo, onlyKeys = null) {
  const days = buildActivity(commitsByRepo, onlyKeys);
  const totalCommits = days.reduce((n, d) => n + d.totalCommits, 0);
  const repoCount = onlyKeys ? onlyKeys.size : Object.keys(commitsByRepo).length;
  return { totalCommits, activeDays: days.length, repoCount };
}

function repoStats(key, commitsByRepo) {
  const commits = commitsByRepo[key] || [];
  const days = new Set(commits.map((c) => dayKey(c.date)));
  const sorted = [...commits].sort((a, b) => a.date.localeCompare(b.date));
  return {
    commitCount: commits.length,
    activeDays: days.size,
    firstCommit: sorted[0]?.date || null,
    lastActivity: sorted.length ? sorted[sorted.length - 1].date : null,
  };
}

function projectsView(repos, commitsByRepo) {
  const byKey = new Map(repos.map((r) => [r.key, r]));
  return FEATURED.map((p) => {
    const keys = p.repos.map((k) => k.toLowerCase()).filter((k) => byKey.has(k));
    const all = keys.flatMap((k) => commitsByRepo[k] || []);
    const days = new Set(all.map((c) => dayKey(c.date)));
    const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date));
    const primary = byKey.get(keys[0]);
    return {
      id: p.id, name: p.name, status: p.status,
      showOnHome: p.showOnHome !== false,
      description: p.description || primary?.description || '',
      repos: keys.map((k) => byKey.get(k)?.name || k),
      repoKeys: keys,
      url: primary?.url || `https://github.com/${GITHUB_USERNAME}`,
      commitCount: all.length,
      activeDays: days.size,
      lastActivity: sorted.length ? sorted[sorted.length - 1].date : null,
    };
  });
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': `${type}; charset=utf-8` });
  res.end(body);
}

function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  if (p.startsWith('/api/')) return false;
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA fallback: project/activity deep links serve index.html
    if (p.startsWith('/projects/') || p === '/activity') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
      return true;
    }
    send(res, 404, 'Not found', 'text/plain');
    return true;
  }
  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'text/plain');
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
    serveStatic(req, res);
    return;
  }

  // ---- API ----
  if (url.pathname === '/api/health') {
    send(res, 200, JSON.stringify({ ok: true, cached: !!cache, generatedAt: cache?.generatedAt || null }));
    return;
  }
  if (!cache && url.pathname !== '/api/sync') {
    send(res, 503, JSON.stringify({ error: 'No data synced yet. POST /api/sync to fetch real GitHub data.' }));
    return;
  }
  const m = withMeta();

  if (url.pathname === '/api/summary') {
    const scope = url.searchParams.get('scope') === 'hardware'
      ? new Set(m.repos.filter((r) => r.hardware).map((r) => r.key)) : null;
    const s = statsFor(m.commitsByRepo, scope);
    send(res, 200, JSON.stringify({ ...s, generatedAt: cache.generatedAt, username: GITHUB_USERNAME }));
    return;
  }
  if (url.pathname === '/api/repositories') {
    const list = m.repos.map((r) => ({ ...r, ...repoStats(r.key, m.commitsByRepo) }));
    list.sort((a, b) => b.lastActivity?.localeCompare(a.lastActivity ?? '') ?? 0);
    send(res, 200, JSON.stringify(list));
    return;
  }
  if (url.pathname === '/api/activity') {
    const scope = url.searchParams.get('scope') === 'hardware'
      ? new Set(m.repos.filter((r) => r.hardware).map((r) => r.key)) : null;
    const onlyRepo = url.searchParams.get('repo');
    const keys = onlyRepo ? new Set([onlyRepo.toLowerCase()]) : scope;
    send(res, 200, JSON.stringify(buildActivity(m.commitsByRepo, keys)));
    return;
  }
  if (url.pathname === '/api/commits') {
    const key = (url.searchParams.get('repo') || '').toLowerCase();
    const limit = Math.min(Number(url.searchParams.get('limit') || 30), 100);
    if (url.searchParams.get('scope') === 'hardware' || !key) {
      const keys = key ? new Set([key]) : new Set(m.repos.filter((r) => r.hardware).map((r) => r.key));
      const all = (!key ? [...keys].flatMap((k) => m.commitsByRepo[k] || []) : (m.commitsByRepo[key] || []))
        .sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
      send(res, 200, JSON.stringify(all));
      return;
    }
    const all = [...(m.commitsByRepo[key] || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    send(res, 200, JSON.stringify(all));
    return;
  }
  if (url.pathname === '/api/projects') {
    send(res, 200, JSON.stringify(projectsView(m.repos, m.commitsByRepo)));
    return;
  }
  if (url.pathname === '/api/project') {
    const p = projectsView(m.repos, m.commitsByRepo).find((x) => x.id === url.searchParams.get('id'));
    if (!p) { send(res, 404, JSON.stringify({ error: 'Unknown project' })); return; }
    send(res, 200, JSON.stringify(p));
    return;
  }
  if (url.pathname === '/api/sync' && req.method === 'POST') {
    try {
      console.log('Syncing from GitHub API...');
      const result = await syncAll(TRACKED, (i, n, name) => console.log(`  [${i}/${n}] ${name}`));
      cache = result;
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
      console.log(`Sync done: ${result.repositories.length} repos, errors: ${result.errors.length}`);
      send(res, 200, JSON.stringify({ ok: true, repos: result.repositories.length, errors: result.errors, generatedAt: result.generatedAt }));
    } catch (e) {
      send(res, 500, JSON.stringify({ error: e.message }));
    }
    return;
  }
  send(res, 404, JSON.stringify({ error: 'Unknown endpoint' }));
});

server.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
