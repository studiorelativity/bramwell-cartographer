---
role: work
tools: "Bash,Read"
model: claude-sonnet-5
max_turns: 12
budget_usd: 0.60
output: output/raw/citation-report.json
schema: citation-report.schema.json
reads:
  - _config/territory.md
check_cmd:
  - "jq -e '(.citations | type) == \"array\"' output/raw/citation-report.json"
  - "jq -e '(.cards | type) == \"array\"' output/raw/citation-report.json"
  - "jq -e '[.citations[] | select(.resolved | not)] | if length == 0 then true else (.[] | \"UNRESOLVED CITATION -- card \\(.card): \\(.citation): \\(.reason)\"), false end' output/raw/citation-report.json"
  - "jq -e '[.cards[] | select(.over_cap)] | if length == 0 then true else (.[] | \"OVER QUOTE CAP -- card \\(.card): \\(.quoted_lines) quoted lines\"), false end' output/raw/citation-report.json"
---
# Fitting 01 — Cite check

## Reads
- `../CONTEXT.md` — the stage contract
- `02_cards/output/feed.json` — the upstream feed: `cards_dir` and
  `territory_commit`
- `run-input.md` at rig root — `territory_path`
- `_config/territory.md` — the pin

## Work
Resolution is mechanical and is not yours to perform by tool. Invoke the
named script and inventory what it wrote (D7). A model reading a card and
deciding a line "looks right" is exactly the failure this stage exists to
prevent.

1. Read `02_cards/output/feed.json` and take `cards_dir`. Read
   `run-input.md` and take `territory_path`.
2. Run, from the rig root, with both values substituted:

       bin/cite-check.sh <cards_dir> <territory_path> 03_verify/output/raw/citation-report.json

   The script prints nothing on success. If it exits non-zero, do not retry
   and do not check citations by hand instead: stop and report the exact
   stderr line as your final message.
3. Inventory the report with Bash, reading only: the citation total, how
   many are unresolved, how many cards were checked, how many exceed the
   quote cap, and — if anything is unresolved or over cap — the card names.
4. State those numbers and any named cards in your final message.

You never write under `../_territory/`, and you never edit a card. If a
citation does not resolve, that is a finding, not a thing to fix here: this
stage grades the map, and a fitting that repaired the work it grades would
destroy the evidence.

## Writes
- Nothing by hand. `bin/cite-check.sh` writes
  `output/raw/citation-report.json`; you invoke it and report.
- Do NOT touch `output/feed.json`. The next fitting transcribes the report
  into the feed.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
