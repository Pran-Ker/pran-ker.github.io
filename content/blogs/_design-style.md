# Blog Post Design Style

This document defines the visual and writing style for blog posts on pran-ker.github.io. Use it as a brief when creating a new post.

The reference implementation is `model-watermarking.html` at the repo root. Copy its structure when creating a new long-form post.

---

## Format

- Long-form essays live as **standalone HTML files at the repo root** (e.g. `model-watermarking.html`), not as markdown loaded into `detail.html`. This is what unlocks per-post diagrams and animation.
- Short link-style posts can still go as markdown in `content/blogs/` and be loaded via `detail.html#slug`.
- Always link the new post from `blogs.html` inside `.thoughts__container` with a `<span class="thought-date">`, an `<h3><a>`, and a one-line `.common-description`.

---

## Page chrome

Every standalone post must reuse the existing site shell:

- Same `<nav>` and `<header>` blocks copied from `blogs.html` (logo, menu, social bar)
- Same fonts: `LabGrotesque-Regular/Medium/Bold`, preloaded in `<head>`
- Same global stylesheet: `assets/css/style.css`
- Add a `.back-link` ("← Blogs") above the article title

---

## Color palette

Light theme. Defined as CSS variables at the top of every post.

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#fafafa` | Page background |
| `--ink` | `#0a0a0a` | Body text, strong UI elements |
| `--rule` | `#e6e6e6` | Borders, hairlines, table rows |
| `--muted` | `#6b6b6b` | Captions, meta, section numbers |
| `--accent` | `#00cfff` | Cyan — links, highlights, signals |
| `--accent-dim` | `rgba(0,207,255,0.12)` | Glows, hover backgrounds |
| `--green` | `#16a34a` | Positive / "exact" verifiability |
| `--red` | `#dc2626` | Broken / failure states |
| `--yellow` | `#f5b800` | Special highlights (terminal triggers, etc.) |

Cyan (`--accent`) is the only brand color. Use it sparingly: pull-quote rules, signal flows, hover states, primary diagrams. Never use it as a flat fill behind text.

---

## Typography

- Family: Lab Grotesque (already global). Code uses the system's mono fallback.
- Body size: `17px` mobile, `18px` desktop.
- Line height: `1.7` for body, `1.05` for h1, `1.2` for h2.
- Letter spacing: `-0.02em` on h1, `-0.01em` on h2 and pull quotes. Otherwise default.

### Heading scale

- **h1**: `clamp(2rem, 5vw, 3.4rem)`, weight 700.
- **h2**: `1.5rem`, weight 700, top margin `4rem`. Always preceded by `<hr />`.
- **Section number badge** (`.num`): pill before the h2 text. Format `01`, `02`, `03`. Uppercase, letter-spaced, muted, in a thin pill border.

### Lead paragraph

The first paragraph after the meta line uses class `lead`. `1.25rem`, line-height `1.55`. One thought, two sentences max.

### Pull quotes

Use `.pull-quote` for the one or two most load-bearing sentences in the post. Left rule in cyan, larger weight-500 type, no quote marks. One per ~5 sections, never more.

---

## Layout

- Article width: `max-width: 720px`, centered, padded `8rem 1.5rem 6rem`.
- Figures break the column with a negative margin (`-1.5rem` mobile, `-2.5rem` desktop) so they feel slightly wider than the prose.
- Top of post: animated hero element (matrix grid, particle field, etc.) immediately under the meta line, before the lead.

---

## Figures

Every figure follows the same structure:

```html
<div class="figure reveal" data-fig="<id>">
  <div class="figure__label">Figure NN · Short title</div>
  <!-- diagram -->
  <div class="figure__caption">One- or two-sentence explanation.</div>
</div>
```

- Figure number + interpunct + title. Label is `0.7rem`, uppercase, letter-spaced, muted.
- Caption is `0.85rem`, muted, immediately after the visual.
- White background, `1px` rule border, `12px` radius. Content padded `2rem`.
- Animations triggered by IntersectionObserver (`.reveal` → `.in-view`), not autoplaying on load.
- One figure per major section, not more.

### Diagram aesthetic

- Always **functional**, not decorative. Each diagram should show something the prose claims.
- Prefer SVG, CSS grids of small tiles, or terminal-style typography over heavy 3D / canvas effects.
- Motion: subtle. A flowing signal across a layer, a token being picked, a gauge filling. ~1–4s, looping or one-shot on reveal.
- Color: ink/muted as default, cyan for the active/observed signal, green/red for binary state.
- Always include a caption explaining what the viewer is seeing.

---

## Writing voice

The prose style is **flowing but spare**. Sentences should connect with conjunctions and qualifiers (`and`, `but`, `so`, `though`, `because`, `which`) rather than sit as standalone fragments. Short declarative sentences are still allowed for emphasis, but only one or two per section.

### Rules

- No em-dashes (`—`). Use commas, semicolons, colons, parentheses, or periods instead.
- No emoji.
- No second-person sales tone ("you'll love how…"). Keep the voice analytical.
- Don't open paragraphs with the same connective twice in a row.
- Code variables in `<code>` tags, equations in `.equation` blocks (centered, mono).
- Keep paragraphs to 3–5 sentences. If a paragraph runs longer, break it.

### Sectioning

- 6–10 numbered sections per post, each with a one-line h2.
- Always separate sections with `<hr />`.
- A short concluding section beneath a pull-quote is a strong default ending.

---

## Components reference

| Class | Purpose |
|---|---|
| `.lead` | Opening paragraph after meta |
| `.pull-quote` | Cyan-ruled emphasis quote |
| `.figure` | Diagram container |
| `.figure__label` / `.figure__caption` | Figure framing |
| `.equation` | Centered mono equation |
| `.terminal` | Black terminal block for input/output demos |
| `.comparison` | Striped comparison table with animated bars |
| `.bar` / `.bar__fill` | Animated horizontal bar |
| `.pill` (`.exact` / `.stat` / `.approx`) | Verifiability tag |
| `.reveal` | Fade-and-rise on scroll-into-view |
| `.back-link` | "← Blogs" link above title |

---

## Scaffolding a new post

1. Copy `model-watermarking.html` to `<slug>.html` at the repo root.
2. Replace the title, meta line, hero diagram, and body sections.
3. Update the `<title>`, OG tags, and `meta description`.
4. Add an entry to `blogs.html` inside `.thoughts__container`.
5. Keep all CSS variables and class names as-is. Override only when you genuinely need a new visual primitive — and if you do, add it to this document.

---

*This file is a style guide, not a blog post. It is intentionally not linked from `blogs.html`.*
