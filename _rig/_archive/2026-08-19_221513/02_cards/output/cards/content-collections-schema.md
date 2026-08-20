---
noun: Content Collections Schema
path: src/content.config.ts
status: live
liveness: edge
---

## What it is

The file that defines the site's three content collections — writing, work,
and people — each as a glob loader over its own directory plus a Zod schema
its entries' frontmatter must satisfy
(src/content.config.ts:4@86aa09a). Writing requires a title, a description,
and a publication date, and carries the one defaulted field in the file
(src/content.config.ts:11@86aa09a); work requires a two-value status, a sort
order, a summary, and a stack line (src/content.config.ts:20@86aa09a); people
requires a name, a role, a sort order, and a founder-or-mentor group
(src/content.config.ts:35@86aa09a). The three are exported together as the
collections object Astro reads (src/content.config.ts:42@86aa09a).

## Why it is shaped this way

Every collection points its loader at an explicit base directory
(src/content.config.ts:5@86aa09a) rather than relying on directory
convention, so where a collection's entries live is stated in this file and
nowhere else. The draft field is defaulted rather than required
(src/content.config.ts:11@86aa09a), which is what lets the querying pages
filter drafts out at call time (src/pages/writing/index.astro:5@86aa09a)
instead of the schema rejecting them.

## Hits

- src/pages/writing/index.astro — lists the writing collection and filters on
  its draft field (edge: src/pages/writing/index.astro:5@86aa09a)
- src/pages/writing/[...slug].astro — generates one page per writing entry
  from the collection (edge: src/pages/writing/[...slug].astro:6@86aa09a)
- src/pages/work/index.astro — lists the work collection and sorts on its
  order field (edge: src/pages/work/index.astro:5@86aa09a)
- src/pages/work/[...slug].astro — generates one page per work entry, keyed on
  the collection's optional slug field
  (edge: src/pages/work/[...slug].astro:6@86aa09a)
- src/pages/about.astro — reads the people collection and splits it on its
  group field (edge: src/pages/about.astro:5@86aa09a)
- src/pages/rss.xml.js — builds the feed from the writing collection
  (edge: src/pages/rss.xml.js:5@86aa09a)

## Does not hit

- src/content/writing/halt-is-not-fail.md — looks related because this file's
  schema governs that entry's frontmatter and a schema change is what would
  invalidate it; no edge exists from src/content.config.ts to it, or to any
  other entry under src/content — the loader reaches entries by glob pattern
  (src/content.config.ts:5@86aa09a), not by reference.
- astro.config.mjs — looks related because both files are called "config" in
  this territory, the one naming collision the inventory recorded, so a
  newcomer looking for collection shape may open the other one first; no edge
  exists from src/content.config.ts to it.
