---
fittings:
  - 01_cite_check
  - 02_inventory
  - 03_verify
reads:
  - _config/card-template.md
  - _config/territory.md
---
# Stage 03 — Verify (L2)

## What this stage is
The stage that makes the map worth trusting. Every citation on every card is
resolved mechanically against the pinned snapshot; every Hits and
Does-not-hit line is matched against the edge list; the photocopy cap is
enforced. Terminal stage: its feed has no downstream consumer.

The split here is the whole point. `bin/cite-check.sh` decides what a
machine can decide — does the path exist, does the line exist, does the
commit match, how many lines are quoted. It never decides whether a cited
line SUPPORTS the claim it is attached to. That judgment is the verifier's,
and moving it into the script would be the orchestrator thinking.

The territory is read-only. Nothing here writes under `../_territory/`.

## Inputs
- L4 (working): `../02_cards/output/feed.json` — the only upstream input,
  gated before this stage runs by `requires.json`, which existence-checks
  `card_index` and `edge_list`
- The card set, reached through the `card_index` manifest and `cards_dir`
- L3 (reference): `_config/card-template.md` (the contract the cards are
  judged against), `_config/territory.md` (the pin)

## Fitting sequence
1. `01_cite_check` — invokes `bin/cite-check.sh` and inventories what the
   script wrote (D7). Never authors the feed.
2. `02_inventory` — transcribes the script's report into `output/feed.json`.
   The ONLY fitting in this stage that writes the feed.
3. `03_verify` — the heavyweight verifier. This rubric is the product.
   Writes `output/verdict.json` only.

## Outputs
- `output/raw/citation-report.json` — the mechanical resolution report,
  written by `bin/cite-check.sh`. Shape per `citation-report.schema.json`.
- `output/feed.json` — canonical, shape per `feed.schema.json`.
- `output/verdict.json` — the verifier's reading (verifier only).

## Feed keys produced
`territory_commit`, `citation_report`, `citations_total`,
`citations_unresolved`, `cards_checked`, `cards_over_cap`. Terminal stage;
no consumer gate downstream.
