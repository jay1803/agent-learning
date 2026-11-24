<!-- agent-repo-template:begin -->
## Repository guidance

Use this root file as the rule index. Read the existing guidance relevant to the
task directly; do not create a secondary index file.

| Task | Standard optional path, relative to the repository root |
| --- | --- |
| Branches, PRs, integration, and merge authority | `.agents/policies/development.md` |
| Code and architecture conventions | `.agents/policies/coding.md` |
| Required checks and their applicability | `.agents/policies/validation.md` |
| Add, change, rename, or remove local Skills | `.agents/policies/skills.md` |
| Production promotion authority for `$release` | `.agents/policies/release.yaml` |
| Project release SOP | `.agents/runbooks/release.md` |
| Project deployment and verification capability | `.agents/skills/deploy/SKILL.md` |

These files are optional; the table does not claim they exist. Link adopted
files directly from this root file, with when to read each. Use these standard
names unless the repository explicitly documents an exception. Keep repository
constraints in policies, procedures in runbooks, and callable capabilities in
Skills. Existing rules in this file remain applicable.

Missing ordinary guidance falls back to repository evidence and applicable
Skill defaults. Missing guidance does not grant merge, release, deployment, or
deletion authority. Resolve invalid or conflicting rules before the affected
operation. A repository's existing branch model and release SOP are not replaced
by template examples. `.agents/template-state.json` is update bookkeeping only.
<!-- agent-repo-template:end -->

## Project: Agent Learning site

Astro static site, deployed to GitHub Pages (custom domain `agent.maxoxo.me`) by
`.github/workflows/deploy.yml` on push to `main`. The frontend (layout, components,
standard pages) comes from the shared `astro-reading-theme` package
(`github:jay1803/astro-reading-theme`, local checkout `~/github/astro-reading-theme`);
this repo only holds content, `about.astro`, `public/`, and site config in `astro.config.mjs`.
Change front-end code in the theme repo, tag it, then bump the dependency here.

### Ingest procedure (user provides a URL; manual, never scheduled)

1. Fetch and read the full article at the URL (fall back to browser tools for paywalls/JS pages).
2. Write `src/content/posts/<slug>.md`. First look at an existing post to match the
   frontmatter: `title`, `date` (current UTC, ISO 8601), `category` (single lowercase
   word, default `agents`), `description` (one-line summary), `source` (exact URL),
   `author` (only if clearly bylined). Every value is a double-quoted YAML string;
   use curly quotes “ ” inside values, never a straight `"`.
3. Body: Chinese summary (unless the user says otherwise), conclusion first,
   a few markdown headings, high information density, a genuine summary of the
   author's least obvious points — no placeholder text.
4. Run `npm run build`; fix any failure before committing.
5. `git add` the post, commit (`--no-gpg-sign`, message `Add: <title>`), `git push origin main`.
6. Report the post URL: `https://agent.maxoxo.me/<slug>/`.

No org-roam / reading.org / queue.md involvement.
