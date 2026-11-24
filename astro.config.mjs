import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import readingTheme from 'astro-reading-theme';
import rehypePangu from 'astro-reading-theme/rehype-pangu';

export default defineConfig({
  site: 'https://agent.maxoxo.me',
  integrations: [
    readingTheme({
      name: 'Long Context',
      lang: 'zh-CN',
      description: '一份关于 AI Agent 的私人读本。从论文、工程博客到长推文。',
      dek: ['一份关于 AI Agent 的私人读本。', '从论文、工程博客到长推文。'],
      tagline: '每篇都附原文链接',
      manifestDescription: '关于 AI Agent 的文章摘要，支持离线阅读。',
      rssDescription: '关于 AI Agent 的文章摘要。',
      features: { stats: true },
      nav: [
        { label: '统计', href: '/stats/' },
        { label: '关于', href: '/about/' },
      ],
      footerLink: { label: '全部文章', href: '/' },
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
