/* Minimal interaction layer — mobile nav, theme toggle with
   localStorage, and scroll-reveal. No GitHub API, no dynamic
   content, no contact form — contact is just direct links. */
'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);

/* footer year */
$('#year').textContent = new Date().getFullYear();

/* ---------- theme toggle ---------- */
(function theme(){
  const stored = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
  sync(stored);

  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    sync(next);
  });

  function sync(t){
    $('#themeBtn').setAttribute('aria-pressed', t === 'light');
    $('#iconDark').hidden = t === 'light';
    $('#iconLight').hidden = t !== 'light';
  }
})();

/* ---------- mobile nav ---------- */
(function mobileNav(){
  const btn = $('#menuBtn');
  const nav = $('#siteNav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

/* ---------- scroll reveal ---------- */
(function reveal(){
  const targets = document.querySelectorAll('section, .work-card, .showcase-card, .focus-card, .path-step, .contact-row');
  targets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  targets.forEach((el) => io.observe(el));
})();
