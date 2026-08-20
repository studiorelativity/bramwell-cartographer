---
noun: Footer
path: src/components/Footer.astro
status: live
liveness: edge
---

## What it is

The site's footer chrome: a home lockup, a seven-item link list built from an
array in the component's frontmatter (src/components/Footer.astro:8@86aa09a),
a one-sentence line about the site having been built and verified on a gated
pipeline (src/components/Footer.astro:30@86aa09a), and a copyright line whose
year is computed when the site builds
(src/components/Footer.astro:6@86aa09a). Its link list is the navigation list
plus one more entry, Privacy (src/components/Footer.astro:15@86aa09a). It is
mounted once, below the main region of the base layout
(src/layouts/Base.astro:34@86aa09a), which is what puts it on every page.

## Why it is shaped this way

The lockup here carries an explicit static modifier class so its cursor does
not animate, and a comment records that as the deliberate difference from the
navigation instance (src/components/Footer.astro:4@86aa09a). The strings are
inline literals rather than props because a comment states every word here is
consumed by name from a copy manifest
(src/components/Footer.astro:2@86aa09a).

## Hits

- src/layouts/Base.astro — imports and renders this component
  (edge: src/layouts/Base.astro:3@86aa09a)

## Does not hit

- src/pages/privacy.astro — looks related because this footer's link list is
  the one place in the site chrome where the privacy route is offered to a
  reader (src/components/Footer.astro:15@86aa09a), so it reads like the page's
  only way in; no edge exists from src/components/Footer.astro to it.
- src/components/Nav.astro — looks related because both render the same lockup
  markup and six of the same destinations; no edge exists from
  src/components/Footer.astro to it.
