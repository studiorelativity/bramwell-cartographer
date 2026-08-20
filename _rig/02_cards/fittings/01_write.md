---
role: work
tools: "Read,Write"
model: claude-opus-5
max_turns: 60
budget_usd: 6.00
output: output/card-index.json
schema: card-index.schema.json
reads:
  - _config/card-template.md
  - _config/catalog-template.md
  - _config/noun-guidance.md
  - _config/territory.md
check_cmd:
  - "jq -e '(.cards | type) == \"array\"' output/card-index.json"
  - "jq -e '(.cards | length) >= 8 and (.cards | length) <= 12' output/card-index.json"
  - "jq -e '.catalog | strings | endswith(\"catalog.md\")' output/card-index.json"
  - "jq -e '[.cards[] | select((.file | strings | startswith(\"cards/\")) | not)] | length == 0' output/card-index.json"
  - "jq -e '[.cards[] | select((.slug | strings | test(\"^[a-z0-9]+(-[a-z0-9]+)*$\")) | not)] | length == 0' output/card-index.json"
  - "jq -e '.territory_commit | strings | test(\"^[0-9a-f]{7,40}$\")' output/card-index.json"
---
# Fitting 01 — Write

## Reads
- `../CONTEXT.md` — the stage contract
- `01_inventory/output/feed.json` — the upstream feed: the nomination list,
  the pinned commit, and the paths to the file and edge lists
- The edge list at the upstream feed's `edge_list` path — this is where
  every Hits and Does-not-hit line comes from
- The file list at the upstream feed's `file_list` path
- `run-input.md` at rig root — `quote_cap_lines`
- `_config/card-template.md` — the card contract; it governs, not this file
- `_config/catalog-template.md` — the catalog contract
- `_config/noun-guidance.md` — the closed contract list, for the contract
  ids you are asked to name
- `_config/territory.md` — the pin and the citation format
- Under `../_territory/`: ONLY the files named in the upstream feed's
  `nouns[].path`, plus any file you must open to place a citation you are
  actually writing. Never list, glob, or walk the tree — you have no tool to
  do so, by design, and the nomination list is the manifest.

## Work
Write one card per nominated noun, then the catalog, then the index.

**The card contract is `_config/card-template.md`.** Read it and follow it
exactly: four sections in order, the frontmatter shape, the status badge,
the citation format, the quote cap. Where this fitting and the template
appear to disagree, the template wins and you say so in your final message.

**Liveness.** The frontmatter carries a `liveness` field per the card
contract: `edge` or `contract`, on live nouns only, omitted otherwise. Both
values come from the upstream feed's `nouns[]` — you transcribe the
adjudication, you do not redo it. If the feed's liveness for a noun looks
wrong to you, write what the feed says and say so in your final message;
re-adjudicating here would put a second, ungraded judgment beside the graded
one.

For a **contract-live** card (`liveness: contract`), Section 1 names the
contract id from the feed's `contract_id` and states in one sentence why the
file matches it — the contract's own terms, from the closed list in
`_config/noun-guidance.md`. Never name a contract that is not on that list:
a contract class the list does not carry is a `_config/` change the human
makes, not a card improvisation. A contract id is a claim about evidence, so
it is held to the same standard as a citation.

Two contracts need their sentence written carefully. Under `astro-content`,
the match is the collection being defined AND queried, so say which
collection and cite the definition. Under `static-serving`, the contract
proves the file is served at the site root and nothing more — do not let the
sentence slide into claiming a page references it, which is finer evidence
this map does not hold.

**Citations.** Every factual claim carries `path:line@commit`, where `path`
is relative to the snapshot root, `line` is the actual line number in the
pinned file, and `commit` is the first 7 characters of the pinned hash from
`_config/territory.md`. Open the file and read the line before you cite it.
A citation you inferred from a filename is the one defect this whole rig
exists to catch.

**Read the line, then write the citation.** Before you write any citation,
open the cited file and read the line the number names. Confirm that line —
not the line above it, not the block it sits in — carries the content your
sentence claims. Then write the number you just read. A citation is copied
from the file open in front of you. It is never reconstructed from memory of
an earlier read.

The failure this prevents, stated so you can recognise yourself doing it:
you read a file early, you write its card later, and the number you write is
off by one or two because you are recalling a position instead of reading
one. The citation still resolves — the path exists, the line exists — so the
mechanical checker passes it, and it points at a neighbouring line that says
something else. It misleads rather than breaks, and that is worse: a broken
citation announces itself and this one does not.

Two shapes in this territory make it easy. A file with repeated
near-identical blocks will accept an anchor from the wrong block, so read
the block boundaries and not just the pattern. And a sentence naming several
adjacent fields is a claim about several lines: cite the line each one is
on, or narrow the sentence to the single line you actually read. One number
cannot stand for a range.

If re-opening a file to confirm a number feels redundant, that is the moment
the defect enters. Re-open it.

**Cite, never copy.** The cap is `quote_cap_lines` from `run-input.md`.
Quoting means any verbatim reproduction of source, fenced or inline. A card
that reproduces its subject is a photocopy, not a map. Prefer describing
what the line does and citing where it is.

**Hits.** Derive every Hits line from the edge list, never from memory. A
hit on noun N is an edge whose `to` is N's path: something that changes if N
changes. Each Hits line names the supporting edge by its `from`, `line`, and
the pinned commit, in the shape the card template gives. **No edge, no
hit** — a dependency you believe in but cannot cite does not go on the card.
For a contract-live noun the template also allows a hit to cite the contract
by id where the consumer is the toolchain itself — changing `package.json`
scripts hits the build under `toolchain-manifest`. That is the one hit form
with no edge behind it, and it is available only for a contract the feed
already established.

**Does not hit.** The claim here is the ABSENCE of an edge, and the verifier
checks that absence against the edge list. Name the neighbour a newcomer
would wrongly reach for, say why it looks related, and state that no edge
runs from this noun to it. Confirm the absence in the edge list before you
write it — an absence you did not check is a claim you cannot make.

**Ghost cards** carry the referencing line and the statement that the target
is absent from the file list, and nothing beyond that; the template says so.

**No prescriptions.** A card says what is and what moves. It never says what
should be refactored, improved, or cleaned up. Advice is out of contract.

**The catalog** follows `_config/catalog-template.md`: a short header naming
the territory, the pinned commit, and the one-card rule, then one door line
per card grouped by noun class. If the upstream feed reports
`leftovers_found: 0`, the header states that the territory carries no dead
weight — per `_config/noun-guidance.md` that is a finding the map reports,
not a silence. A door tells a reader whether their question
lives behind it. The catalog stores nothing the card holds — if a door line
reads like the card's first sentence moved up, it is a bad door.

**The index** is `output/card-index.json` per `card-index.schema.json`: one
entry per card with its noun, slug, path, status, file (`cards/<slug>.md`),
and the counts of its Hits and Does-not-hit lines. The card set hands off by
this manifest; a directory never crosses a stage boundary.

## Writes
- `output/cards/<noun-slug>.md` — one file per nominated noun, slug taken
  from the upstream feed's `nouns[].slug`.
- `output/catalog.md`
- `output/card-index.json`
- Nothing else, and never anything under `../_territory/`. You do not write
  `output/feed.json`; the next fitting does.
- Do NOT read or write any verdict, and do NOT grade your own output. The
  deterministic checks in this fitting's frontmatter are run by the
  orchestrator, not by you.
