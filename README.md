# bramwell-cartographer

A cartographer folder, and the map it produced — of a real, deployed
Astro site — where every claim on every card was checked by a machine
that did not write the cards.

The territory ships in this repo at a pinned commit. The pipeline that
built and verified the map ships too. Clone it and you can re-run the
verification yourself: every citation resolved and read for support,
every "hits" line checked against an extracted dependency graph, every
"does not hit" checked as a genuine absence. You do not have to trust
this map. You can check it. That is the difference this entry exists to
demonstrate.

## The map

```
map/
├── catalog.md      the front door. Load this, then ONE card, then stop.
└── cards/          ten cards, one per noun. Never loaded wholesale.
```

The territory is the source of [no.fail](https://no.fail) — an Astro
site on Cloudflare Pages: layouts, components, content collections, a
contact function. Real, deployed, and the thing its next developer will
change. The later reader is usually a model: it arrives cold, with a
context budget, and this map exists so it can answer one question
without reading forty files. Transcripts of exactly that, on two models,
are in `receipts/`.

**The walk:** read `map/catalog.md`. Find your noun's door. Open that
one card. Read its Hits and Does-not-hit. Stop. If the catalog cannot
route your question in one pass, that is a defect in the catalog —
report it, do not start opening files at random.

## What "verified" means here — and who checks the checker

Every entry in this field's genre says some version of "the cards cite
their sources." The open question is always the same: who checked, and
can you re-run the check? Here, concretely:

1. **The evidence is extracted, not recalled.** A deterministic script
   (`_rig/bin/scan.sh`) parses the territory's imports, links, and
   routes into `edges.json` — a file, not a model's impression. Liveness
   has two evidence classes: an inbound edge, or membership in a closed
   list of framework contracts (file-based routing, collection
   consumption, toolchain manifests). A card claims nothing the evidence
   corpus cannot support.
2. **The citations are checked twice.** A script resolves every
   `path:line@commit` citation against the pinned territory. Then a
   separate verifier — its own process, read-only, no memory of writing
   the cards — opens the cited lines and judges whether each one
   actually supports the sentence attached to it.
3. **The checker demonstrably rejects bad work.** During the build, a
   card was hand-planted with a citation to a nonexistent line; the
   pipeline failed it by name. And once, live, the verifier failed a map
   whose every citation resolved — see below.

## The verifier catching what resolution cannot

The strongest evidence in this repo is a failure. Run
`2026-08-19_221513`, verbatim from `_rig/log/run-report.md`:

> 03_verify FAIL — All 150 citations resolve, every Hits line matches an
> edge in edges.json and every Does-not-hit absence holds, and no card
> is over the quote cap in letter or spirit, **but** content-config.md
> attaches src/content.config.ts:19 to the claim that the work
> collection declares a shipped/in-progress status and an explicit order
> when line 19 is the optional slug field (status is line 20, order line
> 21) […]

Two citations that *resolved* — real file, real line — but pointed one
and two lines away from the content they claimed. A broken citation
announces itself; this class misleads instead, and no mechanical check
catches it. The verifier, reading every citation in the pinned
territory, did. One instruction was strengthened in the card writer's
fitting (read the line, then write the citation — never reconstruct a
number from memory of an earlier read), no card was hand-edited, only
the affected stages re-ran, and the next run passed:

> 03_verify PASS — All 130 citations resolve and every one I opened in
> the pinned territory supports the sentence it is attached to […]

The full journal — including that failure, its fix, and the receipts
showing untouched stages were not re-paid — is in `_rig/log/`.

## What actually happened here

This repo is the record of one evening's build, kept honestly. Five
things went wrong; the system caught four of them, and the fifth is
disclosed. In order:

1. **A citation parser truncated bracket filenames** (`[...slug].astro`
   became `.astro`), and two truncated citations collapsed into one
   under dedup — so the check failed closed but pointed at the wrong
   cause. Fixed in the scanner; the near-miss is why the count is
   audited, not just the failures.
2. **The map called a live file dead.** `content.config.ts` had zero
   inbound edges — Astro loads it by convention, not import — and the
   adjudicator, refusing to assert without evidence, badged it
   leftover. The fix went to the evidence layer (contract-based
   liveness, `reference/card-contract.md`), not to the rule. The wrong
   verdict is preserved in `_rig/_archive/`.
3. **Two citations resolved but misled** — the failure quoted above.
   Every mechanical check passed; the verifier failed the map. One
   instruction changed; no card was hand-edited; the re-run shows
   untouched stages were not re-paid.
   the re-run shows untouched stages were not re-paid.
4. **A cold reader invented an enum.** Asked the schema question, the
   small model fused a real token from the adjacent collection with a
   plausible partner into values that do not exist. The transcript
   ships as produced; the card's citation is what makes the invention
   checkable in seconds (`receipts/NOTE.md`).
5. **One real defect escaped everything:** an image referenced from
   markdown frontmatter — outside every evidence class — was missing
   from the territory. A human caught it from the map's own file
   inventory. That boundary is now stated wherever this map makes a
   claim.

A map is trustworthy in proportion to what its process catches and what
its process admits. This is the full list.

## Try the walk yourself

`receipts/` holds unedited transcripts of cold sessions — no memory, no
project context, physically able to read only the catalog and cards —
answering a new developer's questions. Both a frontier and a small
model walked the same map — one card per question, transcripts
unedited. The frontier model reported the cards' boundaries (what a
card doesn't hold). The small model overstated once, reconstructing
enum values the card does not contain — and the card's citation to the
schema's exact lines is what makes that overstatement checkable in
seconds. That is the argument of this repo in one transcript: confident
answers are cheap; citable ones are catchable.

One transcript to look at first: asked about a broken image the map
cannot see (the territory references it from markdown frontmatter, which
is outside the scanner's evidence classes), both models said what the
map cannot tell them instead of inventing an answer.

## What this will NOT do

- **Claim completeness.** Verification is bounded by its evidence
  classes: imports, links, routes, and the closed contract list.
  References inside markdown content (frontmatter asset paths, prose
  links) are outside them, and the map says so rather than guessing.
  During the build, exactly one real defect lived in that blind spot —
  a human reviewer caught it from the map's own file list. A
  verification story that cannot name its boundary is not one.
- **Judge the territory.** No card says a file is too big, badly
  designed, or in need of refactoring. Cards say what is and what moves.
- **Diagnose failures.** The territory works. This maps what is in
  force, not why something broke.
- **Replace the source.** Cards cite; they never copy (cap: five quoted
  lines per card, enforced mechanically and in judgment). Delete the
  territory and the map is worthless — that is the correct relationship.
- **Fit every job.** This machinery pays for itself when a map will be
  acted on, re-verified, or maintained. For one-time orientation on a
  small folder, an interactive session is cheaper and fine.

## Staleness, honestly

Every citation carries the territory's commit hash. This map does not
watch the territory; it does something better than watching — it makes
staleness *checkable*: re-run the verify stage against a changed
territory and it does not silently pass or vaguely warn, it fails naming
the stale card and the line. The journal in `_rig/log/` shows exactly
this shape live: the territory drifted one commit, two citations pointed
at lines that had moved, and the run failed naming both. And because the
check is a headless pipeline stage, not a person's diligence, keeping a
map fresh is a scheduling decision: cron the verify stage nightly and
staleness has a maximum age instead of an unknown one. A map that cannot
tell you whether it has gone stale is a rumor with formatting.

## The files

| Path | Job |
| --- | --- |
| `identity.md` | Who the cartographer is, who the later reader is, what territory it walks |
| `rules.md` | How it maps: evidence before badges, the two liveness classes, Hits/Does-not-hit, cite-never-copy, the refusals |
| `examples.md` | The worked map, walked: three cards read the way a stranger would read them |
| `reference/` | The card contract, the closed contract list, this territory's naming collisions, and the verification method in full |
| `map/` | The product: catalog + ten cards, every claim verified at commit `16a4fc437b66fe860bb4247692070b6167cfc274` |
| `_territory/` | The mapped territory, pinned — check any citation yourself |
| `_rig/` | The pipeline that built and verified the map: three stages, deterministic scanners, separated verifiers, full run journal in `_rig/log/` |
| `receipts/` | Cold-reader transcripts, two models, unedited |
| `SUBMISSION.md` | The competition entry blurb |

## Reproduce it

The map was not written and then decorated with checks; it is the output
of a pipeline, and the pipeline is here. `_rig/RUNBOOK.md` covers
operation. The short version: the territory is pinned, the supply is
sealed and hashed, each stage is a fresh headless invocation with state
on disk only, a schema gate runs before every stage and a verifier after,
and the run stops at the first defect with artifacts preserved. To see
the verifier earn its keep, plant a citation to a line that does not
exist in any card and re-run the verify stage — it fails, naming the
card.

Built for ICM Weekly Comp #11 (The Cartographer). The folder follows the
five-file spec; the pipeline that built the map is disclosed above and
included in full. Territory, machinery, and map are all in this repo on
purpose: the entry's one claim is that you should not have to take a
map's word for anything, including this one.
