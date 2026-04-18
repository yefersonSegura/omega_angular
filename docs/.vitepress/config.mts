import { defineConfig } from 'vitepress';

// GitHub Pages for https://<user>.github.io/<repo>/ — keep base in sync with the repo name
export default defineConfig({
  title: 'Omega Angular',
  description: 'Omega architecture for Angular — channel, intents, flows, agents.',
  base: '/omega_angular/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'npm', link: 'https://www.npmjs.com/package/omega-angular' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Core concepts', link: '/guide/concepts' },
        ],
      },
      {
        text: 'Tooling',
        items: [
          { text: 'Schematics', link: '/guide/schematics' },
          { text: 'ESLint', link: '/guide/eslint' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/yefersonSegura/omega_angular' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Omega Angular',
    },

    search: { provider: 'local' },
  },
});
