# Noun guidance — what gets carded in an Astro site territory

A noun is a thing a next developer would ask "what is this and what
happens if I touch it." Nouns are files or coherent file groups, never
activities, never runs, never the story of how the site gets built.

## Noun classes, in priority order

1. **Token/style sources** — the file(s) where design tokens, palettes,
   and type live. Highest-value card: everything visual hangs off it.
2. **Layout spine** — the base layout(s) every page passes through.
3. **Components** — `src/components/`. Card the load-bearing ones (many
   inbound edges), not every button.
4. **Content collections** — `src/content/` config and the collection
   dirs. The schema file is the noun; individual entries are not.
5. **Site config** — `astro.config.mjs`, `package.json` (scripts and
   integrations, not the dependency list).
6. **Serverless functions** — `functions/`. Card each function as one
   noun.
7. **Public assets** — card only if something surprising lives there
   (fonts, verification files), as one grouped noun at most.

## The contract list (closed)

Liveness has two evidence classes: an inbound edge in `edges.json`, or a
membership in one of these contracts. This list is closed — adjudication
may apply these and no others. A file matching none, with no inbound
edge, is leftover.

- `astro-routing` — `src/pages/**` — served by Astro file-based routing;
  every file here is an entry point, not an orphan.
- `astro-content` — `src/content/<collection>/**` — entries consumed by
  `getCollection('<collection>')` calls; live iff the collection is
  defined in `src/content.config.ts` AND at least one `getCollection`
  call for it exists in the territory. An entry in a collection nothing
  queries is leftover, not contract-live.
- `toolchain-manifest` — `astro.config.mjs`, `package.json` — read by
  the build toolchain by name.
- `pages-functions` — `functions/**` — invoked by Cloudflare Pages
  file-based function routing.
- `static-serving` — `public/**` — served verbatim at the site root.
  Note: this contract proves servability, not reference. Whether a given
  asset is actually referenced by a page is finer evidence this scan
  does not collect; the adjudication states the contract and does not
  claim more.

## Selection rules

- Target `target_noun_count` cards (from run-input.md, 8–12). Fewer done
  well beats more done thin.
- Rank by inbound edge count from `edges.json`, then adjust by judgment:
  a config file with two edges can matter more than a component with six.
  Contract-live files rank by judgment alone; a toolchain manifest or a
  routed function is card-worthy regardless of edge count.
- If the inventory surfaces any **leftover** or **ghost** under the
  two-absence rule, at least one MUST be carded. An honest map marks its
  dead weight — but do not invent one. If nothing is dead, the feed
  records `leftovers_found: 0` and the catalog header states the
  territory carries no dead weight. That is a finding, not a gap.
- Do not card: anything under the scan exclusions, individual content
  entries, individual images, lockfiles.

## Naming collisions

Record every case where one word means two things in this territory
(e.g. a component name that matches a content collection name, "config"
meaning both Astro config and a data file). These go in the feed as a
`collisions` list — the map's reference material is built from them.
