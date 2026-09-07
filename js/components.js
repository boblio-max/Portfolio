// Small DOM + formatting helpers shared by views.
export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
export function fmtShort(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function errBox(msg) {
  return `<div class="err"><b>No live data.</b> ${esc(msg)}<br><span class="mono">Run: POST /api/sync on the server, then reload.</span></div>`;
}
// Intensity buckets per spec: 0 / 1-2 / 3-5 / 6-9 / 10+
export function level(n) {
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}
export function repoRow(r) {
  return `<div class="repo-row" data-search="${esc((r.name + ' ' + (r.description || '') + ' ' + (r.language || '')).toLowerCase())}">
    <h3><a href="${esc(r.url)}">${esc(r.name)}</a></h3>
    <p>${esc(r.description || 'No description')}</p>
    <div class="mono" style="color:var(--muted)">${esc(r.language || '—')} · ${r.commitCount} commits · ${r.activeDays} active days · updated ${fmtShort(r.updatedAt)}</div>
  </div>`;
}
export function projectCard(p) {
  return `<div class="card proj">
    <h3><a href="#/project/${esc(p.id)}">${esc(p.name)}</a></h3>
    <p>${esc(p.description || 'No description yet — see GitHub.')}</p>
    <div style="margin-bottom:8px"><span class="tag">${esc(p.status)}</span>
      <span class="tag mono">${p.commitCount} commits</span>
      <span class="tag mono">${p.activeDays} days</span></div>
    <div class="mono" style="color:var(--muted)">${p.repos.map(esc).join(' · ')}</div>
    <div style="margin-top:8px"><a href="${esc(p.url)}">GitHub</a> · <a href="#/project/${esc(p.id)}">View project</a></div>
  </div>`;
}
