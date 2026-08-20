# Verification method

What "verified" means in this repo, claim class by claim class, and how
to re-run every check yourself. The territory is pinned in
`_territory/`; the pipeline is in `_rig/`; the journal of every run —
including the failures — is in `_rig/log/`.

## The claim classes and their checks

| Claim on a card | Checked by | How |
| --- | --- | --- |
| A citation `path:line@commit` | script, then verifier | script resolves path, line, and commit against the pinned territory; verifier opens the line and judges whether it supports the sentence attached to it |
| A **Hits** line | verifier | must name an edge present in the extracted `edges.json` with matching source and line, or a contract id from the closed list for contract-live nouns |
| A **Does not hit** line | verifier | the denied edge must be genuinely absent from `edges.json` |
| A liveness badge | mechanical checks, then verifier | live/edge requires an inbound edge; live/contract requires a contract id from the closed list; leftover requires BOTH absences; ghost requires the referencing line to exist and the target to be absent from the file inventory |
| The quote cap | script, then verifier | script counts quoted lines per card (cap: 5); verifier judges quoting "in spirit" — paraphrase that reproduces structure counts |

## The evidence corpus

- `files.json` — every file in the territory, from a deterministic walk.
- `edges.json` — every import, link, and resolved route, with source
  line, parsed by script. Includes framework-contract consumption edges
  (e.g. `getCollection` calls resolving to the collections schema).
- The closed contract list — `reference/card-contract.md`. Liveness
  without an edge must name one of these and nothing else.

## The boundary, stated plainly

The evidence classes are: imports and links in code files, resolved
routes, and the closed contract list. **Outside them:** references
inside markdown content — frontmatter asset paths, prose links. A
defect in that blind spot occurred during this build (an image
referenced from frontmatter was absent from the territory); no
automated check caught it, a human reviewer did, from the map's own
file inventory. The cold-reader transcripts show the map answering
questions at this boundary by naming what it cannot tell the reader.

## Re-run it

1. Clone. The territory is pinned; the supply is sealed.
2. From `_rig/`: `node bin/run.mjs`. Stages run as fresh headless
   invocations, a schema gate before each, a verifier after; the run
   stops at the first defect with artifacts preserved.
3. To watch the verifier reject bad work: edit any card in
   `02_cards/output/cards/` to cite a line that does not exist, re-run,
   and read the failure — it names the card and the citation. (The
   build's own seeded-defect test and one live failure of
   fully-resolving citations are already in the journal.)
4. To check staleness detection: change any cited file in a working
   copy of the territory, re-run the verify stage, and the stale card
   is named. Because the stage is headless, this check can run on a
   schedule; freshness becomes a cron line, not a diligence.

## What is deliberately not claimed

Completeness. Every checked claim held at the pinned commit; claim
classes outside the evidence corpus are named above rather than
papered over. A verification story that cannot state its boundary is
advertising.
