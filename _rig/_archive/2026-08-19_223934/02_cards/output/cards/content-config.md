---
noun: Content collections config
path: src/content.config.ts
status: live
liveness: edge
---

## What it is

The single file that defines what a content entry in this site is allowed to
be. It declares three collections — writing
(src/content.config.ts:4@16a4fc4), work (src/content.config.ts:15@16a4fc4), and
people (src/content.config.ts:29@16a4fc4) — and exports them together at
src/content.config.ts:42@16a4fc4. Each pairs a glob loader pointed at one
directory under the content root (src/content.config.ts:5@16a4fc4,
src/content.config.ts:16@16a4fc4, src/content.config.ts:30@16a4fc4) with a Zod
schema that types and validates the frontmatter: dates and a draft flag for
writing (src/content.config.ts:6@16a4fc4), a shipped/in-progress status and an
explicit order for work (src/content.config.ts:19@16a4fc4), and a
founder/mentor grouping with an order for people
(src/content.config.ts:31@16a4fc4).

## Why it is shaped this way

Loader and schema are declared side by side per collection rather than split
across files, so the directory a collection reads from and the shape it
enforces cannot drift apart — the base path in the loader
(src/content.config.ts:5@16a4fc4) is the only thing binding a collection name
to a folder. Because the schemas are Zod, the types the pages receive from
their queries are derived from this file rather than declared again at each
call site.

## Hits

- src/pages/writing/index.astro — the writing listing loses its typed query and
  its frontmatter guarantees (edge: src/pages/writing/index.astro:5@16a4fc4)
- src/pages/writing/[...slug].astro — the writing entry route loses its typed
  query and its generated paths (edge: src/pages/writing/[...slug].astro:6@16a4fc4)
- src/pages/work/index.astro — the work listing loses its typed query and its
  frontmatter guarantees (edge: src/pages/work/index.astro:5@16a4fc4)
- src/pages/work/[...slug].astro — the work entry route loses its typed query
  and its generated paths (edge: src/pages/work/[...slug].astro:6@16a4fc4)
- src/pages/about.astro — the people listing on the about page loses its typed
  query (edge: src/pages/about.astro:5@16a4fc4)
- src/pages/rss.xml.js — the feed loses the writing query it is built from
  (edge: src/pages/rss.xml.js:5@16a4fc4)

## Does not hit

- src/content/writing/halt-is-not-fail.md — looks related because this file's
  writing schema (src/content.config.ts:6@16a4fc4) is exactly what validates
  that entry's frontmatter; no edge exists from src/content.config.ts to it.
  The binding is a directory glob, so no individual entry is named anywhere.
- astro.config.mjs — looks related because "config" names both files in this
  territory and a newcomer reaching for "the config" may land on either; no
  edge exists from src/content.config.ts to it.
