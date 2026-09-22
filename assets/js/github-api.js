const API = 'https://api.github.com';
const CACHE_TTL = { user: 30, repos: 15, languages: 60, readme: 180, commit: 60, contributions: 60 }; // minutes

async function cachedFetch(url, cacheKey, ttlMinutes, init = {}) {
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { t, data } = JSON.parse(cached);
      if (Date.now() - t < ttlMinutes * 60000) return data;
    }
  } catch { /* ignore cache read errors */ }

  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/vnd.github+json', ...(init.headers || {}) },
  });

  if (!res.ok) {
    const rateLimited = res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0';
    const err = new Error(`GitHub API ${res.status} for ${url}`);
    err.rateLimited = rateLimited;
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data })); } catch { /* quota, ignore */ }
  return data;
}

export async function getUser(username) {
  return cachedFetch(`${API}/users/${username}`, `gh:user:${username}`, CACHE_TTL.user);
}

export async function getRepos(username) {
  return cachedFetch(`${API}/users/${username}/repos?per_page=100&sort=pushed`, `gh:repos:${username}`, CACHE_TTL.repos);
}

// Only fetches per-repo language bytes for pinned/featured repos plus the
// 6 most recently pushed — enough for an accurate top-languages picture
// without spending the whole rate-limit budget on every visitor.
export async function getAllRepoLanguages(username, repos) {
  const subset = repos.slice(0, 10);
  const entries = await Promise.all(subset.map(async (r) => {
    try {
      const langs = await cachedFetch(`${API}/repos/${username}/${r.name}/languages`, `gh:langs:${r.name}`, CACHE_TTL.languages);
      return [r.name, langs];
    } catch {
      return [r.name, {}];
    }
  }));
  return Object.fromEntries(entries);
}

export async function getReadme(owner, repo) {
  try {
    const data = await cachedFetch(
      `${API}/repos/${owner}/${repo}/readme`,
      `gh:readme:${owner}/${repo}`,
      CACHE_TTL.readme,
      { headers: { Accept: 'application/vnd.github.raw+json' } }
    );
    // Accept header above returns raw text through the JSON path only when
    // the API honors it as JSON; fall back to base64 decode for safety.
    if (typeof data === 'string') return data;
    if (data && data.content) {
      return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
    }
    return '';
  } catch {
    return '';
  }
}

export function extractReadmeSummary(markdown) {
  if (!markdown) return '';
  const clean = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_`>#-]/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const line = clean.find((l) => l.length > 40) || clean[0] || '';
  return line.slice(0, 220);
}

export async function getLatestCommit(owner, repo) {
  try {
    const commits = await cachedFetch(`${API}/repos/${owner}/${repo}/commits?per_page=1`, `gh:commit:${owner}/${repo}`, CACHE_TTL.commit);
    return commits[0] || null;
  } catch {
    return null;
  }
}

// Public, unauthenticated contribution-calendar mirror — no token needed,
// safe to call directly from the browser.
export async function getContributions(username) {
  return cachedFetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    `gh:contrib:${username}`,
    CACHE_TTL.contributions
  );
}
