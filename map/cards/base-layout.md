---
noun: Base layout
path: src/layouts/Base.astro
status: live
liveness: edge
---

## What it is

The single HTML shell every rendered page of this site passes through. It
takes a title and a description as props (src/layouts/Base.astro:10@16a4fc4)
and spends them on the document title (src/layouts/Base.astro:18@16a4fc4) and
the meta description (src/layouts/Base.astro:19@16a4fc4). It assembles the
site chrome itself — the nav above the page slot
(src/layouts/Base.astro:30@16a4fc4), the footer below it
(src/layouts/Base.astro:34@16a4fc4), and each page's own markup arriving
through the slot between them (src/layouts/Base.astro:32@16a4fc4). It is also
the one place the stylesheet enters the build
(src/layouts/Base.astro:4@16a4fc4).

## Why it is shaped this way

The layout reads the request path once (src/layouts/Base.astro:11@16a4fc4) and
hands it down to the nav as a prop (src/layouts/Base.astro:30@16a4fc4), so a
page never has to tell the chrome where it is; the same source supplies the
canonical URL (src/layouts/Base.astro:20@16a4fc4). The head carries one font
preload rather than all eight (src/layouts/Base.astro:22@16a4fc4) — the
weight the first heading is set in (src/styles/global.css:148@16a4fc4). Why
the chrome is inlined here rather than composed per page is not recoverable
from source.

## Hits

- src/pages/index.astro — renders inside this shell, so its title, meta, nav and footer all resolve here (edge: src/pages/index.astro:2@16a4fc4)
- src/pages/about.astro — same shell; head tags and chrome come from this file (edge: src/pages/about.astro:2@16a4fc4)
- src/pages/contact.astro — same shell; head tags and chrome come from this file (edge: src/pages/contact.astro:2@16a4fc4)
- src/pages/contact/error.astro — same shell, reached one directory down (edge: src/pages/contact/error.astro:2@16a4fc4)
- src/pages/contact/sent.astro — same shell, reached one directory down (edge: src/pages/contact/sent.astro:2@16a4fc4)
- src/pages/how-it-works.astro — same shell; head tags and chrome come from this file (edge: src/pages/how-it-works.astro:2@16a4fc4)
- src/pages/privacy.astro — same shell; head tags and chrome come from this file (edge: src/pages/privacy.astro:2@16a4fc4)
- src/pages/work/index.astro — same shell, reached one directory down (edge: src/pages/work/index.astro:2@16a4fc4)
- src/pages/work/[...slug].astro — every generated work page is wrapped by this shell (edge: src/pages/work/[...slug].astro:2@16a4fc4)
- src/pages/writing/index.astro — same shell, reached one directory down (edge: src/pages/writing/index.astro:2@16a4fc4)
- src/pages/writing/[...slug].astro — every generated writing page is wrapped by this shell (edge: src/pages/writing/[...slug].astro:2@16a4fc4)

## Does not hit

- src/pages/rss.xml.js — looks related because it sits under `src/pages/` alongside the eleven routes that do wrap themselves in this layout; it emits a feed rather than a document, and no edge connects it and src/layouts/Base.astro in either direction.
- src/components/ContactForm.astro — looks related because this layout is where the other components enter the page, so a newcomer reaches here to find every component mount; no edge exists from src/layouts/Base.astro to it — the form is mounted by a page, not by the shell.
