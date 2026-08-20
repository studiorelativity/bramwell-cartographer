---
noun: Astro Config
path: astro.config.mjs
status: live
liveness: contract
---

## What it is

The Astro build configuration, and the whole of it: three settings inside one
`defineConfig` call — the canonical site origin, a static output mode, and one
registered integration (astro.config.mjs:4@86aa09a). Nothing in the territory
imports it; it is live under the `toolchain-manifest` contract, which covers
the files the build toolchain reads by name, and this file matches because
Astro loads it by its filename at build time rather than through any import.
Its only import is the sitemap integration package
(astro.config.mjs:2@86aa09a), and the site origin it sets is what the layout's
canonical link is resolved against (src/layouts/Base.astro:20@86aa09a).

## Why it is shaped this way

The file is three lines of settings (astro.config.mjs:5@86aa09a) because
almost everything that could otherwise be configured here has been pushed to
where it is used: content shape lives in the collections config, styling in
the global stylesheet, and the contact form's server behaviour in a platform
function outside Astro's build entirely.

## Hits

- the built site — output mode, canonical origin, and sitemap generation are
  read from here by the toolchain, so a change here changes what ships without
  any source file changing (contract: toolchain-manifest)

## Does not hit

- src/content.config.ts — looks related because both files are called "config"
  in this territory, the one naming collision the inventory recorded, and a
  newcomer after collection shape often opens this one first; no edge exists
  from astro.config.mjs to it.
- package.json — looks related because it is the other file this territory
  holds under the same `toolchain-manifest` contract, also read by name at
  build time; no edge exists from astro.config.mjs to it.
