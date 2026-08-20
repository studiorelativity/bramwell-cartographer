---
noun: Astro config
path: astro.config.mjs
status: live
liveness: contract
---

## What it is

The build configuration for the whole site, and one of the two files in this
territory that no other file imports. It is live under the
`toolchain-manifest` contract: that contract covers `astro.config.mjs` at the
project root as a file the build toolchain reads by name rather than by
reference, and this is that file at that path. What it sets is short — the
canonical site origin (astro.config.mjs:5@16a4fc4), a static output target
(astro.config.mjs:6@16a4fc4), and one integration, the sitemap generator
(astro.config.mjs:7@16a4fc4).

## Why it is shaped this way

The site origin declared here is what lets the layout build an absolute
canonical URL from a relative path (src/layouts/Base.astro:20@16a4fc4), so the
value has one home and every page derives from it. The static output target
(astro.config.mjs:6@16a4fc4) is what makes the built site a directory of files,
which is the shape the platform's static serving and its separate function
routing both assume.

## Hits

- The Astro build — the site origin, the output target and the sitemap integration are read from this file by name at build time, so a change here changes every built page (contract: toolchain-manifest; astro.config.mjs:4@16a4fc4)

## Does not hit

- src/content.config.ts — looks related because both files are called "config" in this territory, so a newcomer searching for "the config" finds two; that one defines content collections and this one configures the build, and no edge exists from astro.config.mjs to it.
- package.json — looks related because it is the other half of the same contract at the same root, and the sitemap integration activated here is the dependency declared there (package.json:14@16a4fc4); no edge exists from astro.config.mjs to it.
