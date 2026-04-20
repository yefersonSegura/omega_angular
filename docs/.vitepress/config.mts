import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Omega Angular',
  description: 'Omega architecture for Angular — channel, intents, flows, agents.',
  base: '/omega_angular/',
  appearance: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/omega_angular/omega-logo.png', type: 'image/png' }],
    ['meta', { name: 'theme-color', content: '#00d2ff' }],
  ],
  themeConfig: {
    logo: '/omega-logo.png',

    /** Right-hand “On this page” outline (similar depth to angular.dev topic pages). */
    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },

    nav: [
      {
        text: 'Docs',
        link: '/guide/overview',
        // Match with or without VitePress `base` prefix (e.g. GitHub Pages `/omega_angular/`).
        activeMatch: '.*/guide/(?!api-reference|schematics|eslint|repository|example-app)',
      },
      {
        text: 'Reference',
        link: '/guide/api-reference',
        activeMatch: '.*/guide/api-reference',
      },
      {
        text: 'Tools',
        items: [
          { text: 'Schematics', link: '/guide/schematics' },
          { text: 'ESLint', link: '/guide/eslint' },
        ],
      },
      {
        text: 'Projects',
        items: [
          { text: 'Repository layout', link: '/guide/repository' },
          { text: 'Example app', link: '/guide/example-app' },
        ],
      },
      { text: 'About', link: '/guide/about' },
      { text: 'npm', link: 'https://www.npmjs.com/package/omega-angular' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Vision & why Omega', link: '/guide/vision-and-why' },
          { text: 'About the author', link: '/guide/about' },
        ],
      },
      {
        text: 'Essentials',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Core concepts', link: '/guide/concepts' },
          { text: 'Data flow', link: '/guide/data-flow' },
          { text: 'omega-setup.ts', link: '/guide/omega-setup' },
        ],
      },
      {
        text: 'In-depth guides',
        items: [
          { text: 'Channel & events', link: '/guide/channel-events' },
          { text: 'Intents, flows & manager', link: '/guide/intents-flows-manager' },
          { text: 'Agents & behaviors', link: '/guide/agents-behaviors' },
          { text: 'Navigation & Router', link: '/guide/navigation-router' },
        ],
      },
      {
        text: 'Reference',
        items: [{ text: 'API reference', link: '/guide/api-reference' }],
      },
      {
        text: 'CLI & tooling',
        items: [
          { text: 'Schematics', link: '/guide/schematics' },
          { text: 'ESLint', link: '/guide/eslint' },
        ],
      },
      {
        text: 'This repository',
        items: [
          { text: 'Repository layout', link: '/guide/repository' },
          { text: 'Example app', link: '/guide/example-app' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/yefersonSegura/omega_angular/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yefersonSegura/omega_angular' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        },
        link: 'https://yefersonsegura.com/',
        ariaLabel: 'Yeferson Segura — portfolio',
      },
    ],

    footer: {
      message:
        'Omega Angular — by <a href="https://yefersonsegura.com/" target="_blank" rel="noopener">Yeferson Segura</a>. Documentation for the npm package and this repository.',
      copyright: 'Copyright © present',
    },

    search: { provider: 'local' },
  },
});
