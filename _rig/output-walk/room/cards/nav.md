---
noun: Nav
path: src/components/Nav.astro
status: live
liveness: edge
---

## What it is

The site's primary navigation header, rendered at the top of every page by way
of the layout. It holds its six destinations in a local array
(src/components/Nav.astro:5@16a4fc4) and maps them to list items
(src/components/Nav.astro:23@16a4fc4), rather than receiving them from a page.
Its other half is the wordmark lockup, a link to the site root carrying the
dot and cursor spans (src/components/Nav.astro:17@16a4fc4). It takes exactly
one prop, the current path (src/components/Nav.astro:14@16a4fc4), and uses it
to set `aria-current` on whichever link matches
(src/components/Nav.astro:25@16a4fc4).

## Why it is shaped this way

Its header comment records that this instance is the one lockup on the page
allowed to animate its cursor (src/components/Nav.astro:4@16a4fc4), which is
why it renders the bare `nf-logo` class and the footer's copy adds a modifier.
The current-page marking is done with `aria-current` rather than a class
(src/components/Nav.astro:25@16a4fc4), so the state is announced to assistive
technology and styled from that same attribute.

## Hits

- src/layouts/Base.astro — the sole importer; the layout mounts this header above the page slot, so the change reaches every page through it (edge: src/layouts/Base.astro:2@16a4fc4)

## Does not hit

- src/components/Footer.astro — looks related because it renders the same wordmark lockup and a link list built the same way over the same six destinations (src/components/Footer.astro:8@16a4fc4); the two are independent copies and no edge exists from src/components/Nav.astro to it.
- src/styles/global.css — looks related because every rule that styles this component, from `.nf-nav` to the cursor animation, lives there (src/styles/global.css:209@16a4fc4); this component declares no styles of its own and no edge exists from src/components/Nav.astro to it.
