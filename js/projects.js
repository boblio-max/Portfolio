// Featured projects grid + project detail (real commits + mini graph).
import { api } from './api.js';
import { projectCard, fmtDate, fmtShort, esc, errBox } from './components.js';
import { renderGraph } from './activity.js';

export function renderFeatured(mount, projects) {
  mount.innerHTML = `<h2>Featured projects</h2>
    <div class="grid">${projects.map(projectCard).join('')}</div>`;
}

export async function renderProjectDetail(view, id) {
  view.innerHTML = `<p style="color:var(--muted)">Loading project…</p>`;
  try {
    const p = await api.project(id);
    const [commits, activity] = await Promise.all([
      api.commits(`?repo=${encodeURIComponent(p.repoKeys[0] || '')}&limit=30`),
      api.activity(`?repo=${encodeURIComponent(p.repoKeys[0] || '')}`),
    ]);
    view.innerHTML = `
      <p><a href="#/all">← All</a></p>
      <h1>${esc(p.name)}</h1>
      <p class="sub">${esc(p.description || '')}</p>
      <div style="margin-bottom:10px"><span class="tag">${esc(p.status)}</span>
        ${p.repos.map((r) => `<span class="tag mono">${esc(r)}</span>`).join('')}</div>
      <div class="stats mono">
        <span><b>${p.commitCount}</b> commits</span>
        <span><b>${p.activeDays}</b> active days</span>
        <span>last: <b>${p.lastActivity ? fmtShort(p.lastActivity) : '—'}</b></span>
        <span><a href="${esc(p.url)}">GitHub</a></span>
      </div>
      <h2>Activity</h2><div class="graph-scroll"><div id="pg"></div></div>
      <h2>Recent activity</h2>
      <div>${commits.length ? commits.map((c) => `
        <div class="commit"><a href="${esc(c.url)}">${esc(c.message)}</a>
        <div class="meta mono">${fmtDate(c.date)} · ${esc(c.shortSha)} · ${esc(c.repositoryName)}</div></div>`).join('')
        : '<p style="color:var(--muted)">No commits in the last 12 months.</p>'}</div>`;
    renderGraph(view.querySelector('#pg'), activity);
  } catch (e) { view.innerHTML = errBox(e.message); }
}
