---
noun: Footer
path: src/components/Footer.astro
status: live
liveness: edge
---

## What it is

The site's closing chrome, rendered below the page slot on every page by way of
the layout. It carries its own link list of seven destinations
(src/components/Footer.astro:8@16a4fc4) — the nav's six plus the privacy page
(src/components/Footer.astro:15@16a4fc4) — a second instance of the wordmark
lockup (src/components/Footer.astro:19@16a4fc4), a standing line about the site
having been built and verified on the pipeline
(src/components/Footer.astro:30@16a4fc4), and a copyright year computed at build
time (src/components/Footer.astro:6@16a4fc4). It takes no props.

## Why it is shaped this way

Its header comment states the rule that shapes its markup: the lockup here is
not the nav's instance, so its cursor is held static by an explicit modifier
class written into the element rather than inherited
(src/components/Footer.astro:4@16a4fc4), and the stylesheet carries the matching
rule (src/styles/global.css:315@16a4fc4). The year is read from the build clock
rather than written down (src/components/Footer.astro:6@16a4fc4), so the notice
does not go stale on its own.

## Hits

- src/layouts/Base.astro — the sole importer; the layout mounts this footer below the page slot, so the change reaches every page through it (edge: src/layouts/Base.astro:3@16a4fc4)

## Does not hit

- src/components/Nav.astro — looks related because it renders the same wordmark lockup and covers six of these same seven destinations (src/components/Nav.astro:5@16a4fc4); the two are independent copies and no edge exists from src/components/Footer.astro to it.
- src/pages/privacy.astro — looks related because this footer holds the only link to `/privacy/` anywhere in the territory (src/components/Footer.astro:15@16a4fc4), which makes it look like the page's owner; the edge list records no edge from src/components/Footer.astro to src/pages/privacy.astro, so no Hits line on this card rests on it.
