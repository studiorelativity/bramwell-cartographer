---
noun: Self-hosted Web Fonts
path: public/fonts/archivo-800.woff2
status: live
liveness: edge
---

## What it is

The site's self-hosted webfont set: eight woff2 files under `public/fonts`,
bound to three families — Archivo at three weights, Inter at three, and
JetBrains Mono at two — by the `@font-face` block that opens the global
stylesheet (src/styles/global.css:6@86aa09a). The file this card is pinned to,
the heaviest Archivo weight, backs the display family token the headings use
(src/styles/global.css:98@86aa09a), and it is the only one of the eight the
layout preloads in the document head
(src/layouts/Base.astro:22@86aa09a). Its own declaration binds it to the
Archivo family at weight 800 with swap display
(src/styles/global.css:22@86aa09a), the same shape all eight declarations use.

## Why it is shaped this way

All eight ship from the site's own origin rather than a font CDN, and every
declaration sets swap display (src/styles/global.css:11@86aa09a) so text
paints before the file arrives. The three families are named once, as tokens
(src/styles/global.css:98@86aa09a), so nothing downstream ever names a font
file directly — which is why these files have inbound edges from only two
places. Why these eight weights and not others is not recoverable from source.

## Hits

- src/styles/global.css — the declaration that names this file as the source
  for Archivo 800; a rename here leaves that family weight undeclared
  (edge: src/styles/global.css:22@86aa09a)
- src/layouts/Base.astro — the head preload that names this file by path on
  every page; a rename leaves that preload pointing at nothing
  (edge: src/layouts/Base.astro:22@86aa09a)

## Does not hit

- public/favicon.svg — looks related because it is the other public asset the
  layout addresses by root-absolute path in the same head block
  (src/layouts/Base.astro:21@86aa09a), so the two read as one group of
  statically served files; no edge exists from
  public/fonts/archivo-800.woff2 to it.
- src/components/RigDemo.astro — looks related because that component sets its
  artifact panel in the mono family (src/components/RigDemo.astro:319@86aa09a),
  one of the three families this set supplies; no edge exists from
  public/fonts/archivo-800.woff2 to it, or from any font file to anything —
  these files are leaves in the edge list.
