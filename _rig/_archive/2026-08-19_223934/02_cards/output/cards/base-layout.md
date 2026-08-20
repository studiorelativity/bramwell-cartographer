---
noun: Base layout
path: src/layouts/Base.astro
status: live
liveness: edge
---

## What it is

The single shell every routed page in this territory passes through. It
imports the two chrome components and the one stylesheet at the top of its
frontmatter (src/layouts/Base.astro:2@16a4fc4, src/layouts/Base.astro:3@16a4fc4,
src/layouts/Base.astro:4@16a4fc4), declares a two-field Props interface for a
title and a description (src/layouts/Base.astro:6@16a4fc4), and renders the
page's own content into a slot sat between the nav and the footer
(src/layouts/Base.astro:30@16a4fc4, src/layouts/Base.astro:32@16a4fc4,
src/layouts/Base.astro:34@16a4fc4). Its head is where the site's per-page
metadata is assembled: the canonical link, the favicon, a font preload, and
the four Open Graph tags (src/layouts/Base.astro:20@16a4fc4 through
src/layouts/Base.astro:26@16a4fc4).

## Why it is shaped this way

The current pathname is computed here once from Astro's URL
(src/layouts/Base.astro:11@16a4fc4) and handed down to the nav
(src/layouts/Base.astro:30@16a4fc4), so the nav decides for itself which link
is current instead of every page having to declare its own position. The
canonical URL is resolved against the configured site origin
(src/layouts/Base.astro:20@16a4fc4, astro.config.mjs:5@16a4fc4), which is why
that origin lives in the build config and not in the layout. The one preloaded
font is the heaviest display weight (src/layouts/Base.astro:22@16a4fc4), loaded
ahead of the stylesheet's own face declaration for it
(src/styles/global.css:22@16a4fc4).

## Hits

- src/pages/index.astro — loses its shell, head tags, and chrome (edge: src/pages/index.astro:2@16a4fc4)
- src/pages/about.astro — loses its shell, head tags, and chrome (edge: src/pages/about.astro:2@16a4fc4)
- src/pages/contact.astro — loses its shell, head tags, and chrome (edge: src/pages/contact.astro:2@16a4fc4)
- src/pages/contact/sent.astro — loses its shell, head tags, and chrome (edge: src/pages/contact/sent.astro:2@16a4fc4)
- src/pages/contact/error.astro — loses its shell, head tags, and chrome (edge: src/pages/contact/error.astro:2@16a4fc4)
- src/pages/how-it-works.astro — loses its shell, head tags, and chrome (edge: src/pages/how-it-works.astro:2@16a4fc4)
- src/pages/privacy.astro — loses its shell, head tags, and chrome (edge: src/pages/privacy.astro:2@16a4fc4)
- src/pages/work/index.astro — loses its shell, head tags, and chrome (edge: src/pages/work/index.astro:2@16a4fc4)
- src/pages/work/[...slug].astro — loses its shell, head tags, and chrome (edge: src/pages/work/[...slug].astro:2@16a4fc4)
- src/pages/writing/index.astro — loses its shell, head tags, and chrome (edge: src/pages/writing/index.astro:2@16a4fc4)
- src/pages/writing/[...slug].astro — loses its shell, head tags, and chrome (edge: src/pages/writing/[...slug].astro:2@16a4fc4)

## Does not hit

- src/components/ContactForm.astro — looks related because it renders inside
  this shell on the contact page and inherits its head and chrome; no edge
  exists from src/layouts/Base.astro to it.
- src/components/RigDemo.astro — looks related because it is the largest thing
  rendered inside this shell on the homepage; no edge exists from
  src/layouts/Base.astro to it.
