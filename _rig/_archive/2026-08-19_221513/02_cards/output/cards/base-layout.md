---
noun: Base Layout
path: src/layouts/Base.astro
status: live
liveness: edge
---

## What it is

The single HTML document shell every page renders inside: it opens the
doctype and the html element, builds the head, and drops the page body into a
slot (src/layouts/Base.astro:32@86aa09a). It takes a title and a description
as typed props (src/layouts/Base.astro:6@86aa09a) and turns them into the
title element, the meta description, the canonical link, and the Open Graph
pair (src/layouts/Base.astro:18@86aa09a). It is the only place the site chrome
is mounted — navigation above the main region and footer below it
(src/layouts/Base.astro:30@86aa09a) — and the only place the global stylesheet
is imported (src/layouts/Base.astro:4@86aa09a).

## Why it is shaped this way

Nav and Footer are imported here rather than by each page because this layout
is what every route already passes through, so mounting the chrome once here
is what makes it site-wide; the current URL path is read here and handed down
as a prop (src/layouts/Base.astro:11@86aa09a) so the active link can be marked
without any page knowing it is the active one. The head preloads exactly one
font file, the heaviest display weight (src/layouts/Base.astro:22@86aa09a),
rather than the whole self-hosted set.

## Hits

- src/pages/index.astro — the homepage's shell; its head tags and chrome come
  from here (edge: src/pages/index.astro:2@86aa09a)
- src/pages/about.astro — the about page's shell
  (edge: src/pages/about.astro:2@86aa09a)
- src/pages/contact.astro — the contact page's shell
  (edge: src/pages/contact.astro:2@86aa09a)
- src/pages/contact/sent.astro — the post-submit confirmation route's shell
  (edge: src/pages/contact/sent.astro:2@86aa09a)
- src/pages/contact/error.astro — the post-submit failure route's shell
  (edge: src/pages/contact/error.astro:2@86aa09a)
- src/pages/how-it-works.astro — that page's shell
  (edge: src/pages/how-it-works.astro:2@86aa09a)
- src/pages/privacy.astro — the privacy page's shell
  (edge: src/pages/privacy.astro:2@86aa09a)
- src/pages/work/index.astro — the work index's shell
  (edge: src/pages/work/index.astro:2@86aa09a)
- src/pages/work/[...slug].astro — the shell for every generated work entry
  page (edge: src/pages/work/[...slug].astro:2@86aa09a)
- src/pages/writing/index.astro — the writing index's shell
  (edge: src/pages/writing/index.astro:2@86aa09a)
- src/pages/writing/[...slug].astro — the shell for every generated writing
  entry page (edge: src/pages/writing/[...slug].astro:2@86aa09a)

## Does not hit

- src/components/ContactForm.astro — looks related because it renders inside
  this layout on /contact, so a newcomer changing the page shell expects to
  find it mounted here alongside Nav and Footer; no edge exists from
  src/layouts/Base.astro to it — the page imports it directly
  (src/pages/contact.astro:3@86aa09a).
- src/content.config.ts — looks related because every collection-driven page
  wraps its entries in this layout; no edge exists from
  src/layouts/Base.astro to it — the pages query the collections themselves
  (src/pages/writing/index.astro:5@86aa09a).
