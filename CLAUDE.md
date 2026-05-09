# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static personal academic portfolio for **EDUC 5390** (Penn GSE, Spring 2026), a Critical Arts-Based Practices and Arts Integration course. Owner: Jasmine / Yuzhu Wang. Aesthetic is intentionally hand-drawn / sketchbook / watercolor — *not* corporate or minimalist.

The five canonical sections are: **About**, **Sketchbook** (10 images + reflection), **Lesson Plan & Reflection** (with embedded PDF), **Visual Teaching Philosophy** (15 book-page images + statement), **Culminating Essay** (with APA references).

## No build system

Plain HTML/CSS/JS. There is no package manager, bundler, or test runner. To preview, open any `*.html` directly in a browser, or serve the directory:

```
python3 -m http.server 8000
```

The `<image-slot>` drag-to-fill flow (see below) only persists when the page is served by a host that injects `window.omelette.writeFile` — opening via `file://` makes slots effectively read-only.

## Implementation: hand-drawn multi-page build

The active portfolio is a **5-page hand-drawn build**: `index.html` (About / home) + `sketchbook.html`, `lesson.html`, `philosophy.html`, `essay.html`. They share an identical `<head>` (inline CSS + Google Fonts), an SVG icon sprite at the top of `<body>`, the nav, the footer, and the lightbox + scripts at the bottom — only the central `<section>` differs per page.

- Hand-drawn / watercolor aesthetic. Fonts: **Caveat** / **Kalam** (display), **Patrick Hand** (hand), **Lora** / **Crimson Text** (serif body).
- Color tokens are CSS custom properties at the top of the inline `<style>` block: `--sage`, `--brown`, `--sun`, `--sky`, `--pink`, `--forest`, `--cream`, `--ink`. Reuse these; don't introduce ad-hoc hex codes.
- Decorative botanicals (leaves, branches, flowers, butterfly, tree, wave divider, etc.) live as inline `<symbol>` elements in a single hidden SVG sprite at the top of `<body>`, referenced via `<use href="#i-...">`. Add new icons to that sprite rather than inlining new SVGs scattered through the page.
- Galleries use a `data-gallery="..."` attribute on the container and `data-idx` on each `<figure class="polaroid">`. The lightbox script (bottom of every page) wires click → open, ←/→/Esc keyboard, touch swipe, and click-outside-to-close. To add a gallery item, follow the existing `<figure class="polaroid"><div class="frame">…</div><figcaption class="caption">…</figcaption></figure>` shape and the lightbox picks it up automatically.
- The Sketchbook gallery is masonry (`columns: 3`); the VTP gallery is a horizontal scroll/handscroll (`.scroll-shell` + `.scroll-gallery`) with prev/next nav buttons. Captions in both galleries are visually hidden (sr-only) and surfaced in the lightbox.
- The About bio uses a 2-col `.welcome` grid with a layered photo composition: `.bio-photo--main` (real photo, larger) + `.bio-photo--accent` (cartoon, smaller, absolute-positioned, tilted, overlapping the bottom-left).
- Per-page active nav state: every page loads the same nav HTML; a small IIFE at the bottom reads `location.pathname` and toggles `.is-active` on the matching link.
- Frame aspect-ratio rule: `.polaroid .frame:has(img)` drops fixed `aspect-ratio` so real images render at natural ratio. The VTP scroll-gallery overrides this back to `1/1` because it needs uniform-height tiles. The About `.bio-photo--*` figures override to `4/5`. Placeholder frames (`<span>` not `<img>`) keep whatever aspect-ratio their class declares.
- Image folders: `images/about/` (1.png cartoon, 2.jpg real photo), `images/sketch/1.png`–`10.png`, `images/VPT/1.png`–`15.png`. Filenames are numeric and order-bearing — keep them contiguous if you delete one (rename downstream so `1..N` stays a clean range).

When editing one page (e.g. sketchbook), changes to the `<head>` / nav / footer / scripts must be replicated to the other four pages — they're parallel copies. Use a coordinated edit (sed/grep-based bash) when changing shared chrome.

## Alternative implementation: editorial multi-file build

The repo also still contains `v1-editorial.html`, sharing `styles.css` + `image-slot.js` + `tape.js`. This is an older, editorial / magazine-style design with a totally different palette (OKLCH tokens — `--accent` terracotta, `--indigo`, `--tape`), Source Serif 4 / Inter Tight / JetBrains Mono fonts, and the `<image-slot>` web component (drag-to-fill placeholders persisted to `.image-slots.state.json`). The hand-drawn build has superseded it for the live portfolio, but the editorial assets are still on disk. Don't cross-port tokens or components between the two designs.

The per-section files (`sketchbook.html`, `lesson.html`, `philosophy.html`, `essay.html`) USED to belong to the editorial build; they are now the hand-drawn pages described above. If older editorial markup is wanted, it's archived only in `v1-editorial.html` and `styles.css`.

## `image-slot.js` — the fillable image component

Used only by the multi-file build. Read the header comment in `image-slot.js` for the full attribute list. Key behaviors that affect editing:

- Each `<image-slot>` needs a unique `id` — that's the persistence key. Reusing an id silently shares state between slots.
- Dropped images are encoded to WebP at ≤1200px and stored in `.image-slots.state.json` at the project root. **Do not commit user-dropped state into HTML; do not hand-edit the sidecar JSON.**
- Persistence relies on `window.omelette.writeFile`, which is only available in the host runtime that ships this stack. Outside that runtime (e.g. plain `python3 -m http.server`, GitHub Pages, `file://`), drops still render in-memory but don't survive a reload. Tell the user explicitly if you're testing in a context where persistence won't work.
- The sidecar bridge only allows writes to `*.state.json` basenames at the project root, so the HTML files must live at the project root too. Don't move them into a subdirectory.
- Aspect ratio comes from CSS on the host element (e.g. `.plate.p-1 image-slot { aspect-ratio: 4/3; }`), not from a component attribute.

## Asset directories

- `assets/` — finalized portrait/cover images already wired into the multi-file build (`bio-cover.png`, `bio-portrait.jpg`).
- `images/` — sketchbook scans and the like, used by `index.html`. Filenames mix English (`sketch-01-tree.jpg`) and Chinese (`博物馆.png`, `睡眠data.png`); preserve the originals when renaming.
- `uploads/` — source PDFs (e.g. the assignment criteria). The Lesson Plan PDF that should be embedded into the Lesson section is expected here.
- `.image-slots.state.json` — generated; treat as binary-ish state, do not edit by hand.

## Editing conventions

- The brief is in Chinese; the user may switch between Chinese and English mid-conversation. Comments in code and copy on the page itself stay in English.
- Placeholder text uses the literal pattern `[ PASTE ... HERE ]` / `[ ... PLACEHOLDER — 4:3 ]`. Keep this pattern when adding new slots so the owner's find-and-replace pass still works.
- Decorative tilt on polaroids/cards uses `transform: rotate(-3deg .. 3deg)` and resets to `0` on hover. New cards should follow the same range — going beyond ±3° starts to read as broken layout, not handcraft.
- The single-file build's nav uses `scroll-padding-top: 110px` for in-page anchors. If you change the sticky nav height, update that value too.
