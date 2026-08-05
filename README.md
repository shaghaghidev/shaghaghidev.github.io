# shaghaghidev.github.io

This is my portfolio: **https://shaghaghidev.github.io**

I got tired of portfolios that are just a paragraph of claims and a
screenshot from six months ago. So I built this one to pull everything —
project list, stars, languages, commit activity — straight from the GitHub
API, live, every time someone opens the page. If it's out of date, that
means GitHub is out of date, not this site. I don't want to remember to
"update my portfolio" ever again.

The only things I actually wrote by hand are my bio, my timeline, and my
certificates — because those aren't things GitHub knows about.

## What's in here

```
index.html                 the page
assets/css/style.css       one stylesheet, no framework
assets/js/config.js        everything I hand-write: bio, timeline, certificates, pinned repos
assets/js/github-api.js    talks to the GitHub REST API, caches responses so I don't hit rate limits
assets/js/app.js           renders every section, search/filter, command palette, theme, contact form
assets/icons/              favicons + social preview image
sitemap.xml, robots.txt    SEO basics
```

No build step, no framework, no npm install. Plain HTML/CSS/JS. I like
being able to open one file and understand the whole thing.

## What's live vs. what I wrote

| Section | Where it comes from |
|---|---|
| Hero stats (repos, stars, followers, contributions) | Live — GitHub API |
| About | Me, in `config.js` |
| Stack (Languages / Topics) | Live — actual language bytes and topics from my repos |
| Activity (heatmap, streaks, top languages, repo summary) | Live — GitHub + contribution API |
| Now Working On | Live — whichever repo I pushed to most recently |
| Timeline | Me, in `config.js` — covers stuff that never touched GitHub (WordPress sites, university) |
| Certificates | Me, in `config.js` — repeatable, just add another entry |
| Projects | Live — GitHub API, falls back to README text if a repo has no description |
| Contact | Just a validated form that opens a `mailto:` — no backend, I don't need one |

## How I deploy it

It's already live at `shaghaghidev/shaghaghidev.github.io`, set to deploy
from `main` / root under Settings → Pages. To push a change:

```
git add .
git commit -m "update: whatever I changed"
git push
```

GitHub Pages picks it up in a minute or two. No build, nothing else to run.

## If I get a custom domain later

Four places to update (all currently `https://shaghaghidev.github.io`):

- `assets/js/config.js` → `CONFIG.site.baseUrl`
- `index.html` → canonical link, `og:url`, `og:image`, `twitter:image`
- `sitemap.xml` → `<loc>`
- `robots.txt` → `Sitemap:`
- Add a `CNAME` file at the repo root.

## Editing my own content

Everything I need to touch lives in `assets/js/config.js`:

- **Bio** → `CONFIG.about`
- **Timeline** → `CONFIG.timeline`, just `{ year, title, desc }` objects. Last one shows as "current."
- **Certificates** → `CONFIG.certificates`, `{ title, issuer, date, verifyUrl }`. `date` can be `null` if I don't want to show one. I can add as many as I want, the grid handles it.
- **Which projects get pinned to the top** → `CONFIG.github.pinnedOrder`
- **Repos I don't want showing up** (like this one, the portfolio repo itself) → `CONFIG.github.excludeRepos`
- **Version number in the footer** → `CONFIG.site.version`

I never touch the HTML for any of this.

## Why some things are live instead of written by hand

Stars, forks, languages, last commit, contribution graph, top languages —
all computed from the GitHub API at load time, cached for 10 minutes in
`sessionStorage` so I don't blow through the 60 req/hr unauthenticated
limit. The contribution heatmap comes from
`github-contributions-api.jogruber.de`, a public mirror of GitHub's own
contribution calendar (GitHub's official API doesn't expose this without
OAuth). I deliberately don't use any third-party image services — I tried
`github-readme-stats.vercel.app` at first and it kept showing up as a
broken image for people running ad-blockers, so I ripped it out and render
everything myself from the raw API data instead.

## Running it locally

Double-clicking `index.html` doesn't work — the JS is written as ES
modules, and browsers refuse to load modules over `file://`. I have to
serve it:

```
python -m http.server 8000
```

then open `http://localhost:8000`. Or just use the Live Server extension
in VS Code.
