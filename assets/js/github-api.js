// ============================================================
// GitHub API client — every project/stat/activity fact on the
// site flows through here. Nothing about repos is hardcoded.
// Responses are cached in sessionStorage for CACHE_TTL to avoid
// hitting the 60 req/hr unauthenticated rate limit on reloads.
// ============================================================

const API = 'https://api.github.com';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) return null;
    return v;
  } catch { return null; }
}

function cacheSet(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value })); } catch { /* storage full/blocked — ignore */ }
}

async function ghFetch(path, { cacheKey } = {}) {
  const key = cacheKey || path;
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!res.ok) {
    const err = new Error(`GitHub API ${res.status} on ${path}`);
    err.status = res.status;
    err.rateLimited = res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0';
    throw err;
  }

  const data = await res.json();
  cacheSet(key, data);
  return data;
}

export async function getUser(username) {
  return ghFetch(`/users/${username}`);
}

export async function getRepos(username) {
  const repos = await ghFetch(`/users/${username}/repos?per_page=100&sort=pushed`);
  return repos.filter((r) => !r.private);
}

export async function getRepoLanguages(owner, repo) {
  try {
    return await ghFetch(`/repos/${owner}/${repo}/languages`, { cacheKey: `langs:${owner}/${repo}` });
  } catch {
    return {};
  }
}

// Fetches languages for every repo (bounded concurrency to stay polite to the
// API), aggregated and cached as one unit so this only costs N requests once
// per cache window, not once per page render.
export async function getAllRepoLanguages(username, repos) {
  const key = `alllangs:${username}:${repos.length}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const results = {};
  const CONCURRENCY = 6;
  let cursor = 0;
  async function worker() {
    while (cursor < repos.length) {
      const repo = repos[cursor++];
      results[repo.name] = await getRepoLanguages(repo.owner.login, repo.name);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, repos.length) }, worker));
  cacheSet(key, results);
  return results;
}

export async function getLatestCommit(owner, repo) {
  try {
    const commits = await ghFetch(`/repos/${owner}/${repo}/commits?per_page=1`, {
      cacheKey: `commit:${owner}/${repo}`,
    });
    return commits[0] || null;
  } catch {
    return null;
  }
}

export async function getReadme(owner, repo) {
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.raw+json' },
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

// First real paragraph of a README, stripped of markdown noise —
// used as a description fallback when a repo has none set.
export function extractReadmeSummary(md, maxLen = 200) {
  if (!md) return '';
  const lines = md.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^#{1,6}\s/.test(line)) continue;
    if (/^(!\[|\[!\[|<img|<p align|<div align|---|\*\*\*)/i.test(line)) continue;
    const clean = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[`*_#>]/g, '')
      .trim();
    if (clean.length > 15) {
      return clean.length > maxLen ? clean.slice(0, maxLen).trim() + '…' : clean;
    }
  }
  return '';
}

// Unofficial but widely-used, CORS-enabled public endpoint for daily
// contribution counts (GitHub's own API doesn't expose this without auth).
export async function getContributions(username) {
  const key = `contrib:${username}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
  if (!res.ok) throw new Error('contributions API unavailable');
  const data = await res.json();
  cacheSet(key, data);
  return data;
}
