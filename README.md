# Dev Blog — Static Engineering Portfolio

A **static, English-language blog & portfolio** built with **React (Next.js)**
and deployed to **GitHub Pages**. Content is written as Markdown files and
compiled into a fast, SEO-friendly static site at build time. Articles are
organised by technical category — **Flutter**, **Golang**, and **Other** — which
makes it a natural fit for sharing your work with hiring teams in the US/EU.

> Everything is pre-rendered to plain HTML (`out/`), so there is no server to
> run and no database. Push Markdown, get a website.

---

## Features

- ⚡ **100% static** — Next.js static export, hosts anywhere (GitHub Pages, Netlify, Cloudflare, S3…).
- 📝 **Markdown articles** — drop a `.md` file into `content/`, it becomes a page.
- 🏷️ **Categories** — Flutter / Golang / Other, with dedicated listing pages and filters.
- 🎨 **Clean, recruiter-friendly design** — responsive, light theme, code highlighting.
- 🔍 **SEO & Open Graph** — per-post metadata for link previews.
- 🚀 **Zero-config CI** — GitHub Actions builds and deploys on every push to `main`.

## Tech stack

| Layer        | Choice                              |
| ------------ | ----------------------------------- |
| Framework    | Next.js 14 (App Router) + TypeScript |
| Rendering    | Static export (`output: 'export'`)   |
| Markdown     | `react-markdown` + `remark-gfm`      |
| Highlighting | `rehype-highlight` (highlight.js)    |
| Styling      | Hand-written CSS (no framework lock-in) |
| Deploy       | GitHub Pages via GitHub Actions      |

---

## Project structure

```
.
├── app/                     # Pages (App Router)
│   ├── layout.tsx           # Root layout + header/footer + SEO metadata
│   ├── page.tsx             # Home (hero + latest + topics)
│   ├── blog/
│   │   ├── page.tsx         # All articles
│   │   └── [slug]/page.tsx  # Single article
│   ├── categories/
│   │   ├── page.tsx         # Category index
│   │   └── [category]/page.tsx
│   ├── about/  projects/  contact/
│   └── globals.css          # All styling
├── components/              # Header, Footer, PostCard, CategoryBadge, PostContent
├── content/                 # ← YOUR MARKDOWN ARTICLES GO HERE
├── lib/
│   ├── site.config.ts       # ← EDIT THIS: name, role, social, categories
│   ├── posts.ts             # Markdown loader (build-time)
│   └── format.ts            # Date formatting
├── .github/workflows/deploy.yml
├── next.config.mjs          # Static export + GitHub Pages basePath
└── package.json
```

---

## Quick start

### Prerequisites
- Node.js 18+ (20 recommended)
- npm

### Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

### Build the static site

```bash
npm run build    # outputs to ./out
# preview the build:
npx serve out
```

---

## Writing articles (Markdown)

Create a file in `content/`. The filename becomes the URL slug (a leading
`YYYY-MM-DD-` date prefix is stripped automatically).

**Example:** `content/2026-04-01-my-flutter-tip.md`

```markdown
---
title: My Flutter Tip
date: 2026-04-01
category: flutter          # must match a slug in lib/site.config.ts
tags: [Flutter, Performance]
excerpt: One-line summary shown on cards and in previews.
---

# My Flutter Tip

Write your post in **Markdown**. Code blocks, tables, and lists all work.

```dart
print('hello from a code block');
```
```

### Frontmatter fields

| Field     | Required | Meaning                                                |
| --------- | -------- | ------------------------------------------------------ |
| `title`   | yes      | Article title                                          |
| `date`    | yes      | `YYYY-MM-DD` — used for sorting and display            |
| `category`| yes      | Category slug: `flutter` / `golang` / `other`          |
| `tags`    | no       | Array of strings, shown on cards                       |
| `excerpt` | no       | Short summary for cards & SEO (falls back to empty)    |

---

## Deploy to GitHub Pages

1. **Create a repo** on GitHub and push this project:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. **Enable Pages**: repo **Settings → Pages → Build and deployment → Source:
   "GitHub Actions"**.
3. **(Project pages only)** set a variable so asset paths resolve: repo
   **Settings → Secrets and variables → Actions → Variables**, add
   `BASE_PATH` = `/<repo>` (leading slash). Skip this for a user page
   (`<you>.github.io`) or a custom domain.
4. Every push to `main` triggers the workflow and publishes the site. The URL is
   shown on the Actions run and in Settings → Pages.

---

## Customising

- **Your info** — edit `lib/site.config.ts`: name, role, tagline, social links,
  and the `siteUrl` (used for SEO/canonical).
- **Categories** — add an entry to `siteConfig.categories` (slug + name + color),
  then tag articles with that slug.
- **Projects** — edit the `projects` array in `app/projects/page.tsx`.
- **Styling** — all visual design lives in `app/globals.css` (CSS variables at
  the top make re-theming easy).

---

## Notes

- This is a **static** site: there is no backend and no runtime Markdown
  parsing. To publish, add/commit a `.md` file and push — the CI regenerates the
  site.
- Need a CMS-like editor? Pair this with a GitHub-backed Markdown editor (e.g.
  Decap CMS) — the `content/` folder is already in the right shape.
