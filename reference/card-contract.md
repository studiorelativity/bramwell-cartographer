# Card contract and the closed contract list

## Card shape

One card per noun, `map/cards/<slug>.md`. Frontmatter: noun, path,
status (live | leftover | ghost), and for live nouns a liveness class
(edge | contract). Four sections, in order:

1. **What it is** — two to four sentences, every factual claim cited
   `path:line@commit`.
2. **Why it is shaped this way** — the design reason a newcomer cannot
   see from the file alone. If it is not recoverable from source, the
   card says so instead of inventing a story.
3. **Hits** — what moves if you change this, one line per hit, each
   naming its supporting edge (or contract id).
4. **Does not hit** — the obvious wrong neighbour, denied with the
   checked absence that proves it.

Ghost cards cite the referencing line, state the target does not exist,
and stop.

## The closed contract list

Liveness without an inbound edge must name exactly one of these:

- `astro-routing` — `src/pages/**`: served by file-based routing; every
  file is an entry point, not an orphan.
- `astro-content` — `src/content/<collection>/**`: live iff the
  collection is defined in the schema AND at least one `getCollection`
  call for it exists in the territory. Entries of a collection nothing
  queries are leftover.
- `toolchain-manifest` — `astro.config.mjs`, `package.json`: read by
  the build toolchain by name.
- `pages-functions` — `functions/**`: invoked by Cloudflare Pages
  file-based function routing.
- `static-serving` — `public/**`: served verbatim at the site root.
  This contract proves servability, not reference — whether a given
  asset is actually used is finer evidence than the scan collects, and
  no card claims more.

The list is closed. Extending it is a rules change with a paper trail,
never a card's improvisation — an open list is how plausible-sounding
liveness gets attached to weak evidence.

## Naming collisions in this territory

Words that mean more than one thing here, so a reader does not walk
through the wrong door:

- `config` — `astro.config.mjs` is the Astro/build configuration;
  `src/content.config.ts` is the content-collection schema and loader
  definitions.
- `work` — `src/content/work/` is the work content collection (case-study
  entries); `src/pages/work/` is the routed work section of the site.
- `writing` — `src/content/writing/` is the writing content collection
  (post entries); `src/pages/writing/` is the routed writing section of
  the site.

One collision the repo itself carries, disclosed: the site this maps is
the public face of a verification practice, and the pipeline that built
this map is an instance of that practice. The territory is the site's
source — layouts, schemas, functions. The pipeline is machinery,
disclosed in the README, and no card points at it.
