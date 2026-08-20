---
noun: Content collections config
path: src/content.config.ts
status: live
---

## What it is

The schema file for all three of the site's markdown collections. It defines
writing, work, and people, each with a glob loader pointed at its own directory
under src/content/ and a Zod object describing the frontmatter that directory's
files must carry (src/content.config.ts:4@dcba75e,
src/content.config.ts:15@dcba75e, src/content.config.ts:29@dcba75e). The
writing schema requires a title, a description, and a publication date, with an
optional update date and a draft flag that defaults to false
(src/content.config.ts:6@dcba75e); work requires a status drawn from a
two-value enum plus an ordering number and a summary
(src/content.config.ts:17@dcba75e); people requires a name, a role, an order,
and a group enum (src/content.config.ts:31@dcba75e). The three are exported as
one collections object, which is the surface every consumer queries
(src/content.config.ts:42@dcba75e).

## Why it is shaped this way

Three unrelated content types share one config file because Astro resolves
collections from a single module export rather than per-collection files
(src/content.config.ts:42@dcba75e). Why the loaders are glob loaders over
explicit file lists is not recoverable from source.

## Hits

- src/pages/writing/index.astro — the writing listing queries this collection,
  so a field added or renamed in the writing schema changes what it can render
  (edge: src/pages/writing/index.astro:5@dcba75e)
- src/pages/writing/[...slug].astro — the writing entry route generates one
  page per validated file, so schema changes change its generated set and its
  props (edge: src/pages/writing/[...slug].astro:6@dcba75e)
- src/pages/work/index.astro — the work listing sorts and renders on fields
  this schema declares (edge: src/pages/work/index.astro:5@dcba75e)
- src/pages/work/[...slug].astro — the work entry route generates its pages
  from this collection (edge: src/pages/work/[...slug].astro:6@dcba75e)
- src/pages/about.astro — the about page reads the people collection, so its
  roster changes with the people schema (edge: src/pages/about.astro:5@dcba75e)
- src/pages/rss.xml.js — the feed is built from the writing collection, so a
  change to its date or title fields changes the feed (edge:
  src/pages/rss.xml.js:5@dcba75e)

## Does not hit

- src/content/writing/ — looks related because these are the exact files the
  writing schema validates and the glob loader names the directory in this
  file; no edge exists from this noun to any of them, because the loader
  pattern is resolved at build time and not by the import graph.
- astro.config.mjs — looks related because the two share the word config and
  sit one directory apart, and a newcomer changing site settings opens
  whichever one they find first; no edge exists from this noun to it.
