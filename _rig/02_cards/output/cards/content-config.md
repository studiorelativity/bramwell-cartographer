---
noun: Content collections config
path: src/content.config.ts
status: live
liveness: edge
---

## What it is

The file that defines and types every content collection in the site. It
declares three of them, each pairing a glob loader over its own directory with
a schema its entries must satisfy: `writing`
(src/content.config.ts:4@16a4fc4) over `src/content/writing`
(src/content.config.ts:5@16a4fc4), `work`
(src/content.config.ts:15@16a4fc4) over `src/content/work`
(src/content.config.ts:16@16a4fc4), and `people`
(src/content.config.ts:29@16a4fc4) over `src/content/people`
(src/content.config.ts:30@16a4fc4). The three are exported together as the
collections map (src/content.config.ts:42@16a4fc4), which is the shape Astro
reads.

## Why it is shaped this way

The schemas hold editorial rules that would otherwise live only in convention:
a writing entry carries a draft flag that defaults to false
(src/content.config.ts:11@16a4fc4), and a work entry is constrained to two
publication states (src/content.config.ts:20@16a4fc4) with an explicit ordering
number (src/content.config.ts:21@16a4fc4) rather than an implicit one. Why the
people entries are a collection rather than page data is not recoverable from
source.

## Hits

- src/pages/about.astro — queries a collection through `astro:content`, so a schema change re-types what this page reads (edge: src/pages/about.astro:5@16a4fc4)
- src/pages/rss.xml.js — builds the feed from a collection query, so the feed's fields follow this schema (edge: src/pages/rss.xml.js:5@16a4fc4)
- src/pages/work/index.astro — lists work entries from the collection defined here (edge: src/pages/work/index.astro:5@16a4fc4)
- src/pages/work/[...slug].astro — generates one page per work entry, typed by the schema here (edge: src/pages/work/[...slug].astro:6@16a4fc4)
- src/pages/writing/index.astro — lists writing entries from the collection defined here (edge: src/pages/writing/index.astro:5@16a4fc4)
- src/pages/writing/[...slug].astro — generates one page per writing entry, typed by the schema here (edge: src/pages/writing/[...slug].astro:6@16a4fc4)

## Does not hit

- src/content/writing/halt-is-not-fail.md — looks related because the loader declared here globs exactly the directory that entry sits in (src/content.config.ts:5@16a4fc4) and this schema is what its frontmatter is checked against; the entries are data this file describes rather than files it references, and no edge exists from src/content.config.ts to it.
- src/pages/contact.astro — looks related because it is a page like the six above and a newcomer expects every page to pull content from here; it queries no collection, and no edge exists from src/content.config.ts to it.
