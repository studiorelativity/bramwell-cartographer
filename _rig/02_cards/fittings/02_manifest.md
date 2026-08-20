---
role: work
tools: "Read,Write,Glob"
model: claude-sonnet-5
max_turns: 20
budget_usd: 1.00
output: output/feed.json
schema: feed.schema.json
reads:
  - _config/territory.md
check_cmd:
  - "jq -e '.territory_commit | strings | test(\"^[0-9a-f]{7,40}$\")' output/feed.json"
  - "jq -e '.card_index | strings | endswith(\"card-index.json\")' output/feed.json"
  - "test -f \"../$(jq -r '.card_index' output/feed.json)\""
  - "jq -e '.catalog_path | strings | endswith(\"catalog.md\")' output/feed.json"
  - "jq -e '.cards_dir | strings | endswith(\"cards\")' output/feed.json"
  - "jq -e '.edge_list | strings | endswith(\"edges.json\")' output/feed.json"
  - "test -f \"../$(jq -r '.edge_list' output/feed.json)\""
  - "jq -e '(.card_count | numbers) >= 8 and (.card_count | numbers) <= 12' output/feed.json"
  - "test \"$(jq -r '.card_count' output/feed.json)\" = \"$(jq -r '.cards | length' output/card-index.json)\""
---
# Fitting 02 — Manifest

## Reads
- `../CONTEXT.md` — the stage contract
- `02_cards/output/card-index.json` — the manifest `01_write` produced
- `02_cards/output/cards/` — listed, to confirm the index and the disk agree
- `02_cards/output/catalog.md` — checked for existence and its header
- `01_inventory/output/feed.json` — the upstream feed, for `territory_commit`
  and `edge_list`, which this stage forwards
- `_config/territory.md` — the pin

You read what the previous fitting wrote. You do not read the territory, you
do not read the cards' prose for judgment, and you do not fix anything you
find wrong — a mismatch is a fact you report in your final message, and the
verifier's to rule on.

## Work
Transcribe, do not derive. Every value in the feed comes from a file already
on disk:

1. `territory_commit` and `edge_list` are copied from
   `01_inventory/output/feed.json` unchanged. `edge_list` is forwarded
   because `03_verify` graph-matches every Hits line against it, and a feed
   is the only thing that crosses a stage boundary.
2. `card_index` is the rig-root-relative path
   `02_cards/output/card-index.json`.
3. `cards_dir` is the rig-root-relative path `02_cards/output/cards` — the
   directory argument `bin/cite-check.sh` takes. It is carried as a plain
   key, never as a `path_key`: directories are not gate targets.
4. `catalog_path` is the rig-root-relative path `02_cards/output/catalog.md`.
5. `card_count` is the length of the index's `cards` array — counted, not
   estimated.

Then state in your final message: the card count, whether every `file` named
in the index exists on disk, whether any card file on disk is missing from
the index, and whether `catalog.md` exists. Report; do not repair.

## Writes
- `output/feed.json`, per `feed.schema.json`. You are the only fitting in
  this stage that writes the feed.
- Nothing else. You do not touch the cards, the catalog, or the index.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
