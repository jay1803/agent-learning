# Long Context

A personal reading log about AI agents (formerly "Agent Learning"), built with [Astro](https://astro.build) and
deployed to GitHub Pages at <https://agent.maxoxo.me/>. Frontend is
forked from the `reading` site; posts are Markdown files in `src/content/posts/`.

## Adding a post (manual)

Give the agent a URL. It follows the ingest procedure in `AGENTS.md`: fetch the
article, write `src/content/posts/<slug>.md`, run `npm run build`, commit, push.
Push to `main` triggers `.github/workflows/deploy.yml`.

## Local development

```bash
npm install
npm run dev
npm run build
```
