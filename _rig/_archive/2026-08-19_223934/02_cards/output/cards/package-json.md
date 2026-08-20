---
noun: package.json
path: package.json
status: live
liveness: contract
---

## What it is

The project manifest, sixteen lines. It is live under the contract
`toolchain-manifest`, which the contract list defines as `astro.config.mjs` and
`package.json` being read by the build toolchain by name: this file is that
filename at the snapshot root, so npm and Astro both load it without any
inbound reference. It declares three scripts — build, dev, and preview
(package.json:7@16a4fc4 through package.json:9@16a4fc4) — which are the only
entry points into the toolchain, marks the package as ESM
(package.json:3@16a4fc4) and unpublishable (package.json:5@16a4fc4), and names
three dependencies: Astro itself (package.json:12@16a4fc4) and the two
integrations the site uses, the RSS helper (package.json:13@16a4fc4) and the
sitemap generator (package.json:14@16a4fc4).

## Why it is shaped this way

The ESM declaration at package.json:3@16a4fc4 is what lets the build config be
written as a plain `.mjs` module with import syntax
(astro.config.mjs:1@16a4fc4) and no CommonJS shim. The two integration packages
are declared here but take effect elsewhere — the sitemap in the build config
(astro.config.mjs:7@16a4fc4), the RSS helper in the feed route — so a
dependency line alone never tells you whether a feature is switched on.

## Hits

- the Astro build — the build, dev, and preview commands and the resolved Astro
  version all come from this file (contract: toolchain-manifest)

## Does not hit

- astro.config.mjs — looks related because the sitemap integration is declared
  as a dependency here (package.json:14@16a4fc4) and activated there
  (astro.config.mjs:7@16a4fc4), which reads like one setting split in two; no
  edge exists from package.json to it.
- src/pages/rss.xml.js — looks related because the RSS helper is declared here
  (package.json:13@16a4fc4) and the feed route is the only place that would
  consume it; no edge exists from package.json to it.
