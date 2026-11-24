import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import readingTheme from 'astro-reading-theme';
import rehypePangu from 'astro-reading-theme/rehype-pangu';

export default defineConfig({
  site: 'https://agent.maxoxo.me',
  integrations: [
    readingTheme({
      name: 'Agent Learning',
      description: 'Max 学习 Agent 时读过的文章与笔记。每篇都链回原文。',
      manifestDescription: 'Notes on learning about agents, available offline.',
      rssDescription: "Articles I'm reading to learn about agents.",
      features: { stats: true },
      nav: [
        { label: 'Stats', href: '/stats/' },
        { label: 'About', href: '/about/' },
      ],
    }),
  ],
  markdown: {
    gfm: false,
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [rehypePangu],
  },
  build: {
    inlineStylesheets: 'always',
  },
});
