export const CONFIG = {
  site: {
    version: 'v1.1.0',
  },

  person: {
    email: 'artashaghaghi@gmail.com',
    typedLines: [
      'Building with WordPress & Figma',
      'Learning JavaScript — PHP is next',
      'Computer Engineering student',
      'Design → Build → Ship',
    ],
  },

  // Rendered as raw paragraphs in #about — inline HTML (e.g. <strong>) is fine.
  about: [
    "I'm a Computer Engineering student, and right now my focus is <strong>Web Design &amp; Development</strong>.",
    "Day to day I'm working with <strong>WordPress</strong>, <strong>Figma</strong>, and <strong>HTML/CSS</strong> — building real pages, laying out interfaces, and getting comfortable with responsive design.",
    "Next on my list: <strong>JavaScript</strong>, then <strong>PHP</strong> and proper WordPress development — followed by APIs, databases, and eventually React/Next.js. I'm not there yet, and this site doesn't pretend otherwise.",
  ],

  // "Current Focus" — only things actually being worked on right now.
  focusAreas: [
    { icon: '01', title: 'Web Design', desc: 'Planning layouts and interfaces before writing any code.' },
    { icon: '02', title: 'WordPress', desc: 'Building and customizing real sites, page by page.' },
    { icon: '03', title: 'UI Design', desc: 'Using Figma to design interfaces before building them.' },
    { icon: '04', title: 'HTML & CSS', desc: 'Hand-coding layouts and responsive pages from scratch.' },
  ],

  // "What I'm Working On" — static and honest, not tied to whatever
  // repo GitHub happens to show as most recently pushed.
  workingOn: {
    current: ['WordPress', 'Figma', 'HTML/CSS'],
    learning: 'Web Design & Responsive UI',
    next: ['JavaScript', 'PHP', 'WordPress Development'],
  },

  // Stack — kept in two clearly separate groups on purpose. Nothing in
  // "next" has actually been learned yet, so it never renders like a
  // current skill (see .stack-col.next in style.css).
  stack: {
    current: ['WordPress', 'Elementor', 'Figma', 'HTML', 'CSS', 'Git', 'GitHub'],
    next: ['JavaScript', 'PHP', 'MySQL', 'REST APIs', 'React', 'Next.js'],
  },

  // Roadmap — status is one of 'done' | 'current' | 'next'.
  // 'next' items are visually de-emphasized in style.css (.tl-item.next).
  timeline: [
    { year: '—', title: 'Programming Background', desc: 'University coursework and personal projects in C++ — where I first learned to think in code.', status: 'done' },
    { year: '01', title: 'Web Design & Development', desc: 'Started focusing seriously on web design and development.', status: 'current' },
    { year: '02', title: 'WordPress + Figma', desc: 'Building sites in WordPress and designing interfaces in Figma.', status: 'current' },
    { year: '03', title: 'JavaScript', desc: 'Next step: learning JavaScript to bring interfaces to life.', status: 'next' },
    { year: '04', title: 'PHP + WordPress Development', desc: 'After that: PHP, and proper WordPress theme/plugin development.', status: 'next' },
    { year: '05', title: 'React + Next.js', desc: 'Longer term: modern front-end frameworks and full-stack web development.', status: 'next' },
  ],

  // Real certificates only. Leave empty rather than invent one — the UI
  // already handles an empty list gracefully. Add entries like:
  // { title: '...', issuer: '...', date: '2026', verifyUrl: '...' }
  // and mark unfinished courses with date: 'In Progress'.
  certificates: [],

  social: [
    { url: 'https://github.com/shaghaghidev', label: 'GitHub', icon: 'github' },
    { url: 'mailto:artashaghaghi@gmail.com', label: 'Email', icon: 'mail' },
    { url: 'https://instagram.com/shaghaghipv', label: 'Instagram', icon: 'instagram' },
  ],

  github: {
    username: 'shaghaghidev',
    // The profile-README repo itself isn't a project — keep it out of stats/listing.
    excludeRepos: ['shaghaghidev'],
    // Shown first, in this order, labeled FEATURED.
    pinnedOrder: ['AbolfazlMind_Bot', 'telegram-privacy-checker', 'store-management-cpp'],
  },

  // Honest per-project attribution: what kind of project it is, and how
  // much of it is actually mine — shown as extra pills on each card.
  projectMeta: {
    AbolfazlMind_Bot: { type: 'Personal', role: 'Development & Direction', status: 'In Progress' },
    'telegram-privacy-checker': { type: 'Personal', role: 'Development & Direction', status: 'Completed' },
    'store-management-cpp': { type: 'University', role: 'Development', status: 'Completed' },
  },

  filterLabels: {
    python: 'Python',
    'c++': 'C++',
    html: 'HTML',
    css: 'CSS',
    wordpress: 'WordPress',
    figma: 'Figma',
    javascript: 'JavaScript',
  },
};
