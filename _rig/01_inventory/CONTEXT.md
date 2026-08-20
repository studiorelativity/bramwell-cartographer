---
fittings:
  - 01_scan
  - 02_adjudicate
  - 03_verify
reads:
  - _config/territory.md
  - _config/noun-guidance.md
---
# Stage 01 — Inventory (L2)

## What this stage is
Walks the pinned territory snapshot mechanically, then adjudicates what the
walk found: which files are live, which are leftover, which references are
ghosts, and which eight to twelve nouns are worth a card. Nothing downstream
walks the territory again — this stage is the only place the whole tree is
read, and the card writer works from the nomination list.

The territory is READ-ONLY to every fitting and every script in this stage.
Nothing here ever writes under `../_territory/`.

## Inputs
- L4 (working): `run-input.md` at rig root — `territory_path`,
  `territory_commit`, `target_noun_count`, `quote_cap_lines`
- L3 (reference): `_config/territory.md` (the pin and the scan exclusions),
  `_config/noun-guidance.md` (what counts as a noun, selection rules)
- No upstream feed. `requires.json` declares no keys, so no feed-gate runs.

## Fitting sequence
Fittings run in folder order from `fittings/`:
1. `01_scan` — invokes `bin/scan.sh` and inventories what the script wrote.
   Mechanical retrieval goes through the named script, never a model tool
   (D7). This fitting never authors the feed.
2. `02_adjudicate` — reads the scan output, adjudicates status, nominates
   the card set. The ONLY fitting in this stage that may write
   `output/feed.json`.
3. `03_verify` — read-only gauge. Writes `output/verdict.json` and nothing
   else.

## Outputs
- `output/raw/files.json` — every file in the territory with its line count,
  written by `bin/scan.sh`.
- `output/raw/edges.json` — one edge per import/link statement, written by
  `bin/scan.sh`. Shape per `edges.schema.json`.
- `output/feed.json` — canonical handoff, shape per `feed.schema.json`.
- `output/verdict.json` — the verifier's reading (verifier only).

## Feed keys produced
`territory_commit`, `file_list`, `edge_list`, `nouns`, `collisions`,
`leftovers_found`, `ghosts_found` — consumed by `02_cards/requires.json`.
