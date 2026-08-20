---
role: work
tools: "Bash,Read"
model: claude-sonnet-5
max_turns: 12
budget_usd: 0.60
output: output/raw/edges.json
schema: edges.schema.json
reads:
  - _config/territory.md
check_cmd:
  - "jq -e 'type == \"array\"' output/raw/edges.json"
  - "jq -e '[.[] | select(.from == null or .to == null or .line == null)] | length == 0' output/raw/edges.json"
---
# Fitting 01 — Scan

## Reads
- `../CONTEXT.md` — the stage contract
- `run-input.md` at rig root — `territory_path` and `territory_commit`
- `_config/territory.md` — the pin and the scan exclusions

## Work
The walk is mechanical and is not yours to perform by tool. Invoke the named
script and inventory what it wrote (D7): a model reading a tree with Glob and
Grep is a reading, not evidence, and every citation downstream rests on this
walk being exact.

1. Read `run-input.md` and take `territory_path`.
2. Run, from the rig root, with `territory_path` substituted:

       bin/scan.sh <territory_path> 01_inventory/output/raw

   The script prints nothing on success. If it exits non-zero, do not retry,
   do not work around it, and do not scan by tool instead: stop and report
   the exact stderr line as your final message. An unpinned or disagreeing
   commit is a deliberate halt, not a problem to route around.
3. Inventory what landed, using Bash only to read:
   - `01_inventory/output/raw/files.json` — how many files, and the count of
     each extension present.
   - `01_inventory/output/raw/edges.json` — how many edges, how many carry
     `"resolved": false`.
4. State those counts in your final message. The next fitting reads the two
   JSON files; your inventory is the human-legible receipt that the walk ran.

You never write under `../_territory/`. The territory is read-only to this
rig, and `bin/scan.sh` only reads it.

## Writes
- Nothing by hand. `bin/scan.sh` writes `output/raw/files.json` and
  `output/raw/edges.json`; you invoke it and report.
- Do NOT touch `output/feed.json`. You run the retrieval; the feed is not
  your joint.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
