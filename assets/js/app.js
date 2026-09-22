import { CONFIG } from './config.js';
import * as gh from './github-api.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const escapeHtml = (s = '') => s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

// ============================================================
// Theme (dark/light, persisted)
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(preferred);
  $('#theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('#theme-toggle').setAttribute('aria-pressed', String(theme === 'light'));
  $('#theme-icon-dark').style.display = theme === 'light' ? 'none' : 'block';
  $('#theme-icon-light').style.display = theme === 'light' ? 'block' : 'none';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'light' ? '#f7f6f2' : '#0a0c10');
}

// ============================================================
// Static/copy-driven sections (identity, about, skills, timeline)
// ============================================================
function renderIdentity() {
  $('#site-version').textContent = CONFIG.site.version;
  $('#year').textContent = new Date().getFullYear();
  $('#last-updated').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderTyped() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = $('#typed');
  const lines = CONFIG.person.typedLines;
  if (reduced) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, deleting = false;
  const tick = () => {
    const full = lines[li];
    if (!deleting) {
      ci++;
      el.textContent = full.slice(0, ci);
      if (ci === full.length) { deleting = true; setTimeout(tick, 1500); return; }
    } else {
      ci--;
      el.textContent = full.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    }
    setTimeout(tick, deleting ? 28 : 42);
  };
  tick();
}

function renderAbout() {
  $('#about-copy').innerHTML = CONFIG.about.map((p) => `<p>${p}</p>`).join('');
}

function renderFocus() {
  $('#focus-grid').innerHTML = CONFIG.focusAreas.map((f) => `
    <div class="focus-cell">
      <div class="icon">${f.icon}</div>
      <h4>${escapeHtml(f.title)}</h4>
      <p>${escapeHtml(f.desc)}</p>
    </div>`).join('');
}

// "What I'm Working On" — a static, honest status (Current / Learning /
// Next), not driven by whatever repo GitHub happens to show as last-pushed.
function renderWorkingOn() {
  const w = CONFIG.workingOn;
  const cells = [
    { icon: 'Current', title: w.current.join(' · '), desc: 'Actively building with these day to day.' },
    { icon: 'Learning', title: w.learning, desc: 'Deepening this through real practice.' },
    { icon: 'Next', title: w.next.join(' → '), desc: 'The next steps on the roadmap.' },
  ];
  $('#working-on-grid').innerHTML = cells.map((c) => `
    <div class="focus-cell">
      <div class="icon">${escapeHtml(c.icon)}</div>
      <h4>${escapeHtml(c.title)}</h4>
      <p>${escapeHtml(c.desc)}</p>
    </div>`).join('');
}

// Stack — a manually curated, honest split between what's actually in use
// today and what's next, kept visually distinct on purpose (see CSS
// .stack-col.next). This is separate from the live GitHub language stats,
// which stay in the Activity section further down.
function renderStack() {
  const s = CONFIG.stack;
  $('#stack-columns').innerHTML = `
    <div class="stack-col">
      <h4>Currently Working With</h4>
      <div class="pill-row">${s.current.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>
    </div>
    <div class="stack-col next">
      <h4>Learning Next</h4>
      <div class="pill-row">${s.next.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>
    </div>`;
}

