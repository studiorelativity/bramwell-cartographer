---
noun: Site nav
path: src/components/Nav.astro
status: live
---

## What it is

The site's primary navigation bar. It declares six destinations as a local
array of label and href pairs — home, how it works, writing, work, about,
contact — and takes the current pathname as its only prop
(src/components/Nav.astro:5@dcba75e, src/components/Nav.astro:14@dcba75e). It
renders a header holding the wordmark lockup as a link home, then a labelled
nav element wrapping the list, marking whichever link matches the current path
as the current page for assistive technology
(src/components/Nav.astro:16@dcba75e, src/components/Nav.astro:17@dcba75e,
src/components/Nav.astro:21@dcba75e, src/components/Nav.astro:25@dcba75e). The
lockup carries a separate cursor span alongside the wordmark
(src/components/Nav.astro:19@dcba75e).

## Why it is shaped this way

The labels and hrefs are not authored here — the file records that they come
from an upstream feed's nav array and are consumed verbatim, which is why the
list is a flat literal with no computed entries
(src/components/Nav.astro:2@dcba75e). The lockup is duplicated between this
component and the footer rather than extracted because only this instance
animates its cursor; the file names itself the one animating instance on the
page (src/components/Nav.astro:4@dcba75e).

## Hits

- src/layouts/Base.astro — the layout imports this component and places it
  above main on every page, passing the current path down, so a change to the
  link set or the prop shape reaches the whole site through the layout (edge:
  src/layouts/Base.astro:2@dcba75e)

## Does not hit

- src/styles/global.css — looks related because the bar's own class rules,
  including its full-bleed hairline and its link states, are defined there
  rather than in this file; no edge exists from this noun to it, and none from
  it back.
- src/components/Footer.astro — looks related because it renders the same
  wordmark lockup markup and an overlapping link list, so a reader expects one
  to reuse the other; no edge exists from this noun to it.
