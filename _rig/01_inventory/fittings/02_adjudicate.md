---
role: work
tools: "Read,Write,Grep,Glob"
model: claude-sonnet-5
max_turns: 25
budget_usd: 2.00
output: output/feed.json
schema: feed.schema.json
reads:
  - _config/territory.md
  - _config/noun-guidance.md
check_cmd:
  - "jq -e '.territory_commit | strings | test(\"^[0-9a-f]{7,40}$\")' output/feed.json"
  - "jq -e '.file_list | strings | endswith(\"files.json\")' output/feed.json"
  - "jq -e '.edge_list | strings | endswith(\"edges.json\")' output/feed.json"
  - "test -f \"../$(jq -r '.edge_list' output/feed.json)\""
  - "jq -e '(.nouns | length) >= 8 and (.nouns | length) <= 12' output/feed.json"
  - "jq -e '[.nouns[] | select((.status | IN(\"live\",\"leftover\",\"ghost\")) | not)] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select((.slug | strings | test(\"^[a-z0-9]+(-[a-z0-9]+)*$\")) | not)] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select((.status == \"live\") != ((.liveness // null) != null))] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select(.liveness != null) | select((.liveness | IN(\"edge\",\"contract\")) | not)] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select(((.liveness // \"\") == \"contract\") != ((.contract_id // null) != null))] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select((.liveness // \"\") == \"edge\") | select(.inbound_edges < 1)] | length == 0' output/feed.json"
  - "jq -e '[.nouns[] | select(.status == \"leftover\") | select(.inbound_edges != 0 or (.contract_id // null) != null)] | length == 0' output/feed.json"
  - "jq -e '(.collisions | type) == \"array\"' output/feed.json"
  - "jq -e '(.ghosts_found | numbers) >= 0 and (.leftovers_found | numbers) >= 0' output/feed.json"
---
# Fitting 02 — Adjudicate

## Reads
- `../CONTEXT.md` — the stage contract
- `run-input.md` at rig root — `territory_commit` and `target_noun_count`
- `01_inventory/output/raw/files.json` and `01_inventory/output/raw/edges.json`
  — the scan output, which is what you adjudicate
- `_config/territory.md` — the pin and the scan exclusions
- `_config/noun-guidance.md` — the noun classes, **the closed contract
  list**, and the selection rules

You read the scan output, not the raw territory. There are two exceptions,
both narrow. A ghost claim: to call a reference a ghost you must read the
referencing line so the claim is evidence-backed. A contract claim under
`astro-content`: you must read `src/content.config.ts` for the collection
definitions and locate the `getCollection` calls, because that contract has
a condition you cannot satisfy from the file list alone. Read what those two
claims need and nothing more.

## Work
Adjudicate first, then nominate.

### Status — two kinds of alive, one kind of dead

Liveness has **two evidence classes**, and `_config/noun-guidance.md` holds
the closed contract list that is the second one. Read that list before you
adjudicate anything; it governs, and this file only tells you how to apply
it.

- **`live`, `liveness: "edge"`** — one or more inbound edges in
  `edges.json`: edges whose `to` equals the file's path. Record the count in
  `inbound_edges`.
- **`live`, `liveness: "contract"`** — zero inbound edges, but the file
  matches a contract on the closed list. Record the contract's id in
  `contract_id`, and say in `why_selected` why the file matches it.
- **`leftover`** — **no inbound edge AND no contract matches.** A leftover
  badge asserts both absences, so check both before you write it. Do not
  reach for `leftover` because a file has no edges; that is one absence, and
  the badge claims two.
- **`ghost`** — an edge whose `to` is absent from `files.json`. In
  `edges.json` these carry `"resolved": false`, and `to` holds the raw
  specifier rather than a territory path.

**The list is closed.** Apply the contracts it names and no others. If a
file looks alive to you by some mechanism the list does not carry, that file
is `leftover` and you say so; a new contract class is a `_config/` change
the human makes, not something you improvise here. Inventing a contract id
is the worst available outcome — it manufactures the evidence the badge is
supposed to rest on.

Three application notes, because these are where the list is easy to
misapply:

- **`astro-content` has a condition, not just a path glob.** An entry is
  contract-live only if its collection is defined in `src/content.config.ts`
  AND at least one `getCollection` call for that collection exists in the
  territory. An entry in a collection nothing queries is `leftover`, not
  contract-live. Check both halves per collection; do not assume that
  because one collection is queried, all of them are.
- **`static-serving` proves servability, not reference.** It establishes
  that a file under `public/` is served at the site root. It does not
  establish that any page references it — that is finer evidence this scan
  does not collect. State the contract and claim exactly that much. An
  asset that is served but referenced by nothing is still contract-live
  under the list as written, and `why_selected` should not pretend
  otherwise.
- **An inbound edge wins.** If a file has both an inbound edge and a
  matching contract, `liveness` is `"edge"` — the edge is the more specific
  evidence, and `contract_id` stays absent.

Omit `liveness` and `contract_id` entirely for nouns that are not `live`.
The card contract's rule is the same one: they are live-only fields.

### Nomination

Select `target_noun_count` nouns (8–12, from `run-input.md`) per
`_config/noun-guidance.md`: rank by inbound edge count, then adjust by
judgment, honouring the noun classes and their priority order.
**Contract-live files rank by judgment alone** — a toolchain manifest or a
routed function is card-worthy regardless of edge count, and ranking it last
because its edge count is zero would reproduce the very mistake the two-class
rule exists to prevent.

If the inventory surfaced any `leftover` or `ghost` under the two-absence
rule, at least one MUST be nominated. If it surfaced none, record the zero
in `leftovers_found` / `ghosts_found` and move on — never invent one. Zero
dead weight is a finding, not a gap, and the catalog will say so downstream.

Record every naming collision the territory contains (one word meaning two
things) in `collisions`. If there are none, `collisions` is `[]`.

`why_selected` is one sentence per noun and it is not decoration: it is what
the verifier reads to judge whether the selection was reasoned or arbitrary,
and for a contract-live noun it is where the contract match is justified.

## Writes
- `output/feed.json`, per `feed.schema.json`. You are the only fitting in
  this stage that writes the feed. `file_list` and `edge_list` are
  rig-root-relative paths to the two files `bin/scan.sh` wrote;
  `territory_commit` is the first 7 characters of the pinned hash.
- Nothing else. You do not write cards, and you never write under
  `../_territory/`.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
