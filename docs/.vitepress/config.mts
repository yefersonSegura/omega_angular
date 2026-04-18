import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Omega Angular',
  description: 'Omega architecture for Angular — channel, intents, flows, agents.',
  base: '/omega_angular/',
  head: [
    ['link', { rel: 'icon', href: '/omega_angular/omega.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],
  themeConfig: {
    logo: '/omega.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Repository', link: '/guide/repository' },
      { text: 'npm', link: 'https://www.npmjs.com/package/omega-angular' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Core concepts', link: '/guide/concepts' },
          { text: 'omega-setup.ts', link: '/guide/omega-setup' },
        ],
      },
      {
        text: 'This repo',
        items: [
          { text: 'Repository layout', link: '/guide/repository' },
          { text: 'Example app', link: '/guide/example-app' },
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

    editLink: {
      pattern: 'https://github.com/yefersonSegura/omega_angular/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/yefersonSegura/omega_angular' }],

    footer: {
      message: 'Omega Angular — documentation for the npm package and this repository.',
      copyright: 'Copyright © present',
    },

    search: { provider: 'local' },
  },
});