// Deterministic color per language/topic name, so the same name always
// gets the same swatch across renders — no maintained color table needed.
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 62%, 58%)`;
}

function renderCertificates() {
  const list = $('#cert-list');
  const items = CONFIG.certificates || [];
  if (!items.length) { list.innerHTML = '<p class="empty-state">No certificates added yet.</p>'; return; }
  list.innerHTML = items.map((c) => `
    <article class="cert-card">
      <div class="cert-icon" aria-hidden="true">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 13.5L7 22l5-3 5 3-2-8.5"/></svg>
      </div>
      <h3>${escapeHtml(c.title)}</h3>
      <div class="cert-meta">
        <span class="cert-issuer">${escapeHtml(c.issuer)}</span>
        ${c.date ? `<span>${escapeHtml(c.date)}</span>` : ''}
      </div>
      <a class="cert-verify" href="${escapeHtml(c.verifyUrl)}" target="_blank" rel="noopener" aria-label="Verify ${escapeHtml(c.title)} on ${escapeHtml(c.issuer)}">
        Verify Certificate
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M7 17L17 7M9 7h8v8"/></svg>
      </a>
    </article>`).join('');
}

function renderContactLinks() {
  const icons = {
    github: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.98 5.24.98 11.5c0 5 3.24 9.24 7.75 10.74.57.1.78-.25.78-.55v-2.1c-3.15.68-3.81-1.34-3.81-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 015.73 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.17 5.59.41.35.77 1.04.77 2.11v3.13c0 .3.2.66.79.55A10.99 10.99 0 0023 11.5C23 5.24 18.27.5 12 .5z"/></svg>',
    mail: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
    instagram: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  };
  $('#contact-links').innerHTML = CONFIG.social.map((s) => `
    <a class="contact-link-row" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(s.label)}">
      ${icons[s.icon] || ''}
      <span>${escapeHtml(s.label)}</span>
    </a>`).join('') + `
    <div class="contact-link-row"><span>Status</span><span class="status-avail">● open to web design &amp; WordPress projects</span></div>`;

  const u = CONFIG.github.username;
  $('#footer-links').innerHTML = `
    <a href="https://github.com/${u}" target="_blank" rel="noopener">GitHub</a>
    <a href="https://github.com/${u}/${u}" target="_blank" rel="noopener">Profile README</a>`;
}

// ============================================================
// Contact form — static site, so this validates then hands off
// to the user's mail client via a mailto: link.
// ============================================================
function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');

  const validators = {
    name: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: (v) => v.trim().length >= 10,
  };

  const validateField = (name) => {
    const input = form.elements[name];
    const field = $(`#field-${name}`);
    const ok = validators[name](input.value);
    field.classList.toggle('invalid', !ok);
    return ok;
  };

  ['name', 'email', 'message'].forEach((name) => {
    form.elements[name].addEventListener('blur', () => validateField(name));
    form.elements[name].addEventListener('input', () => {
      if ($(`#field-${name}`).classList.contains('invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = ['name', 'email', 'message'].map(validateField);
    if (results.includes(false)) {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'form-status error';
      return;
    }
    const { name, email, message } = form.elements;
    const subject = encodeURIComponent(`Portfolio contact from ${name.value.trim()}`);
    const body = encodeURIComponent(`${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`);
    window.location.href = `mailto:${CONFIG.person.email}?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email client…';
    status.className = 'form-status success';
  });
}

// ============================================================
// Live GitHub data: hero stats, activity, now-working-on, projects
// ============================================================
let allRepos = [];

function setHeroStats(user, repos) {
  try {
    const visibleRepos = repos.filter((r) => !CONFIG.github.excludeRepos.includes(r.name));
    const stars = visibleRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    setStat('repos', user.public_repos);
    setStat('stars', stars);
    setStat('followers', user.followers);
    setStat('commits', `${visibleRepos.length}+`);
  } catch {
    ['repos', 'stars', 'followers', 'commits'].forEach((k) => setStat(k, '—', true));
  }
}
function setStat(key, value, failed = false) {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (!el) return;
  el.textContent = value;
  el.classList.toggle('loading', false);
  if (failed) el.title = 'Unavailable right now — GitHub API may be rate-limited.';
}

async function loadRepos() {
  try {
    const [user, repos] = await Promise.all([
      gh.getUser(CONFIG.github.username),
      gh.getRepos(CONFIG.github.username),
    ]);
    allRepos = repos.filter((r) => !CONFIG.github.excludeRepos.includes(r.name) && !r.fork);
    setHeroStats(user, repos);
    renderNowWorkingOn(allRepos);
    renderFilters(allRepos);
    await renderProjects(allRepos);
    loadStack(allRepos, user);
  } catch (err) {
    ['repos', 'stars', 'followers', 'commits'].forEach((k) => setStat(k, '—', true));
    $('#proj-list').innerHTML = `<p class="error-state">Couldn't load projects from GitHub right now${err.rateLimited ? ' (API rate limit reached — try again in a bit)' : ''}. <a href="https://github.com/${CONFIG.github.username}?tab=repositories" target="_blank" rel="noopener" style="color:var(--accent-2)">View repositories on GitHub →</a></p>`;
    $('#now-title').textContent = 'Couldn\u2019t load live activity';
    $('#now-desc').textContent = 'Check back shortly, or view the profile directly on GitHub.';
    $('#skill-grid').innerHTML = '<p class="error-state">Could not load stack data from GitHub right now.</p>';
  }
}

// ============================================================
// Stack (real language %, real topic counts) + the two
// self-rendered activity cards — derived from the repo/user
// objects already fetched, nothing here is authored by hand.
// ============================================================
async function loadStack(repos, user) {
  renderRepoSummaryCard(repos, user);

  try {
    const langsByRepo = await gh.getAllRepoLanguages(CONFIG.github.username, repos);
    const langTotals = aggregateLanguages(langsByRepo);
    renderTopLanguagesCard(langTotals);
  } catch {
    $('#card-top-languages').innerHTML = '<h4>Top Languages</h4><p class="error-state">Unavailable right now.</p>';
  }
}

function aggregateLanguages(langsByRepo) {
  const totals = {};
  Object.values(langsByRepo).forEach((langs) => {
    Object.entries(langs).forEach(([lang, bytes]) => { totals[lang] = (totals[lang] || 0) + bytes; });
  });
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(totals)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / sum) * 100 }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8);
}

function renderTimeline() {
  const list = $('#timeline-list');
  const items = CONFIG.timeline;
  if (!items.length) { list.innerHTML = '<p class="empty-state">No roadmap entries yet.</p>'; return; }
  list.innerHTML = items.map((t) => `
    <div class="tl-item ${escapeHtml(t.status || '')}">
      <div class="tl-year">${escapeHtml(t.year)}</div>
      <h4>${escapeHtml(t.title)}</h4>
      <p>${escapeHtml(t.desc)}</p>
    </div>`).join('');
}

function renderTopLanguagesCard(langTotals) {
  const card = $('#card-top-languages');
  card.innerHTML = '<h4>Top Languages</h4>' + (langTotals.length
    ? langTotals.slice(0, 6).map((it) => `
      <div class="mini-lang-row">
        <div class="mini-lang-top">
          <span class="lang-name"><span class="lang-dot" style="background:${hashColor(it.name)}"></span>${escapeHtml(it.name)}</span>
          <span class="lang-pct">${it.pct.toFixed(1)}%</span>
        </div>
        <div class="mini-lang-bar"><div class="mini-lang-bar-fill" style="width:${it.pct}%; background:${hashColor(it.name)};"></div></div>
      </div>`).join('')
    : '<p class="empty-state">No language data yet.</p>');
}

function renderRepoSummaryCard(repos, user) {
  const card = $('#card-repo-summary');
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const mostStarred = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  card.innerHTML = `<h4>Repository Summary</h4><div class="summary-list">
    <div class="summary-row"><span class="s-label">Public repos</span><span class="s-value">${user?.public_repos ?? repos.length}</span></div>
    <div class="summary-row"><span class="s-label">Total stars</span><span class="s-value">${totalStars}</span></div>
    <div class="summary-row"><span class="s-label">Total forks</span><span class="s-value">${totalForks}</span></div>
    <div class="summary-row"><span class="s-label">Most starred</span><span class="s-value">${mostStarred ? `<a href="${mostStarred.html_url}" target="_blank" rel="noopener">${escapeHtml(mostStarred.name)}</a>` : '—'}</span></div>
  </div>`;
}

// "What I'm Working On" is now a static, honest section (see renderWorkingOn)
// rather than whatever GitHub happens to show as most-recently-pushed — so
// this only feeds the live "last commit" stat in the Activity section.
function renderNowWorkingOn(repos) {
  if (!repos.length) return;
  const latest = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
  setStat('last-commit', timeAgo(latest.pushed_at));
}

function deriveTopics(repo) {
  const topics = new Set((repo.topics || []).map((t) => t.toLowerCase()));
  if (repo.language) topics.add(repo.language.toLowerCase());
  return Array.from(topics);
}

let activeFilter = null;
let searchTerm = '';

function renderFilters(repos) {
  const counts = new Map();
  repos.forEach((r) => deriveTopics(r).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const row = $('#filter-row');
  row.innerHTML = `<button class="filter-chip active" data-topic="">All</button>` +
    sorted.map(([topic]) => `<button class="filter-chip" data-topic="${escapeHtml(topic)}">${escapeHtml(CONFIG.filterLabels[topic] || topic)}</button>`).join('');

  row.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    $$('.filter-chip', row).forEach((c) => c.classList.toggle('active', c === btn));
    activeFilter = btn.dataset.topic || null;
    renderProjects(allRepos);
  });

  $('#proj-search').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderProjects(allRepos);
  });
}

