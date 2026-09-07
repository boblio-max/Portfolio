// Server-side GitHub service. All GitHub API calls happen here so the
// frontend never sees a token. Uses only Node built-ins (global fetch).
const API = 'https://api.github.com';
const SINCE_MONTHS = 12;
const MAX_COMMIT_PAGES = 3; // 3 x 100 commits per repo max for prototype

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nikhil-portfolio-prototype',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getJson(url) {
  const res = await fetch(url, { headers: headers() });
  if (res.status === 404) {
    const err = new Error(`Not found: ${url}`);
    err.code = 404;
    throw err;
  }
  if (res.status === 403 || res.status === 429) {
    const err = new Error('GitHub rate limit reached. Set GITHUB_TOKEN and retry.');
    err.code = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`);
  return res.json();
}

export function sinceDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - SINCE_MONTHS);
  return d.toISOString();
}

// Raw repo -> normalized Repository (see spec data model).
export async function fetchRepo(tracked) {
  const data = await getJson(`${API}/repos/${tracked.owner}/${tracked.repo}`);
  return {
    id: String(data.id),
    key: tracked.name.toLowerCase(),
    name: data.name,
    owner: data.owner.login,
    description: data.description || '',
    url: data.html_url,
    language: data.language || '—',
    updatedAt: data.updated_at,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
  };
}

// Raw commits -> normalized Commit[] (newest first).
export async function fetchCommits(tracked, since) {
  const out = [];
  for (let page = 1; page <= MAX_COMMIT_PAGES; page++) {
    const url =
      `${API}/repos/${tracked.owner}/${tracked.repo}/commits` +
      `?per_page=100&page=${page}&since=${encodeURIComponent(since)}`;
    const data = await getJson(url);
    if (!Array.isArray(data) || data.length === 0) break;
    for (const c of data) {
      out.push({
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        repositoryId: null, // filled by sync()
        repositoryName: tracked.name,
        message: (c.commit.message || '').split('\n')[0],
        author: (c.commit.author && c.commit.author.name) || (c.author && c.author.login) || 'unknown',
        date: (c.commit.author && c.commit.author.date) || c.commit.committer.date,
        url: c.html_url,
      });
    }
    if (data.length < 100) break;
  }
  return out;
}

// Full sync across all tracked repos. Returns normalized cache object.
// Never returns mock data — failures throw so the caller can report them.
export async function syncAll(tracked, onProgress) {
  const since = sinceDate();
  const repositories = [];
  const commitsByRepo = {};
  const errors = [];
  let i = 0;
  for (const t of tracked) {
    i++;
    try {
      const repo = await fetchRepo(t);
      const commits = await fetchCommits(t, since);
      commits.forEach((c) => { c.repositoryId = repo.id; });
      repositories.push(repo);
      commitsByRepo[repo.key] = commits;
      onProgress && onProgress(i, tracked.length, repo.name);
    } catch (e) {
      // A renamed/missing repo must not kill the whole sync; record it.
      errors.push({ repo: t.name, error: e.message });
      onProgress && onProgress(i, tracked.length, `${t.name} (error)`);
    }
  }
  return { generatedAt: new Date().toISOString(), since, repositories, commitsByRepo, errors };
}
