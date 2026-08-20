---
noun: Package manifest
path: package.json
status: leftover
---

## What it is

The npm manifest at the snapshot root, sixteen lines long. It names the
package, marks it private, sets the module type that makes the root config
file's import syntax legal, and pins a version (package.json:2@dcba75e,
package.json:3@dcba75e, package.json:4@dcba75e, package.json:5@dcba75e). It
declares three scripts — build, dev, and preview — each delegating to the
framework's own CLI (package.json:6@dcba75e), and three runtime dependencies:
the framework itself, its RSS helper, and its sitemap integration
(package.json:12@dcba75e, package.json:13@dcba75e, package.json:14@dcba75e). No
edge in the edge list resolves to it, so its status is leftover.

## Why it is shaped this way

Like the root build config, this file is located by convention at a fixed path
rather than imported, which is why nothing points at it and it still governs
the build; that convention is not stated inside the territory and is not
recoverable from source. The module type declared here is what lets the rest of
the tree use import syntax without a per-file extension dance
(package.json:3@dcba75e).

## Hits

No hit. No edge in the edge list resolves to this file, which is what its
leftover status records.

## Does not hit

- astro.config.mjs — looks related because the dependency named here is the
  tool that file configures, and both sit at the snapshot root as build
  furniture; no edge exists from this noun to it, and none from it back.
- src/pages/rss.xml.js — looks related because the RSS helper this file
  declares as a dependency is what that route is built on; no edge exists from
  this noun to it.
