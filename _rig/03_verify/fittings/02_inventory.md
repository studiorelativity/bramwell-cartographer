---
role: work
tools: "Read,Write"
model: claude-sonnet-5
max_turns: 15
budget_usd: 0.75
output: output/feed.json
schema: feed.schema.json
reads:
  - _config/territory.md
check_cmd:
  - "jq -e '.territory_commit | strings | test(\"^[0-9a-f]{7,40}$\")' output/feed.json"
  - "jq -e '.citation_report | strings | endswith(\"citation-report.json\")' output/feed.json"
  - "test -f \"../$(jq -r '.citation_report' output/feed.json)\""
  - "jq -e '(.citations_total | numbers) > 0' output/feed.json"
  - "jq -e '(.citations_unresolved | numbers) == 0' output/feed.json"
  - "jq -e '(.cards_over_cap | numbers) == 0' output/feed.json"
  - "jq -e '(.cards_checked | numbers) >= 8' output/feed.json"
  - "test \"$(jq -r '.citations_total' output/feed.json)\" = \"$(jq -r '.totals.citations' output/raw/citation-report.json)\""
  - "test \"$(jq -r '.citations_unresolved' output/feed.json)\" = \"$(jq -r '.totals.unresolved' output/raw/citation-report.json)\""
  - "test \"$(jq -r '.cards_checked' output/feed.json)\" = \"$(jq -r '.totals.cards' output/raw/citation-report.json)\""
  - "test \"$(jq -r '.cards_over_cap' output/feed.json)\" = \"$(jq -r '.totals.cards_over_cap' output/raw/citation-report.json)\""
---
# Fitting 02 — Inventory

## Reads
- `../CONTEXT.md` — the stage contract
- `03_verify/output/raw/citation-report.json` — the report
  `bin/cite-check.sh` wrote, and the only source of the numbers you record
- `02_cards/output/feed.json` — the upstream feed, for `territory_commit`
- `_config/territory.md` — the pin

## Work
Transcribe, do not derive. Every number in the feed is copied from the
report's `totals` object; none of them is counted again by you, estimated,
or reconciled against anything else:

- `citations_total` from `totals.citations`
- `citations_unresolved` from `totals.unresolved`
- `cards_checked` from `totals.cards`
- `cards_over_cap` from `totals.cards_over_cap`
- `citation_report` is the rig-root-relative path
  `03_verify/output/raw/citation-report.json`
- `territory_commit` is copied unchanged from `02_cards/output/feed.json`

If the report shows unresolved citations or cards over the quote cap, write
the real numbers anyway. The orchestrator's deterministic checks will stop
the run on them, and they will stop it naming the card. Writing a zero you
did not read would hide a defect and is the worst thing you could do here.
You do not fix a card, you do not re-run the script, and you do not
interpret a citation.

## Writes
- `output/feed.json`, per `feed.schema.json`. You are the only fitting in
  this stage that writes the feed.
- Nothing else, and never anything under `../_territory/`.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
