import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import rehypePangu from './src/lib/rehype-pangu.mjs';

export default defineConfig({
  site: 'https://jay1803.github.io',
  base: '/agent-learning',
  markdown: {
    gfm: false,
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [rehypePangu],
  },
  build: {
    inlineStylesheets: 'always',
  },
});
