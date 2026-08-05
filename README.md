# Portfolio — shaghaghidev

Live at **https://shaghaghidev.github.io**

Static, dependency-free portfolio. Project data, GitHub stats, activity, and
the language/topic breakdown are fetched live from the GitHub REST API in
the browser — nothing about *projects* is hardcoded in the HTML. Bio,
timeline, and certificates are hand-authored (real history/credentials that
don't live on GitHub), and everything else updates itself.

## Structure

```
index.html                 semantic markup, all sections
assets/css/style.css       one stylesheet, CSS custom properties for theming
assets/js/config.js        the ONLY hardcoded data: identity, copy, pin order, timeline, certificates
assets/js/github-api.js    GitHub API client (with sessionStorage caching)
assets/js/app.js           renders every section, wires up search/filter/palette/theme/form
assets/icons/              favicons + social preview (svg + png fallback)
sitemap.xml, robots.txt    SEO
```

## Sections

| Section | Source |
|---|---|
| Hero stats (repos, stars, followers, contributions) | Live — GitHub API |
| About | Authored — `CONFIG.about` |
| Stack (Languages / Topics tabs) | Live — real language bytes + real repo topics from GitHub |
| Activity (heatmap, streaks, Top Languages, Repo Summary) | Live — GitHub + contribution API |
| Now Working On | Live — most recently pushed repo |
| Timeline | Authored — `CONFIG.timeline` (covers pre-GitHub history: WordPress, university, etc.) |
| Certificates | Authored — `CONFIG.certificates`, repeatable card component |
| Projects (search + filter) | Live — GitHub API, README-derived descriptions as fallback |
| Contact | Static form → validated client-side → `mailto:` |

## Already deployed

This is pushed to `shaghaghidev/shaghaghidev.github.io` with **Settings →
Pages → Deploy from a branch → `main` / root**. To ship an update:

```
git add .
git commit -m "update: <what changed>"
git push
```

GitHub Pages redeploys automatically within a minute or two — no build step.

## When you get a custom domain

Update these four places (all currently set to `https://shaghaghidev.github.io`):

- `assets/js/config.js` → `CONFIG.site.baseUrl`
- `index.html` → `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `sitemap.xml` → `<loc>`
- `robots.txt` → `Sitemap:`
- Add a `CNAME` file at the repo root with your domain.

## Editing content

All in `assets/js/config.js` — no HTML/JS knowledge needed for any of these:

- **Bio** (About section copy) → `CONFIG.about` (array of paragraphs, `<strong>` allowed).
- **Focus areas, socials** → `CONFIG.focusAreas`, `CONFIG.social`.
- **Timeline** → `CONFIG.timeline`, array of `{ year, title, desc }`. Last entry is marked as current automatically.
- **Certificates** → `CONFIG.certificates`, array of `{ title, issuer, date, verifyUrl }`. `date` is optional — leave `null` to hide it. Add as many as you want; the grid lays itself out.
- **Which repos count as "pinned/featured"** → `CONFIG.github.pinnedOrder` (array of repo names, in order).
- **Repos to hide** (e.g. this profile README repo) → `CONFIG.github.excludeRepos`.
- **Version number in the footer** → `CONFIG.site.version`.

Everything else — stars, forks, languages, last commit, README-derived
descriptions, contribution heatmap, Stack tabs, Activity cards — is fully
computed from the GitHub API at load time. Push a new repo, tag a topic, or
change a description on GitHub and the site reflects it automatically.

## Notes on live data sources

- Repo list, stats, commits, README text, per-repo language bytes → GitHub
  REST API (unauthenticated, 60 req/hr; responses cached in `sessionStorage`
  for 10 minutes to stay well under that — so a change on GitHub can take up
  to ~10 minutes to show in an already-open tab, or is instant in a fresh tab).
- Contribution heatmap → `github-contributions-api.jogruber.de` (a public,
  CORS-enabled mirror of GitHub's contribution calendar; GitHub's own REST
  API doesn't expose this without OAuth).
- Contact form has no backend (static site) — it validates client-side, then
  opens the visitor's email client via a `mailto:` link.
- No third-party image services are used anywhere (the earlier
  `github-readme-stats.vercel.app` cards were removed — they render as
  broken images for some visitors, e.g. behind ad-blockers/privacy browsers).
  Every chart on the page is drawn locally from real API data.

## Running locally

Opening `index.html` directly (`file://`) will NOT work — the JS uses ES
modules, which browsers block from loading over `file://`. Serve it:

```
python -m http.server 8000
```

then open `http://localhost:8000`. Or use the Live Server extension in VS Code.
