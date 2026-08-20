---
noun: Nav
path: src/components/Nav.astro
status: live
liveness: edge
---

## What it is

The site's primary navigation header: a logo lockup anchored to the root
(src/components/Nav.astro:17@16a4fc4) followed by a labelled nav list
(src/components/Nav.astro:21@16a4fc4). Its six destinations are a literal array
of label and href pairs held in the frontmatter
(src/components/Nav.astro:5@16a4fc4 through src/components/Nav.astro:11@16a4fc4),
mapped into list items at src/components/Nav.astro:23@16a4fc4. It takes a
single prop, the current pathname (src/components/Nav.astro:14@16a4fc4), and
uses it to set the current-page ARIA state on the matching link
(src/components/Nav.astro:25@16a4fc4). A header comment records that the labels
and hrefs are consumed verbatim from an upstream feed rather than authored here
(src/components/Nav.astro:2@16a4fc4).

## Why it is shaped this way

The nav is imported once by the layout rather than by each page
(src/layouts/Base.astro:2@16a4fc4), and it receives the pathname as a prop
instead of reading it itself, so the comparison that marks the current link
happens in one place. This is also the one lockup instance on a page whose
cursor animates: the component states that intent in a comment
(src/components/Nav.astro:4@16a4fc4) and enacts it by omitting the static
modifier that the footer's lockup carries
(src/components/Footer.astro:19@16a4fc4), with the animation and its cancelling
rule both living in the stylesheet (src/styles/global.css:302@16a4fc4,
src/styles/global.css:315@16a4fc4).

## Hits

- src/layouts/Base.astro — loses the header element it renders above the page
  slot, and the pathname prop it passes becomes unconsumed (edge: src/layouts/Base.astro:2@16a4fc4)

## Does not hit

- src/components/Footer.astro — looks related because it renders the same logo
  lockup markup and six of the same seven link labels; no edge exists from
  src/components/Nav.astro to it. The two link lists are independent literals.
- src/styles/global.css — looks related because every class this component
  names is defined there; no edge exists from src/components/Nav.astro to it.
