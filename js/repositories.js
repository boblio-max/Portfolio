// Repository browser: full tracked list + instant client-side search
// across name, description, and language.
import { repoRow, esc } from './components.js';

export function renderRepositories(mount, repos) {
  mount.innerHTML = `<h2>Repositories</h2>
    <input id="q" class="search" placeholder="Search repositories…" aria-label="Search repositories" />
    <div id="list"></div>`;
  const list = mount.querySelector('#list');
  const draw = (q) => {
    const query = q.trim().toLowerCase();
    const hits = repos.filter((r) =>
      !query || `${r.name} ${r.description || ''} ${r.language || ''}`.toLowerCase().includes(query));
    list.innerHTML = hits.length
      ? hits.map(repoRow).join('')
      : `<p style="color:var(--muted)">No repositories match “${esc(q)}”.</p>`;
  };
  mount.querySelector('#q').addEventListener('input', (e) => draw(e.target.value));
  draw('');
}
