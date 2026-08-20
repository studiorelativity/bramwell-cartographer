# Run input (L4)

The run trigger for jidoka-cartographer. Every field below is read
mechanically — by `bin/scan.sh`, `bin/cite-check.sh`, and the fittings — so
keep each line in the exact shape shown below: a dash, the key in bold
with a trailing colon, then the value in backticks.

- **territory_path:** `../_territory`
- **territory_commit:** `16a4fc437b66fe860bb4247692070b6167cfc274`
- **target_noun_count:** `10`
- **quote_cap_lines:** `5`

## What this run maps

A pinned snapshot of the nofail-jidoka site subtree. The deliverable is a
verified system map: `02_cards/output/catalog.md` as the front door, one
card per nominated noun under `02_cards/output/cards/`, and a citation
report proving every claim resolves against the pinned commit.

> **The pin is not set.** `territory_commit` above still carries the
> placeholder. `bin/scan.sh` and `bin/cite-check.sh` both halt on it by
> design — a map of an unpinned target cannot be verified. Paste the hash
> recorded at snapshot time here AND in `_config/territory.md`, then reseal
> the supply (`node bin/seal-supply.mjs`) before a live run.
