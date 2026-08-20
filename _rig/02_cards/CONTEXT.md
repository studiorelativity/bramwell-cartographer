---
fittings:
  - 01_write
  - 02_manifest
  - 03_verify
reads:
  - _config/card-template.md
  - _config/catalog-template.md
  - _config/noun-guidance.md
  - _config/territory.md
---
# Stage 02 — Cards (L2)

## What this stage is
Turns the nomination list into the map: one card per nominated noun, plus
the catalog that is the map's front door. This is the judgment core of the
rig — every factual claim on every card carries a `path:line@commit`
citation, and every Hits / Does-not-hit line is derived from the edge list,
not from memory.

The stage does NOT walk the territory. It reads the manifest it is handed
and only the nominated files. Rediscovering the tree here would put an
unadjudicated reading beside an adjudicated one, and the card would cite the
wrong one.

The territory is read-only. Nothing here writes under `../_territory/`.

## Inputs
- L4 (working): `../01_inventory/output/feed.json` — the only upstream
  input, gated before this stage runs by `requires.json`
- The edge list at the upstream feed's `edge_list` path — existence-checked
  by the gate
- The nominated territory files, by exact path, and nothing else under
  `../_territory/`
- L3 (reference): `_config/card-template.md` (the card contract),
  `_config/catalog-template.md` (the catalog contract),
  `_config/noun-guidance.md` (the closed contract list, for the contract ids
  contract-live cards name), `_config/territory.md` (the pin and the
  citation format)

## Fitting sequence
1. `01_write` — writes every card, the catalog, and `card-index.json`. The
   judgment-heavy fitting; it never authors the feed.
2. `02_manifest` — reads only what `01_write` produced, writes
   `output/feed.json`. The ONLY fitting in this stage that writes the feed.
3. `03_verify` — read-only gauge. Writes `output/verdict.json` only.

## Outputs
- `output/cards/<noun-slug>.md` — one card per nominated noun, per
  `_config/card-template.md`.
- `output/catalog.md` — the front door, per `_config/catalog-template.md`.
- `output/card-index.json` — the manifest the card set hands off by, shape
  per `card-index.schema.json`. A directory never crosses a stage boundary.
- `output/feed.json` — canonical handoff, shape per `feed.schema.json`.
- `output/verdict.json` — the verifier's reading (verifier only).

## Feed keys produced
`territory_commit`, `edge_list`, `catalog_path`, `card_index`, `cards_dir`,
`card_count` — consumed by `03_verify/requires.json`.
