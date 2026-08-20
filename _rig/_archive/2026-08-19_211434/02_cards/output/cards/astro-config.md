---
noun: Astro config
path: astro.config.mjs
status: leftover
---

## What it is

The site's build configuration, eight lines long. It imports the framework's
config helper and the sitemap integration, then exports one config object
declaring the canonical site origin, a static output target, and the sitemap
integration as the build's only plugin (astro.config.mjs:1@dcba75e,
astro.config.mjs:2@dcba75e, astro.config.mjs:4@dcba75e,
astro.config.mjs:5@dcba75e, astro.config.mjs:6@dcba75e,
astro.config.mjs:7@dcba75e). No edge in the edge list resolves to it — nothing
in the territory imports or links it — so its status is leftover.

## Why it is shaped this way

The file is found by the build tool at a fixed root path rather than being
imported by anything, which is why a file with zero inbound edges is still
load-bearing; that convention is not stated anywhere inside the territory and
is not recoverable from source. The site origin declared here is the value the
layout's canonical link is built against (astro.config.mjs:5@dcba75e).

## Hits

No hit. No edge in the edge list resolves to this file, which is what its
leftover status records.

## Does not hit

- src/content.config.ts — looks related because the two share the word config
  and a newcomer changing a site setting opens whichever one the name matches
  first, though one configures the build and the other declares content
  schemas; no edge exists from this noun to it, and none from it back.
- package.json — looks related because both sit at the snapshot root, both name
  the same framework, and the build scripts that run this file are declared
  there; no edge exists from this noun to it.
