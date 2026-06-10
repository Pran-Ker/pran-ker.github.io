# pran-ker.github.io

Personal site for Prannay Hebbar (prannayh.com) — static, hand-written HTML/CSS/JS, deployed on GitHub Pages.
**Status**: active

## Run
- dev: `python3 -m http.server 8000` (absolute paths like `/assets/...` require serving from repo root)
- test: none; verify in a browser

## Layout
- Pages live as `<dir>/index.html` (`/blog`, `/blog/model-watermarking`, `/contact`, `/more`, `/post`, `/principles`, `/research-read`); each page carries its own inline `<style>`/`<script>`.
- Root-level `blogs.html`, `detail.html`, `model-watermarking.html`, `other-stuff.html` are redirect stubs preserving old URLs — keep them.
- `/post#<slug>` fetches `/content/<slug>.md` (fallback `.html`) and renders it with marked.js/highlight.js/KaTeX, so every path under `content/` is URL-addressable: never move or rename content files. `content/blog-posts.json` drives the prev/next nav.
- Shared assets: `assets/css/style.css` (all global styles), `assets/js/script.js` + `modules/` (mobile nav toggle, generative `[data-art]` SVGs), `assets/fonts/` (Lab Grotesque, preloaded per page).
- `research-read/` is a self-contained poster index with its own `poster.css`; the `posters/*.md` files are unreferenced sources for the `.html` posters.

## Constraints
- Live site: page URLs, content paths, and `<head>` metadata are load-bearing; don't change them casually.
- `post/index.html` starts its content fetch before the deferred libraries load — deliberate performance optimization, keep the ordering.
