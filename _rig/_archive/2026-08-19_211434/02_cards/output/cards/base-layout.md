---
noun: Base layout
path: src/layouts/Base.astro
status: live
---

## What it is

The single HTML shell every route in the territory renders inside. It takes a
title and a description as typed props (src/layouts/Base.astro:6@dcba75e),
reads them off Astro.props, and derives the current pathname
(src/layouts/Base.astro:10@dcba75e, src/layouts/Base.astro:11@dcba75e). It
emits the whole document — doctype, head, body — including the page title, the
description meta, the canonical link, the favicon link, and a preload hint for
one display font (src/layouts/Base.astro:13@dcba75e,
src/layouts/Base.astro:18@dcba75e, src/layouts/Base.astro:20@dcba75e,
src/layouts/Base.astro:21@dcba75e, src/layouts/Base.astro:22@dcba75e). Inside
the body it places the nav, a main element holding a slot for the page's own
content, and the footer (src/layouts/Base.astro:30@dcba75e,
src/layouts/Base.astro:32@dcba75e, src/layouts/Base.astro:34@dcba75e).

## Why it is shaped this way

Three things a page must never each decide for itself — the site chrome, the
stylesheet, and the document head — are pulled in here once, at the top of the
file, so a route only supplies a title, a description, and a slot's worth of
content (src/layouts/Base.astro:2@dcba75e, src/layouts/Base.astro:3@dcba75e,
src/layouts/Base.astro:4@dcba75e). The current pathname is computed here and
handed down rather than read in the nav, which is what lets the nav mark the
active link without knowing where it sits (src/layouts/Base.astro:30@dcba75e).

## Hits

- src/pages/index.astro — the home route's layout import resolves here; its
  document shell and chrome come from this file (edge:
  src/pages/index.astro:2@dcba75e)
- src/pages/about.astro — same shell; its head tags are emitted here (edge:
  src/pages/about.astro:2@dcba75e)
- src/pages/how-it-works.astro — same shell (edge:
  src/pages/how-it-works.astro:2@dcba75e)
- src/pages/privacy.astro — same shell (edge: src/pages/privacy.astro:2@dcba75e)
- src/pages/contact.astro — same shell; the contact route wraps its form in it
  (edge: src/pages/contact.astro:2@dcba75e)
- src/pages/contact/sent.astro — the post-submit route renders inside this
  shell (edge: src/pages/contact/sent.astro:2@dcba75e)
- src/pages/contact/error.astro — the failure route renders inside this shell
  (edge: src/pages/contact/error.astro:2@dcba75e)
- src/pages/work/index.astro — the work listing renders inside this shell
  (edge: src/pages/work/index.astro:2@dcba75e)
- src/pages/work/[...slug].astro — every generated work entry page renders
  inside this shell (edge: src/pages/work/[...slug].astro:2@dcba75e)
- src/pages/writing/index.astro — the writing listing renders inside this shell
  (edge: src/pages/writing/index.astro:2@dcba75e)
- src/pages/writing/[...slug].astro — every generated writing entry page
  renders inside this shell (edge:
  src/pages/writing/[...slug].astro:2@dcba75e)

## Does not hit

- src/pages/rss.xml.js — looks related because it is a route file under
  src/pages/ and the writing index links to it, so a reader expects it to be
  wrapped like every other route; no edge exists from this noun to it, and none
  from it back, because it emits a feed rather than a document.
- astro.config.mjs — looks related because this file emits the head tags that a
  site-level config would seem to govern, including the canonical URL; no edge
  exists from this noun to it.
