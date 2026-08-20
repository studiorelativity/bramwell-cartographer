---
noun: Astro config
path: astro.config.mjs
status: live
liveness: contract
---

## What it is

The build configuration, and an eight-line file. It is live under the contract
`toolchain-manifest`, which the contract list defines as `astro.config.mjs` and
`package.json` being read by the build toolchain by name: this file is that
filename at the snapshot root, so the toolchain loads it without anything in
the territory importing it. It sets three things inside the config call
(astro.config.mjs:4@16a4fc4) — the site origin used for absolute URLs
(astro.config.mjs:5@16a4fc4), a static output mode
(astro.config.mjs:6@16a4fc4), and a single integration, the sitemap generator
imported at astro.config.mjs:2@16a4fc4 and activated at
astro.config.mjs:7@16a4fc4.

## Why it is shaped this way

The static output mode (astro.config.mjs:6@16a4fc4) is the reason the contact
submission is handled by a platform function rather than a server route inside
the Astro app — there is no server at request time to run one. The site origin
is declared here rather than in the layout because it is what the layout's
canonical URL is resolved against (src/layouts/Base.astro:20@16a4fc4).

## Hits

- the Astro build — the site origin, the output mode, and the sitemap
  integration are all read from this file when the toolchain starts
  (contract: toolchain-manifest)

## Does not hit

- src/content.config.ts — looks related because both are named "config" and a
  newcomer looking for "where the config lives" will find two answers; no edge
  exists from astro.config.mjs to it. Astro loads each by its own filename.
- package.json — looks related because both are toolchain manifests at the
  snapshot root and both name the same integration; no edge exists from
  astro.config.mjs to it.
