---
noun: Nav
path: src/components/Nav.astro
status: live
liveness: edge
---

## What it is

The site's primary navigation header: a home lockup link and a six-item link
list rendered from an array declared in the component's own frontmatter
(src/components/Nav.astro:5@86aa09a). It marks the reader's current page by
comparing each item's href against a path prop and setting `aria-current`
(src/components/Nav.astro:25@86aa09a); the path is supplied by the layout, not
read here. It is mounted once, above the main region of the base layout
(src/layouts/Base.astro:30@86aa09a), which is what puts it on every page.

## Why it is shaped this way

The labels and hrefs are a literal array rather than something derived from
the route tree because a comment records them as arriving from an upstream
feed and being consumed unchanged (src/components/Nav.astro:2@86aa09a). The
same comment marks this as the one instance of the lockup on a page that
animates (src/components/Nav.astro:4@86aa09a) — the footer's copy of the same
markup is explicitly the static one.

## Hits

- src/layouts/Base.astro — imports and renders this component and supplies its
  one prop; a change to that prop's name or shape breaks here
  (edge: src/layouts/Base.astro:2@86aa09a)

## Does not hit

- src/components/Footer.astro — looks related because it renders the same
  lockup markup and an overlapping link list
  (src/components/Footer.astro:19@86aa09a), so an edit here looks like it
  should propagate there; no edge exists from src/components/Nav.astro to it.
- src/styles/global.css — looks related because this component ships no scoped
  style block at all — it ends at its closing header element
  (src/components/Nav.astro:32@86aa09a) — so its class names must resolve
  somewhere else; no edge exists from src/components/Nav.astro to it.
