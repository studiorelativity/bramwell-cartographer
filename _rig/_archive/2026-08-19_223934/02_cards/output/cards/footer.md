---
noun: Footer
path: src/components/Footer.astro
status: live
liveness: edge
---

## What it is

The bottom half of the site chrome: a logo lockup
(src/components/Footer.astro:19@16a4fc4), a secondary nav list
(src/components/Footer.astro:23@16a4fc4), a sentence about how the site was
built (src/components/Footer.astro:30@16a4fc4), and a copyright line
(src/components/Footer.astro:31@16a4fc4). Its link array holds seven entries
(src/components/Footer.astro:8@16a4fc4 through
src/components/Footer.astro:16@16a4fc4) — the nav's six plus a privacy
destination that appears only here (src/components/Footer.astro:15@16a4fc4).
The year in the copyright line is computed at build time from the system clock
(src/components/Footer.astro:6@16a4fc4). A header comment records that every
visitor-facing word here is consumed by name from a copy manifest
(src/components/Footer.astro:2@16a4fc4).

## Why it is shaped this way

The lockup here carries an explicit static modifier class
(src/components/Footer.astro:19@16a4fc4) because a page may show only one
blinking cursor; the component states that reason in a comment
(src/components/Footer.astro:4@16a4fc4) and the stylesheet holds the rule that
the modifier triggers (src/styles/global.css:315@16a4fc4). The year is derived
rather than written down (src/components/Footer.astro:6@16a4fc4), which fixes
it to whenever the static build ran (astro.config.mjs:6@16a4fc4).

## Hits

- src/layouts/Base.astro — loses the footer element it renders below the page
  slot (edge: src/layouts/Base.astro:3@16a4fc4)

## Does not hit

- src/components/Nav.astro — looks related because both render the same lockup
  and overlapping link sets, so a label change looks like one edit; no edge
  exists from src/components/Footer.astro to it. They are two separate arrays.
- src/pages/privacy.astro — looks related because this footer holds the only
  link to the privacy route anywhere in the chrome
  (src/components/Footer.astro:15@16a4fc4); no edge exists from
  src/components/Footer.astro to it in the edge list.
