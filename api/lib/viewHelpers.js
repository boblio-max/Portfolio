import { CATEGORIES, HARDWARE, FEATURED, GITHUB_USERNAME } from '../server/config.js';

export function dayKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function withMeta(cache) {
  if (!cache) return null;
  const repos = cache.repositories.map((r) => ({
    ...r,
    categories: CATEGORIES[r.key] || [],
    hardware: HARDWARE.has(r.key),
  }));
  return { repos, commitsByRepo: cache.commitsByRepo };
}

export function buildActivity(commitsByRepo, onlyKeys = null) {
  const map = new Map();
  for (const [key, commits] of Object.entries(commitsByRepo)) {
    if (onlyKeys && !onlyKeys.has(key)) continue;
    for (const c of commits) {
      const d = dayKey(c.date);
      if (!map.has(d)) {
        map.set(d, { date: d, totalCommits: 0, repositories: {}, commits: [] });
      }
      const day = map.get(d);
      day.totalCommits++;
      day.repositories[c.repositoryName] = (day.repositories[c.repositoryName] || 0) + 1;
      day.commits.push(c);
    }
  }
  const days = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of days) {
    d.commits.sort((a, b) => b.date.localeCompare(a.date));
  }
  return days;
}

export function statsFor(commitsByRepo, onlyKeys = null) {
  const days = buildActivity(commitsByRepo, onlyKeys);
  const totalCommits = days.reduce((n, d) => n + d.totalCommits, 0);
  const repoCount = onlyKeys ? onlyKeys.size : Object.keys(commitsByRepo).length;
  return { totalCommits, activeDays: days.length, repoCount };
}

export function repoStats(key, commitsByRepo) {
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

export function projectsView(repos, commitsByRepo) {
  const byKey = new Map(repos.map((r) => [r.key, r]));
  return FEATURED.map((p) => {
    const keys = p.repos.map((k) => k.toLowerCase()).filter((k) => byKey.has(k));
    const all = keys.flatMap((k) => commitsByRepo[k] || []);
    const days = new Set(all.map((c) => dayKey(c.date)));
    const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date));
    const primary = byKey.get(keys[0]);
    return {
      id: p.id,
      name: p.name,
      status: p.status,
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
