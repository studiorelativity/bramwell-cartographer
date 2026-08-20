---
noun: package.json
path: package.json
status: live
liveness: contract
---

## What it is

The npm manifest at the project root, and the second of the two files here that
no other file imports. It is live under the `toolchain-manifest` contract:
that contract covers `package.json` as a file the build toolchain reads by name
rather than by reference, and this is that file at that path. It carries three
scripts, each handing off to the astro binary — build
(package.json:7@16a4fc4), dev (package.json:8@16a4fc4) and preview
(package.json:9@16a4fc4). Its dependency block names Astro itself
(package.json:12@16a4fc4) alongside the two official integrations the site uses,
RSS (package.json:13@16a4fc4) and sitemap (package.json:14@16a4fc4).

## Why it is shaped this way

The manifest declares the package an ES module (package.json:3@16a4fc4), which
is what lets the config and the feed route be authored with `import` syntax
rather than CommonJS. It is marked private (package.json:5@16a4fc4), so the
manifest describes a deployable site rather than a publishable package.

## Hits

- The Astro build — the three scripts are what `npm run` resolves to the astro binary, so the commands that build, serve and preview the site are defined here (contract: toolchain-manifest; package.json:6@16a4fc4)
- The Astro build — the sitemap integration the build config activates is resolvable only because it is declared here (contract: toolchain-manifest; package.json:14@16a4fc4)

## Does not hit

- astro.config.mjs — looks related because the sitemap package declared here is the one that file imports and activates (astro.config.mjs:7@16a4fc4), so the two are read together by the same toolchain; no edge exists from package.json to it.
- src/pages/rss.xml.js — looks related because the `@astrojs/rss` dependency declared here (package.json:13@16a4fc4) is named for exactly the job that route does; no edge exists from package.json to it.
