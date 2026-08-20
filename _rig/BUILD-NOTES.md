# BUILD-NOTES — verified-rig-v6.0

Build and design decisions for this version. Machine-vs-spec divergences
live in `DEVIATIONS.md` and nowhere else; law lives in
`build-doctrine.md`. This file seeds the version: what was decided, why,
what was deliberately deferred, and what the first live runs must
confirm.

## Version

v6.0. Behavioral changes against v5.4 to trust semantics (new), rotation
(new), orchestrator substrate, and journal vocabulary — a version bump
by the doctrine's own rule. The verdict shape, feed semantics, fitting
format, frontmatter keys, and requires.json semantics are frozen
contract surface and did not change: a v5.4 project migrates by swapping
skeleton files only (RUNBOOK, migration section).

Design lineage: this version was designed in the rig Claude project
from one week of live production evidence on nofail-jidoka (twelve
verifier catches plus catches 13–14), the structural-defect list A–J,
and the v6 design-review kickoff. Deliverable-2 (resume semantics) and
deliverable-3 (rotation/isolation) design records are in the session
transcript; their operative content is doctrine now.

## Changes from v5.4

1. **Substrate.** Orchestrator, feed-gate, and mock harness moved from
   bash 3.2 to Node (`.mjs`, builtins only). Rationale: Node ships as a
   precondition of the harness itself, so "stock Mac + Claude Code"
   always included a modern runtime; the shell substrate produced the
   frontmatter-shell bug class (four incidents, one root cause) and
   blocked hashing-based staleness (v5.2's mechanism died on D5).
   D2/D4/D5 retire for control flow, remain binding for residual shell.
2. **Resume.** Station-level resume via receipts: hash-verified trust,
   stage-top validation, monotone forward validation, chain linkage,
   `--fresh`, no `--start-at`. Solves defect A (~25 redundant
   frontier-priced stage-runs in the evidence week).
3. **Rotation.** Just-in-time displacement to `_archive/<run_id>/`.
   Solves defects B (partially — see 4) and C; catch #6's failure class
   (verifier judging three runs' strata) is impossible from both ends.
4. **Mock sandbox.** `--mock` copies the contract surface to `_mock/`
   and runs the identical code path there. Solves defect B structurally;
   mock receipts cannot mint live trust; a mock CLAUDE_BIN without
   `--mock` is a startup error.
5. **Run identity.** Run ids stamped into envelopes and verdict-history
   lines (additive); per-run stream-trace directories; checks.log
   headers. Solves defect D; `log/` becomes append-only across runs.
6. **Sealed supply.** `bin/seal-supply.mjs` + startup verification with
   UNCOVERED naming. Solves defect E as designed (feed-gate pattern
   applied to `_config/`).
7. **Declared reads are law.** Frontmatter `reads:` is the closure's
   `_config/` source; an undeclared read is a contract violation.
8. **Version identity.** VERSION file as single source; provenance
   transcribes it. Solves defect J.
9. **Integration laws in doctrine.** Six cross-cutting laws distilled
   from catches 2, 3, 5, 8, 9, 12, 14, installed by hand pending the
   laws layer (deferred, below).
10. **Fix-loop discipline.** RUNBOOK fix-report format: quoted verdict,
    named cause, paired worker/verifier amendment with quoted operative
    language, flags, not-touched list. Solves defect G's report half;
    diagnosis-as-a-stage deferred.

## Positions on defects E–J (recorded verdicts)

- **E — supply integrity: built.** Seal + verify + UNCOVERED warning.
  Warn-not-block, deliberately: supply drift mid-iteration is routine
  design-shop reality, and the closure hashes already force re-runs
  where drift matters; blocking would punish the common case to prevent
  a hazard the warning makes visible.
- **F — rule propagation: deferred to v6.1 (laws layer).** Sketch as
  designed: `_laws/NN_name.md`, one law per file, mandatory mirror
  sections (Worker obligation / Verifier check); fittings declare
  `laws: [...]`; the orchestrator composes worker prompts from Worker
  sections and verifier prompts from Verifier sections of the same
  files; declared laws join the closure by the declared-reads rule.
  Deferred because it adds a frontmatter key and prompt-composition
  behavior — new contract surface — and v6.0's acceptance story is
  zero contract drift proven by skeleton-swap migration. Interim: laws
  live in doctrine and install by hand; the fix-report format enforces
  pairing.
- **G — fix-loop ergonomics: report format built; diagnosis stage
  deferred.** A diagnosis fitting that reads verdict + artifacts and
  *proposes* a paired amendment (never applies it) is legal under
  invariant 2; defer until the laws layer shrinks most amendments to
  one-law edits, then judge whether the stage still earns its cost.
- **H — symmetry: solved by F's design; enforced socially until v6.1.**
  The mirror-section mechanism makes asymmetric amendment structurally
  difficult; until then the fix report's paired-quote requirement is
  the guard.
- **I — re-pinning: methodology recorded, execution deferred to live
  envelope data.** Rule: a candidate model earns a pin by going clean
  on the regression corpus (below), then envelopes confirm cost.
  Mechanical fittings pin cheap models; evidence-adjudication and
  scoring fittings pin the frontier model explicitly so the choice is
  legible. No pins changed in v6.0 — carried stubs keep their
  frontmatter.
- **J — version drift: solved** (VERSION file; kickoff greps for stray
  literals).

## Deferred, in priority order

1. **Laws layer** (F/H) — v6.1; design above.
2. **Regression corpus** — `_regress/catch-NN/` fixtures replaying the
   fourteen catches against verifiers; the re-pinning gate and the
   skeleton-change gate. Deferred: the fixtures are project artifacts
   (nofail-jidoka feeds/verdicts) and need extraction after its v5.4
   run completes; the corpus runner is skeleton-tier and lands with it.
3. **Worker-exit FAIL/HALT split** — envelopes carry `terminal_reason`;
   the journal line still reports any worker non-zero exit as FAIL
   ("worker exited non-zero"), conflating budget kills with worker
   errors. Behavior-identical mandate kept it; one-line fix queued,
   doctrine-gap note in RIG-paper §9 stays honest until then.
4. **Budget hardening via stream** (D6 disposition) — kill the child at
   cumulative-spend threshold read from stream events; blocked on a
   live run proving the stream carries per-event spend.
5. **Diagnosis stage** (G) — after the laws layer.
6. **RIG-paper v1.3** — update for v6: resume, receipts, rotation,
   substrate argument; quote run.mjs where it quoted run.sh.

## Decisions taken during this build

Substrate and layout:

- **No bundler, no package.json.** Builtins suffice; committed source is
  the artifact; `node --check` is the gate; reproduction is `cp`.
  (Condition 3 satisfied without a build step to audit.)
- **feed-gate to Node** — drops jq from the orchestration path; jq
  remains a deployment precondition only where project check_cmd strings
  use it. Parity with the .sh oracle proven by the kickoff's
  side-by-side suite.
- **mock-claude to Node** — schema-driven stub fabrication is native
  JSON work. Fully generic: frontmatter-driven, no stage names.
- **bin/fm.mjs as a shared module** — one strict parser, two consumers;
  the one non-executable in `bin/`, listed in MANIFEST so it is not
  contamination. Grammar is normative in its header comment.
- **seal-supply.mjs as a separate tool** — sealing writes, verification
  reads, the orchestrator must only read.

Trust and rotation (operative content in doctrine; recorded here as
decisions with their reasoning):

- **Stage-top validation replaced the pre-run trust walk** (deliverable
  3 amendment). Eager pre-run archiving contradicted chain-linkage's
  promise that a byte-identical re-emitted feed keeps downstream trust.
  Just-in-time displacement keeps the common win: a prose-only fix at
  stage 02 that re-emits the same feed leaves 03/04 SATISFIED.
- **Verifier is in the closure** — a rubric change changes the standard
  of judgment; catches 5, 9, 10 are all rubric amendments.
- **Provenance: skeleton major/minor invalidates; orchestrator hash and
  CLI version warn only** — a skeleton version change can change what a
  recorded pass *means*; a same-version orchestrator or CLI change does
  not retroactively change judged bytes.
- **`run-input.md` is unconditionally in stage 01's closure** — a new
  brief must never be answered by stale trust; chain linkage propagates
  the invalidation downstream.
- **`closure_sha256` covers closure files only; the upstream feed is
  checked by the separate `chain` cause** — so the journal names the
  right thing.
- **Receipts ledger never rotates** — the one deliberate cross-run
  state; everything else in `log/` is append-only with run ids.
- **Archives keyed by the archiving run**, producing run in the
  manifest — lookup rule: "which run overwrote it? that run's archive
  has it." Forensics-only; deleting archives can never change behavior.
- **First stage declaring requirements with no upstream feed halts** —
  v5.3 left the case undefined; fail-closed defines it.
- **A stage with no `role: verify` fitting halts** — every stage is
  sandwiched or the run does not proceed past it.
- **`RUN` joins SATISFIED/DISPLACED** in journal vocabulary — an
  execution with nothing to displace prints RUN; printing DISPLACED
  would lie.
- **Fitting sequence** = CONTEXT.md `fittings:` list when present, else
  lexicographic `fittings/*.md`.
- **Dotfiles are invisible to hashing and sealing** (run.mjs walk and
  seal-supply walk, symmetrically) — Finder metadata (.DS_Store) must
  never break trust or spam drift warnings; the outputs hash is
  tamper-evidence, not a security boundary.
- **Worker ALLOWED_WRITE is the stage `output/` dir; verifier's is the
  verdict file** — same hook, two scopes, as v5.4 wired it.

Parser and gate:

- **fm.mjs: no opening `---` returns empty data, not an error** — the
  parser is policy-free; frontmatter-mandatory is the caller's call.
- **fm.mjs: zero type coercion** — every value is a string; "1.00" and
  "no" survive untouched. Consumers parse numbers where needed.
- **fm.mjs: trailing comments per the explicit YAML rule** — the paper's
  own example fitting carries one; carried stubs plausibly do too.
- **fm.mjs: unknown escapes, tabs, duplicate keys, nested anything are
  errors by file and line** — nothing undefined remains in the subset.
- **feed-gate: two fail-closed divergences from the jq oracle, accepted
  and fixtured** — `jq empty` tolerates an empty file and multi-document
  streams; `JSON.parse` rejects both. Both divergences reject garbage.
  The parity suite documents them as expected divergences rather than
  porting jq's quirks into Node for bug-compatibility.
- **feed-gate: two message strings are transcribed verbatim from the
  production gate** (required-key missing/null, quoted in RIG-paper §5);
  all other wordings are drafts the kickoff aligns against the .sh
  oracle's actual output.

Mock:

- **Unknown MOCK_SCENARIO dies, never defaults to good** — a typo'd
  scenario silently running `good` would fake a green acceptance.
- **bad_feed scopes to the feed-writing fitting**; the mock never
  manufactures side files to satisfy downstream path_keys — a schema
  whose value must be an existing file carries it in default/examples,
  or the gate halts, which is the gate working.
- **mock-claude answers `--version` by transcribing VERSION** — sane
  provenance in mock receipts.

Documentation boundary:

- **Command examples in RUNBOOK/kickoffs are operator documentation**,
  not executable payloads in agent-read contracts; the no-shell-in-md
  law targets the latter. (v5.4 precedent kept.)
- **CLAUDE.md amended by located-and-shown replacement, not
  reproduction** — this session never saw its full text and will not
  paraphrase what it cannot transcribe (catch #14 applied to this build).
- **Migration = `bin/` + VERSION.** Condition 4 said "swapping bin/
  only"; VERSION is skeleton identity and travels with skeleton code —
  run.mjs refuses to run without it, deliberately. Zero project-authored
  files change; RUNBOOK proves the honest reading.

## Known gaps, carried honestly

- **Envelope field-name parity is unverified from the session.** Key
  names in run.mjs's envelope writer are reconstruction; the kickoff
  diffs against v5.4's run.sh (in supply) and aligns names so archives
  stay comparable. Same for the exact journal line spellings beyond the
  documented vocabulary.
- **Worker prompt is transcribed from the paper; verifier prompt is new
  symmetric text** — v5.4's exact verifier wording was not in this
  session's supply. mock-claude parses the composed wording; the two
  files version together.
- **D1 hook and D6 flag behavior are not exercisable by mock runs** —
  first live v6.0 run re-verifies both (noted in their dispositions).
- **MOCK_SCENARIO/MOCK_STAGE variable spellings** are this build's
  choice; scenario *values* are the committed surface. Kickoff aligns
  spellings against the retired v5.4 mock if they differ.
- **The mock cannot prove hook enforcement, budget behavior, or model
  routing** — mock success is logic validation, not live validation.
  First live run is a shakedown on a target the human can grade.
- **Closure hashing covers the fitting file and declared reads but not the bin/ scripts a fitting invokes. Observed: scan.sh changed (astro:content edges added), 01_inventory's closure stayed 5498ed, receipt SATISFIED, stale edge list certified fresh. A fitting's closure must include every executable it names. Until fixed: any bin/ change requires manually forcing the stages that invoke the script.
## Runtime files added by this version (MANIFEST addendum)

`log/fixes.md` — human-authored fix reports per the RUNBOOK format;
append-only. The kickoff adds it to MANIFEST's runtime table.

## Acceptance-suite findings (cutover, v6.0 build)

Two suite assertions did not hold as written. Both were reviewed and the
observed behavior accepted as correct; the assertions, not the code, were
mistaken about this skeleton.

- **Torn-receipt recovery re-runs only when no valid receipt survives**
  (kickoff 5i). Tearing the ledger's final receipt line produced the
  WARN and a COMPLETE run, but the affected stage did not re-run: an
  earlier, positionally-superseded receipt for that stage still validated
  byte-for-byte against the world, so the stage was SATISFIED and no
  fresh receipt was minted. This is trust from positive evidence, not
  from absence — doctrine's rule holds. The assertion assumed the torn
  line was the stage's only receipt; when it is, the intended path runs
  exactly as specified (WARN, DISPLACED with cause `no-receipt`, re-run,
  superseding receipt appended). Demonstrated both ways.
- **`bad_feed` at stage 01 halts at 01's own check_cmd, not at 02's
  gate** (kickoff 5j). The stage's deterministic check
  (`jq -e '.topic | strings | length > 0'`) reads the feed before the
  handoff, so a malformed feed never survives to the downstream gate.
  The run stops FAIL at 01 and the malformed feed is left on disk
  untouched, as required. This is earlier and equally fail-closed; the
  gate-HALT path is exercised instead by the missing-required-key case.
  A skeleton whose feed-writing fitting declares no check_cmd would
  reach the gate; this one does not.

---

# jidoka-cartographer — project build notes

Configured from verified-rig-v6.0 per `NEW-PROJECT-KICKOFF.md`. Everything
below is a build or design decision for this project. Machine-vs-spec
divergences are in `DEVIATIONS.md` (project entries start at D8); doctrine
is `build-doctrine.md`. Three books, never crossed.

## Stage shape and why each stage has three fittings

The kickoff names three stages. Each ended up with two work fittings and a
verifier, for one reason repeated three times: **the fitting that runs the
mechanical thing is never the fitting that authors the feed.**

- `01_inventory` — `01_scan` invokes `bin/scan.sh` and reports;
  `02_adjudicate` reads the scan output and writes the feed.
- `02_cards` — `01_write` writes every card, the catalog, and
  `card-index.json`; `02_manifest` reads only what `01_write` produced and
  writes the feed.
- `03_verify` — `01_cite_check` invokes `bin/cite-check.sh` and reports;
  `02_inventory` transcribes the report's totals into the feed.

This is the D7 pattern (invoke the script, inventory what it wrote) and the
containment rule (the fitting holding the heavy material is forbidden the
feed) applied to a rig with no network. It also keeps each feed author's
context small enough that transcription is plausibly transcription.

## `path_keys` and what is gated where

Recorded as D8. Short form: `path_keys` names the file the *next* stage
opens, not every file path the feed carries.

- `02_cards/requires.json` — `path_keys: ["edge_list"]`. `02_cards` derives
  Hits and Does-not-hit from `edges.json`; it never opens `files.json`.
- `03_verify/requires.json` — `path_keys: ["card_index", "edge_list"]`. The
  card set hands off by its manifest, never by its directory (doctrine).
  `cards_dir` is carried as a plain key precisely because a directory is not
  a gate target.
- `catalog_path` is a plain key: nothing downstream gates on the catalog,
  and the 02_cards verifier judges it directly.

## Two project-tier scripts (pre-authorized by the human)

Both are new files. No existing `bin/` file and no part of the orchestrator
was modified. Both are `bash -n` clean and bash 3.2 clean (D2/D4/D5), and
both set `noglob`: the territory contains `src/pages/work/[...slug].astro`
and `src/pages/writing/[...slug].astro`, whose brackets would otherwise be
glob patterns.

**`bin/scan.sh <territory_path> <out_dir>`**
- Writes `files.json` (path + line count per file) and `edges.json`
  (`from`, `to`, `line`, plus `spec` and `resolved`).
- `spec` and `resolved` are additions to the shape the kickoff sketched.
  They exist because ghost adjudication needs both halves of the evidence:
  `resolved: false` marks the ghost, and `spec` preserves the raw specifier
  as written, which is what the card must quote.
- **Astro route resolution.** A site-root reference (`/`, `/contact/`,
  `/rss.xml`) resolves first against `public/`, then as a route against
  `src/pages/`. Without this every internal link in the site would land in
  `edges.json` as unresolved, and the adjudication fitting would be handed a
  pile of fake ghosts. Ghost status has to be evidence, not a parser
  artefact. On the staged snapshot this took unresolved edges from 7 to 0.
- **Bare package specifiers are not emitted.** `import { defineConfig } from
  'astro'` resolves into `node_modules/`, which is a scan exclusion. It is
  neither an edge in this territory nor a ghost, so it is not an edge at
  all.
- Extensions parsed: `.astro`, `.js`, `.ts`, `.mjs`, `.css`, exactly as the
  kickoff names. The staged snapshot contains no other source extension.
- Both scripts refuse to run against an unpinned target: they read the
  pinned commit from `_config/territory.md` and `territory_commit` from
  `run-input.md`, require both to be hashes, and require them to agree.

**`bin/cite-check.sh <cards_dir> <territory_path> <out_file>`**
- Resolves every `path:line@commit` citation: commit matches the pin, path
  exists in the territory, line exists in that file. Per citation
  `{card, citation, resolved, reason}`; per card `{card, quoted_lines,
  over_cap}`; plus a `totals` object the feed transcribes.
- The signature the kickoff fixed has no commit or cap argument, so the
  script resolves the rig root from its own path and reads both from the
  run's own trigger. This has a side benefit: the pin check is inside the
  mechanical layer, where it cannot be talked around.
- **Quoted lines are counted as fenced-block bodies plus blockquote lines.**
  That is what a machine can count. Inline verbatim reproduction is not
  line-shaped, so it is left to the `03_verify` rubric — which is why the
  kickoff says the cap is enforced twice.
- The script never judges whether a cited line SUPPORTS its claim. That
  judgment is rubric item 1 of `03_verify/fittings/03_verify.md` and is the
  product of the whole rig.

No further `bin/` need was discovered during the build. Nothing was made
that was not pre-authorized.

## Model pins

`02_cards/01_write`, `02_cards/03_verify`, and `03_verify/03_verify` are
pinned to the frontier model: card writing and evidence adjudication are the
judgment core. Everything else is pinned mid-tier — status adjudication over
a mechanical scan, and two transcription fittings. The pins are legible in
frontmatter so the human can swap them for whatever the CLI offers; the
pin's presence is the point.

## Budgets

Advisory (D6), and set generously because no comparable envelope data exists
for this pipeline. Caps: 0.60 / 2.00 / 1.00 at stage 01, 6.00 / 1.00 / 4.00
at stage 02, 0.60 / 0.75 / 6.00 at stage 03. **Record the actuals from the
first live run here**, from `log/envelopes.jsonl`, and tighten.

## Acceptance evidence (mock, 2026-08-19)

`node bin/run.mjs --mock` — all three stages PASS, 41 `check_cmd`
expressions executed and green. Reproductions below; each was run and
observed, and each throwaway sandbox was deleted afterward.

- **Malformed feed → gate halts at the right stage.** The skeleton's own
  build notes record that `bad_feed` at stage 01 normally stops at that
  stage's `check_cmd` before the gate ever sees it, and this project is the
  same: every feed-writing fitting reads its own feed with `jq`. To exercise
  the gate itself, the check_cmd block was stripped from
  `02_adjudicate.md` **inside a sandbox** and the scenario re-run:

      node bin/run.mjs --mock --mock-into _mock/neg-badfeed
      # strip the check_cmd: block from
      #   _mock/neg-badfeed/01_inventory/fittings/02_adjudicate.md
      MOCK_SCENARIO=bad_feed MOCK_STAGE=01_inventory \
        node bin/run.mjs --mock --mock-into _mock/neg-badfeed

  Observed: `02_cards HALT — feed-gate: feed is not valid JSON:
  01_inventory/output/feed.json`, followed by the "malformed feed left on
  disk untouched" line. Both defenses are real and the gate does not depend
  on the producer's checks.
- **Missing required key → gate halts.** Same sandbox technique, plus
  `nouns` removed from the sandbox's `01_inventory/feed.schema.json` so the
  mock writes a feed without it. Observed: `02_cards HALT — feed-gate:
  required key missing: 'nouns' in 01_inventory/output/feed.json`.
- **Path key that does not resolve → gate halts.** `edge_list`'s schema
  default repointed at a file no fitting writes. Observed: `02_cards HALT —
  feed-gate: path key 'edge_list' does not resolve to a file:
  '01_inventory/output/raw/gone-edges.json'`.
- **Verdict `fail` → run stops.** `MOCK_SCENARIO=verdict_fail
  MOCK_STAGE=03_verify` → `03_verify FAIL`, run FAIL, exit 1.
- **Verdict `halt` → run stops.** `MOCK_SCENARIO=verdict_halt
  MOCK_STAGE=02_cards` → `02_cards HALT`, run HALT, exit 1.
- **Missing verdict → halt, never a ghost pass.**
  `MOCK_SCENARIO=verdict_missing MOCK_STAGE=03_verify` → `03_verify HALT —
  fitting 03_verify: verdict file missing`.
- **Resume.** The same sandbox run twice printed `SATISFIED` for all three
  stages on the second pass, with `chain ok` at 02 and 03.

## The seeded-defect test

A verifier only proven on good work is unproven. Two cards were planted in a
sandbox — one sound, one carrying a citation to
`src/layouts/Base.astro:99999`, a line that does not exist in a 37-line file
— the sandbox pin was set to a real-shaped hash, and `bin/cite-check.sh` was
run against the real snapshot. The report marked exactly one citation
unresolved, and the `01_cite_check` `check_cmd`, run the way `run.mjs` runs
it (`/bin/bash -c`, cwd at the stage directory), failed and named the card:

    UNRESOLVED CITATION -- card nav.md: src/layouts/Base.astro:99999@7c4d9e2:
    line 99999 is beyond the end of 'src/layouts/Base.astro' (37 lines)

The check_cmd expressions in `01_cite_check` are written to emit the
offending card before returning `false`, so the naming reaches
`log/checks.log` mechanically rather than depending on a model to report it.
The same shape guards the quote cap.

What this does NOT prove: the `03_verify` **verifier's** judgment half —
whether a citation that resolves actually supports the sentence attached to
it. The mock verifier passes unconditionally, so rubric item 1's sampling,
item 2's graph match, and item 3's inline-quoting judgment are unexercised.
That is the first live run's business.

## Territory shakedown numbers (for comparison after the first live run)

`bin/scan.sh` against the staged snapshot: **40 files, 33 edges, 0
unresolved**. Highest inbound degree by a wide margin is
`src/layouts/Base.astro` at 11 — the layout spine, and the card the map
should be strongest on. `src/content.config.ts` and everything under
`src/content/` carry zero inbound edges, because Astro loads a content
config by convention rather than by import: that is the exact adjudication
trap `02_adjudicate.md` names, and the first live run is the test of whether
the fitting handles it by citing the convention or by honestly calling it
`leftover`. No ghosts exist in this snapshot; `noun-guidance.md` says record
the zero and move on, and the feed has `ghosts_found` and `leftovers_found`
for exactly that.
