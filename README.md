# Portfolio — Nikhil Mahankali

my personal portfolio site, and I have one rule for it: **no mock data.** every commit count, activity graph, and repo card is pulled live from the real GitHub API through a local Node server and cached to disk. if the numbers are on screen, they're true.

## how it actually works

- frontend: vanilla JS hash-router (`index.html`, `script.js`, `js/`) with views for overview / hardware / repos / activity / projects. zero frameworks, zero npm deps on the client.
- backend: `server/server.js` (201 lines, Node built-ins `http` + `fetch` only) syncs ~45 repos into `server/cache.json` (gitignored) and serves `/api/summary|repositories|activity|commits|sync`.
- `server/github.js` + `server/config.js` handle the API + tokens.

```bash
node server/server.js
# open index.html (or serve it, the JS hits the local API)
```

**Repo:** `boblio-max/Portfolio`

## stack

HTML/CSS/vanilla JS + zero-dependency Node API + GitHub REST API. data-science/robotics flavored, because that's what the repos are.
