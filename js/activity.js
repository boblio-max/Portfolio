// GitHub-style contribution graph. Rendered from REAL ActivityDay[] data.
// Hover: tooltip. Click: popover with per-repo commits linking to GitHub.
import { level, fmtDate, esc } from './components.js';

const tip = () => document.getElementById('tip');
const pop = () => document.getElementById('pop');

export function renderGraph(mount, days) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  // Last ~12 months of calendar days, grouped Mon-Sun columns like GitHub.
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 12);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // back to Monday
  const grid = document.createElement('div');
  grid.className = 'graph';
  grid.setAttribute('role', 'grid');
  grid.setAttribute('aria-label', 'Contribution graph, last 12 months');

  const d = new Date(start);
  while (d <= today) {
    const key = d.toISOString().slice(0, 10);
    const day = byDate.get(key);
    const n = day ? day.totalCommits : 0;
    const b = document.createElement('button');
    b.className = 'day';
    b.dataset.l = level(n);
    b.setAttribute('aria-label', `${n} commit${n === 1 ? '' : 's'} on ${fmtDate(key + 'T12:00:00Z')}`);
    b.title = '';
    b.addEventListener('mouseenter', (e) => showTip(e, n, key));
    b.addEventListener('mouseleave', hideTip);
    b.addEventListener('focus', (e) => showTip(e, n, key));
    b.addEventListener('blur', hideTip);
    if (day) b.addEventListener('click', (e) => showPop(e, day));
    grid.appendChild(b);
    d.setDate(d.getDate() + 1);
  }
  mount.innerHTML = '';
  mount.appendChild(grid);
  const legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = `Less <span class="day" data-l="0"></span><span class="day" data-l="1"></span><span class="day" data-l="2"></span><span class="day" data-l="3"></span><span class="day" data-l="4"></span> More`;
  mount.appendChild(legend);
}

function showTip(e, n, key) {
  const t = tip();
  t.hidden = false;
  t.textContent = `${n} commit${n === 1 ? '' : 's'} — ${fmtDate(key + 'T12:00:00Z')}`;
  const r = e.target.getBoundingClientRect();
  t.style.left = Math.min(window.innerWidth - 200, r.left + window.scrollX - 20) + 'px';
  t.style.top = (r.top + window.scrollY - 34) + 'px';
}
function hideTip() { tip().hidden = true; }

function showPop(e, day) {
  e.stopPropagation();
  const p = pop();
  const perRepo = Object.entries(day.repositories).sort((a, b) => b[1] - a[1]);
  const byRepo = new Map();
  for (const c of day.commits) {
    if (!byRepo.has(c.repositoryName)) byRepo.set(c.repositoryName, []);
    if (byRepo.get(c.repositoryName).length < 3) byRepo.get(c.repositoryName).push(c);
  }
  p.innerHTML = `<h4>${fmtDate(day.date + 'T12:00:00Z')}</h4>` +
    [...byRepo.entries()].map(([repo, commits]) => `
      <div style="margin-top:8px"><b>${esc(repo)}</b>
        <span class="mono" style="color:var(--muted)"> · ${day.repositories[repo]} commits</span>
        <ul>${commits.map((c) => `<li><a href="${esc(c.url)}">• ${esc(c.message)}</a></li>`).join('')}</ul>
      </div>`).join('') +
    `<div class="total">Total: ${day.totalCommits} commits</div>`;
  p.hidden = false;
  const r = e.target.getBoundingClientRect();
  p.style.left = Math.min(window.innerWidth - 360, r.left + window.scrollX) + 'px';
  p.style.top = (r.bottom + window.scrollY + 8) + 'px';
}
document.addEventListener('click', (e) => {
  if (!pop().hidden && !pop().contains(e.target)) pop().hidden = true;
});
