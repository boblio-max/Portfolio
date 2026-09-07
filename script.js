// Entry point + hash router. Views: All / Hardware / Repositories /
// Activity / Project detail. Every number comes from /api/* (real GitHub data).

import { api } from './js/api.js';
import { renderGraph } from './js/activity.js';
import { renderRepositories } from './js/repositories.js';
import { renderFeatured, renderProjectDetail } from './js/projects.js';
import { fmtDate, esc, errBox } from './js/components.js';

const view = document.getElementById('view');
const syncState = document.getElementById('syncState');

async function markSync() {
  try {
    const h = await api.health();
    syncState.textContent = h.cached
      ? `synced ${new Date(h.generatedAt).toLocaleString()}`
      : 'not synced — POST /api/sync';
  } catch { syncState.textContent = 'server offline'; }
}

function setNav(route) {
  document.querySelectorAll('[data-nav]').forEach((a) =>
    a.classList.toggle('on', a.dataset.nav === route));
}

function head(title, sub) {
  return `<h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p>`;
}

async function overview(scope) {
  const isHw = scope === 'hardware';
  setNav(isHw ? 'hardware' : 'all');
  view.innerHTML = `<p style="color:var(--muted)">Loading live GitHub data…</p>`;
  try {
    const q = isHw ? '?scope=hardware' : '';
    const [s, days, projects, recent] = await Promise.all([
      api.summary(isHw ? 'hardware' : ''), api.activity(q), api.projects(), api.commits(`${q ? q + '&' : '?'}limit=15`),
    ]);
    const home = projects.filter((p) => p.showOnHome);
    const list = isHw ? home.filter((p) => ['cori', 'orbs', 'llm-cad-agent'].includes(p.id)) : home;
    view.innerHTML = `
      ${head('Nikhil Mahankali', isHw
        ? 'Hardware & robotics — CAD, sensors, control, simulation.'
        : 'Building robotics, software, and intelligent systems.')}
      <div class="stats mono"><span><b>${s.totalCommits}</b> commits</span>
        <span><b>${s.activeDays}</b> active days</span>
        <span><b>${s.repoCount}</b> repositories</span></div>
      <h2>Activity</h2><div class="graph-scroll"><div id="g"></div></div>
      <div id="feat"></div>
      <h2>Recent activity</h2>
      <div>${recent.map((c) => `<div class="commit"><b>${esc(c.repositoryName)}</b> —
        <a href="${esc(c.url)}">${esc(c.message)}</a>
        <div class="meta mono">${fmtDate(c.date)} · ${esc(c.shortSha)}</div></div>`).join('') || '<p>No commits yet.</p>'}</div>
      <p><a href="#/activity${isHw ? '?scope=hardware' : ''}">All activity →</a></p>`;
    renderGraph(view.querySelector('#g'), days);
    renderFeatured(view.querySelector('#feat'), list);
  } catch (e) { view.innerHTML = head('Nikhil Mahankali', 'Building robotics, software, and intelligent systems.') + errBox(e.message); }
}

async function reposView() {
  setNav('repos');
  view.innerHTML = head('Repositories', 'Every tracked repository. Search filters instantly.') + `<div id="rl"></div>`;
  try {
    renderRepositories(view.querySelector('#rl'), await api.repos());
  } catch (e) { view.querySelector('#rl').innerHTML = errBox(e.message); }
}

async function activityView() {
  setNav('all');
  const scopeHw = location.hash.includes('scope=hardware');
  view.innerHTML = head('Activity', scopeHw ? 'Hardware repositories only.' : 'Combined commits across all tracked repositories.') + `<div id="al"></div>`;
  try {
    const days = await api.activity(scopeHw ? '?scope=hardware' : '');
    const desc = [...days].reverse();
    view.querySelector('#al').innerHTML = desc.map((d) => `
      <div class="day-group"><h4>${fmtDate(d.date + 'T12:00:00Z')} <span class="mono" style="color:var(--muted)">· ${d.totalCommits}</span></h4>
      ${d.commits.slice(0, 20).map((c) => `<div class="commit"><b>${esc(c.repositoryName)}</b> —
        <a href="${esc(c.url)}">${esc(c.message)}</a></div>`).join('')}</div>`).join('')
      || '<p>No activity.</p>';
  } catch (e) { view.querySelector('#al').innerHTML = errBox(e.message); }
}

function route() {
  const h = location.hash || '#/all';
  if (h.startsWith('#/hardware')) return overview('hardware');
  if (h.startsWith('#/repos')) return reposView();
  if (h.startsWith('#/activity')) return activityView();
  if (h.startsWith('#/project/')) return renderProjectDetail(view, h.split('/')[2].split('?')[0]);
  return overview('all');
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  document.querySelector('.toggle-wrapper')?.setAttribute('aria-checked', String(isDark));
}
window.toggleDarkMode = toggleDarkMode;

// Click + keyboard support (toggle now lives inside header.nav)
document.querySelector('.toggle-wrapper')?.addEventListener('click', toggleDarkMode);
document.querySelector('.toggle-wrapper')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleDarkMode();
  }
});

window.addEventListener('hashchange', route);
markSync();
route();