function sortRepos(repos) {
  const pinned = CONFIG.github.pinnedOrder;
  return [...repos].sort((a, b) => {
    const ai = pinned.indexOf(a.name), bi = pinned.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
}

async function renderProjects(repos) {
  let filtered = sortRepos(repos);
  if (activeFilter) filtered = filtered.filter((r) => deriveTopics(r).includes(activeFilter));
  if (searchTerm) filtered = filtered.filter((r) => (r.name + ' ' + (r.description || '')).toLowerCase().includes(searchTerm));

  const list = $('#proj-list');
  $('#proj-count').textContent = `${filtered.length} project${filtered.length === 1 ? '' : 's'}${activeFilter ? ` · filtered by ${CONFIG.filterLabels[activeFilter] || activeFilter}` : ''}`;

  if (!filtered.length) {
    list.innerHTML = `<p class="empty-state">No projects match that search or filter.</p>`;
    return;
  }

  list.innerHTML = filtered.map((r) => `<div class="skeleton-card" data-skel="${r.id}"></div>`).join('');

  const cardsHtml = await Promise.all(filtered.map((r, i) => buildProjectCard(r, i)));
  list.innerHTML = cardsHtml.join('');
}

async function buildProjectCard(repo, index) {
  const pinned = CONFIG.github.pinnedOrder.includes(repo.name);
  const rankLabel = pinned ? `FEATURED · ${String(CONFIG.github.pinnedOrder.indexOf(repo.name) + 1).padStart(2, '0')}` : `PROJECT · ${String(index + 1).padStart(2, '0')}`;

  let description = repo.description || '';
  if (!description) {
    const readme = await gh.getReadme(repo.owner.login, repo.name);
    description = gh.extractReadmeSummary(readme) || 'No description available yet — check the repository for details.';
  }

  const commit = await gh.getLatestCommit(repo.owner.login, repo.name);
  const commitMsg = commit ? (commit.commit.message.split('\n')[0]) : null;

  const topics = deriveTopics(repo).slice(0, 5);
  const pills = [repo.language, ...repo.topics.slice(0, 3)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

  const homepage = repo.homepage && repo.homepage.trim();
  const meta = CONFIG.projectMeta[repo.name] || { type: 'Personal', role: 'Development', status: null };

  return `
    <article class="proj-card">
      <div>
        <div class="proj-rank">${rankLabel}</div>
        <div class="proj-path">~/projects/${escapeHtml(repo.name)}</div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="pill-row">${pills.map((p) => `<span class="pill">${escapeHtml(p)}</span>`).join('')}</div>
        <div class="pill-row">
          <span class="pill meta-pill">${escapeHtml(meta.type)}</span>
          <span class="pill meta-pill">Role: ${escapeHtml(meta.role)}</span>
          ${meta.status ? `<span class="pill meta-pill">${escapeHtml(meta.status)}</span>` : ''}
        </div>
        <div class="proj-meta-row">
          <span title="Stars">★ ${repo.stargazers_count}</span>
          <span title="Forks">⑂ ${repo.forks_count}</span>
          <span title="Last updated">↻ ${timeAgo(repo.pushed_at)}</span>
        </div>
        <div class="proj-links">
          <a class="proj-link" href="${repo.html_url}" target="_blank" rel="noopener">
            View repository
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
          ${homepage ? `<a class="proj-link demo" href="${escapeHtml(homepage)}" target="_blank" rel="noopener">Live demo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>` : ''}
        </div>
      </div>
      <div class="proj-tree">${escapeHtml(repo.full_name)}
${commitMsg ? `last commit: ${escapeHtml(commitMsg.slice(0, 46))}` : ''}
${topics.length ? '\ntopics: ' + topics.map((t) => '#' + t).join(' ') : ''}</div>
    </article>`;
}

// ============================================================
// GitHub activity metrics + contribution heatmap
// ============================================================
async function loadActivity() {
  try {
    const data = await gh.getContributions(CONFIG.github.username);
    const days = data.contributions || [];
    const total = days.reduce((s, d) => s + d.count, 0);

    // current streak: consecutive days with count > 0 ending today/yesterday
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else if (i === days.length - 1) continue; // allow "today" to be zero so far
      else break;
    }

    let longest = 0, running = 0;
    days.forEach((d) => {
      running = d.count > 0 ? running + 1 : 0;
      longest = Math.max(longest, running);
    });

    setStat('total-contrib', total.toLocaleString());
    setStat('streak', `${streak}d`);
    setStat('longest-streak', `${longest}d`);
    renderHeatmap(days);
  } catch {
    setStat('total-contrib', '—', true);
    setStat('streak', '—', true);
    setStat('longest-streak', '—', true);
    $('#heatmap-loading').textContent = 'Contribution graph unavailable right now.';
  }
}

function renderHeatmap(days) {
  const container = $('#heatmap-container');
  if (!days.length) { container.innerHTML = '<p class="empty-state">No contribution data available.</p>'; return; }

  const cell = 11, gap = 3;
  const weeks = [];
  let week = [];
  days.forEach((d) => {
    week.push(d);
    if (new Date(d.date).getDay() === 6) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  const max = Math.max(...days.map((d) => d.count), 1);
  const levelColor = (count) => {
    if (count === 0) return 'var(--border)';
    const ratio = count / max;
    if (ratio < .25) return 'var(--accent-2-soft)';
    if (ratio < .6) return 'var(--accent-2)';
    return 'var(--accent)';
  };

  const w = weeks.length * (cell + gap);
  const h = 7 * (cell + gap);
  let rects = '';
  weeks.forEach((wk, wi) => {
    wk.forEach((d) => {
      const dow = new Date(d.date).getDay();
      rects += `<rect x="${wi * (cell + gap)}" y="${dow * (cell + gap)}" width="${cell}" height="${cell}" rx="2" fill="${levelColor(d.count)}"><title>${d.date}: ${d.count} contribution${d.count === 1 ? '' : 's'}</title></rect>`;
    });
  });

  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

// ============================================================
// Scroll progress, gutter, reveal-on-scroll (visual chrome)
// ============================================================
function initChrome() {
  const progressBar = $('#progress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  const reveals = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));

  const gutter = $('#gutter');
  const LINE_H = 24;
  function buildGutter() {
    if (!gutter || window.innerWidth <= 860) return;
    gutter.innerHTML = '';
    const total = Math.ceil(document.body.scrollHeight / LINE_H);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      const d = document.createElement('div');
      d.className = 'line';
      d.style.top = (i * LINE_H) + 'px';
      d.textContent = i + 1;
      frag.appendChild(d);
    }
    gutter.appendChild(frag);
  }
  function highlightGutter() {
    if (!gutter || window.innerWidth <= 860) return;
    const sections = $$('section');
    const scrollY = window.scrollY;
    let top = null, bottom = null;
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const secTop = rect.top + scrollY;
      const secBottom = secTop + rect.height;
      const viewMid = scrollY + window.innerHeight * 0.4;
      if (viewMid >= secTop && viewMid <= secBottom) { top = secTop; bottom = secBottom; }
    });
    $$('.line', gutter).forEach((l) => {
      const y = parseFloat(l.style.top);
      l.classList.toggle('active', top !== null && y >= top - LINE_H && y <= bottom);
    });
  }
  buildGutter();
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { buildGutter(); highlightGutter(); }, 200); });
  window.addEventListener('scroll', () => requestAnimationFrame(() => { highlightGutter(); updateProgress(); }));
  window.addEventListener('load', () => { buildGutter(); highlightGutter(); updateProgress(); });
}

