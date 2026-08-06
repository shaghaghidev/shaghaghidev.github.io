// ============================================================
// SITE CONFIG — single source of truth for constant data.
// Project data, stats, activity, and commit info are NEVER
// hardcoded here — they're fetched live from the GitHub API
// by github-api.js. This file only holds identity, copy,
// and editorial choices (pin order, skill taxonomy, timeline).
// ============================================================

export const CONFIG = {
  github: {
    username: 'shaghaghidev',
    // Repos to exclude from the project grid (profile README repo, etc.)
    excludeRepos: ['shaghaghidev'],
    // Repos pinned to the top of the list, in order. Anything not
    // listed here still shows, sorted by last push, after these.
    pinnedOrder: ['AbolfazlMind_Bot', 'telegram-privacy-checker', 'store-management-cpp'],
  },

  site: {
    baseUrl: 'https://shaghaghidev.github.io',
    version: 'v2.1.0',
  },

  person: {
    firstName: 'Abolfazl',
    lastName: 'Shaghaghi',
    role: 'Python Tool Builder',
    tagline: 'Python tool builder & automation engineer. I turn repetitive work and half-formed ideas into software that actually gets used.',
    email: 'Artashaghaghi@gmail.com',
    location: 'Iran',
    avatar: 'https://avatars.githubusercontent.com/u/250031984?v=4',
    typedLines: [
      'I turn ideas into working software',
      'I build Python tools people actually use',
      'I design AI systems that solve real problems',
      'I automate everything that can be automated',
    ],
  },

  social: [
    { label: 'GitHub', url: 'https://github.com/shaghaghidev', icon: 'github' },
    { label: 'Email', url: 'mailto:Artashaghaghi@gmail.com', icon: 'mail' },
    { label: 'Instagram', url: 'https://instagram.com/shaghaghipv', icon: 'instagram' },
  ],

  focusAreas: [
    { icon: '01', title: 'Python CLI Tools', desc: 'Scripts & utilities' },
    { icon: '02', title: 'AI Automation', desc: 'LLM-powered workflows' },
    { icon: '03', title: 'Telegram Utilities', desc: 'Bots that do real work' },
    { icon: '04', title: 'Productivity Tools', desc: 'Less repetition, more output' },
  ],

  about: [
    'I build small, sharp things instead of big, vague ones. A Telegram bot that saves someone twenty minutes a day beats a framework nobody finishes — that\u2019s basically my whole design philosophy in one sentence.',
    'I\u2019m the person who reads the error message twice before asking anyone else to look at it, and who\u2019d rather ship something boring and correct than something exciting and half-tested. Automation only counts if it still works when nobody\u2019s watching it run.',
    'None of that is worth much as a claim, so I didn\u2019t write this page as one. Every number above updates itself straight from GitHub — no editing, no polishing before you look. What you\u2019re seeing right now is what\u2019s actually true today.',
  ],

  // Skills are NOT listed here — they're derived live from real GitHub data
  // (language bytes per repo, repo topics) in app.js, so they can never
  // drift from what's actually true on GitHub.

  // Timeline IS authored here rather than inferred from repo creation dates,
  // because real history includes things that never touched GitHub (early
  // Java/WordPress years, university acceptance, etc.).
  timeline: [
    { year: '2020', title: 'Started programming', desc: 'First lines of code in Java, then moved to Python — arrays, variables, and functions.' },
    { year: '2021', title: 'Shipped my first sites', desc: 'Got hooked on WordPress and built two real projects solo, end to end: learnafzar.ir and moviehub.ir.' },
    { year: '2022', title: 'Moved to frontend', desc: 'Shifted focus toward frontend development.' },
    { year: '2023', title: 'HTML, CSS & a bit of SEO', desc: 'Sharpened HTML/CSS fundamentals and picked up the basics of SEO.' },
    { year: '2026', title: 'Computer Engineering', desc: 'Accepted into Mazandaran University of Science and Technology and learned C++ — built a Store Management System as my final term project.' },
    { year: 'Now', title: 'Python & AI tooling', desc: 'Specializing in Python, integrating AI providers like OpenAI and Claude into real tools — vibe coding, one build at a time.' },
  ],

  // Add more certificates here any time — each one just needs these four
  // fields. date is optional (omit or leave null to hide it on the card).
  certificates: [
    {
      title: 'Zero Hack Certification',
      issuer: 'Maktabkhooneh',
      date: '4/4/2026',
      verifyUrl: 'https://www.maktabkhooneh.org/certificates/MK-YPQOQV/',
    },
  ],

  // Topic → filter label. Filters are derived live from each repo's GitHub topics
  // plus its primary language, so this is just how raw topic strings are displayed.
  filterLabels: {
    python: 'Python', ai: 'AI', automation: 'Automation', cli: 'CLI',
    api: 'API', telegram: 'Telegram', bot: 'Bot', 'machine-learning': 'ML',
  },
};