// ============================================================
// Command palette (Ctrl/Cmd + K)
// ============================================================
function initCommandPalette() {
  const overlay = $('#cmdk-overlay');
  const input = $('#cmdk-input');
  const list = $('#cmdk-list');
  let items = [];
  let activeIndex = 0;

  function buildItems() {
    const sectionItems = $$('section[id]').map((s) => ({
      type: 'section', label: `Go to ${s.id}`, sub: '#' + s.id, action: () => location.hash = s.id,
    }));
    const projectItems = allRepos.map((r) => ({
      type: 'project', label: r.name, sub: 'open on GitHub', action: () => window.open(r.html_url, '_blank', 'noopener'),
    }));
    const actionItems = [
      { type: 'action', label: 'Toggle theme', sub: 'dark / light', action: () => $('#theme-toggle').click() },
      { type: 'action', label: 'Email Abolfazl', sub: CONFIG.person.email, action: () => window.location.href = `mailto:${CONFIG.person.email}` },
    ];
    items = [...sectionItems, ...projectItems, ...actionItems];
  }

  function render(query = '') {
    const q = query.trim().toLowerCase();
    const filtered = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
    activeIndex = 0;
    if (!filtered.length) { list.innerHTML = `<div class="cmdk-empty">No matches for "${escapeHtml(query)}"</div>`; return; }
    list.innerHTML = filtered.slice(0, 40).map((i, idx) => `
      <div class="cmdk-item" data-idx="${idx}" data-active="${idx === 0}">
        <span class="cmdk-icon">${i.type === 'project' ? '◆' : i.type === 'action' ? '▶' : '#'}</span>
        <span>${escapeHtml(i.label)}</span>
        <span class="cmdk-sub">${escapeHtml(i.sub)}</span>
      </div>`).join('');
    list.dataset.filtered = JSON.stringify(filtered.map((i) => items.indexOf(i)));
    list._current = filtered;
  }

  function open() {
    buildItems();
    overlay.classList.add('open');
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 10);
  }
  function close() { overlay.classList.remove('open'); }

  $('#cmdk-trigger').addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('open') ? close() : open(); }
    if (e.key === 'Escape') close();
    if (overlay.classList.contains('open')) {
      const current = list._current || [];
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, current.length - 1); paintActive(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); paintActive(); }
      if (e.key === 'Enter') { e.preventDefault(); current[activeIndex]?.action(); close(); }
    }
  });
  function paintActive() {
    $$('.cmdk-item', list).forEach((el, i) => el.setAttribute('data-active', String(i === activeIndex)));
  }
  input.addEventListener('input', () => render(input.value));
  list.addEventListener('click', (e) => {
    const el = e.target.closest('.cmdk-item');
    if (!el) return;
    const current = list._current || [];
    current[Number(el.dataset.idx)]?.action();
    close();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// ============================================================
// Boot
// ============================================================
function init() {
  initTheme();
  renderIdentity();
  renderTyped();
  renderAbout();
  renderFocus();
  renderWorkingOn();
  renderStack();
  renderTimeline();
  renderCertificates();
  renderContactLinks();
  initContactForm();
  initChrome();
  initCommandPalette();

  loadRepos();
  loadActivity();
}

document.addEventListener('DOMContentLoaded', init);
