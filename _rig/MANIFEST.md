# MANIFEST — verified-rig-v6.0

Every file in the shipped skeleton, the runtime files the system creates,
and the assembly instruments that build it. Anything present in a shipped
skeleton that this manifest does not list is contamination; the cutover
kickoff asserts exactly that at the end of assembly.

Status legend:
  [new]                  did not exist in v5.4
  [carried]              copied verbatim from v5.4 supply
  [carried-and-amended]  copied from v5.4, then amended per instructions
                         in the cutover kickoff

Source legend:
  session   produced complete in the design session, staged as supply
  supply    copied from the frozen v5.4 skeleton
  kickoff   created by the cutover kickoff during assembly
  runtime   created by the running system; never shipped

---

## Session production order

 1. MANIFEST.md            (this file)
 2. build-doctrine.md
 3. DEVIATIONS.md
 4. bin/run.mjs
 5. bin/fm.mjs
 6. bin/feed-gate.mjs
 7. bin/mock-claude.mjs
 8. bin/seal-supply.mjs
 9. RUNBOOK.md
10. BUILD-NOTES.md
11. V6-CUTOVER-KICKOFF.md

Three artifacts were not in the agreed eight-item list: `bin/fm.mjs` (the
strict frontmatter parser gets exactly one implementation; run.mjs and
mock-claude.mjs both consume it), `bin/seal-supply.mjs` (the supply
manifest is law per amendment 3; sealing is a human act and gets its own
tool), and the feed-gate/mock item resolves to its two actual files.

---

## Root

| Path | Status | Source | Purpose |
|---|---|---|---|
| CLAUDE.md | carried-and-amended | supply | L0 identity: what this rig is, how to run it. Amended: invocation lines updated to `node bin/run.mjs`; stale v5.x version strings replaced with a VERSION transcription (catch #10, defect J) |
| VERSION | new | kickoff | Single version source. Contains exactly `v6.0`, one line. Every version statement in code or provenance transcribes this file verbatim — catch #2's transcription law applied to the skeleton itself |
| MANIFEST.md | new | session | This file: packing list and contamination check |
| build-doctrine.md | carried-and-amended | session | The law, restated for the Node substrate: invariants, resume and receipts, rotation, declared reads, integration laws, complexity budgets, no-dependency rule |
| DEVIATIONS.md | carried-and-amended | session | D1–D7 re-dispositioned: D2/D4/D5 retired for control flow (retired, never deleted — still binding for check_cmd and residual shell); D1/D6/D7 carried with re-verification notes |
| BUILD-NOTES.md | new | session | Seeds v6.0: every decision made in this build, the E–J positions, the deferred list |
| RUNBOOK.md | carried-and-amended | session | Operations: resume defaults, `--fresh`, reading SATISFIED/DISPLACED lines, archive layout, sealing supply, the fix-report format, migration steps proving bin/-swap-only |
| NEW-PROJECT-KICKOFF.md | carried-and-amended | supply | Builder template for new projects. Amended by exact old/new strings (source text is on hand): mock invocation `CLAUDE_BIN=bin/mock-claude bin/run.sh` → `node bin/run.mjs --mock`, plus VERSION reference |
| run-input.md | carried | supply | The run trigger stub |

`_config/` ships empty. `log/` ships empty. Both created by the kickoff
(empty directories do not survive copy tools).

---

## Stage stubs

Two example stages carried from v5.4. The layout is normative; the stub
fitting bodies are not. Fitting filenames inside `fittings/` carry from
supply verbatim — the kickoff copies what exists rather than renaming.

| Path | Status | Source | Purpose |
|---|---|---|---|
| 01_research/CONTEXT.md | carried | supply | L2 stage contract; frontmatter declares the fitting sequence |
| 01_research/fittings/* | carried | supply | Worker fitting(s) plus verifier fitting, worker+verifier shape normative |
| 01_research/feed.schema.json | carried | supply | Producer-side: what a valid feed from this stage looks like |
| 01_research/requires.json | carried | supply | Consumer-side: what must be true before this stage may run |
| 01_research/output/ | — | kickoff | Created empty |
| 02_summarize/* | carried | supply | Same shape as 01_research throughout |

---

## bin/

| Path | Status | Source | Purpose |
|---|---|---|---|
| bin/run.mjs | new | session | The orchestrator. Five-step loop behavior-identical to v5.4; stage-top trust validation, receipts ledger, displacement rotation, run ids, lockfile, `--mock` sandbox, supply-manifest verification. ≤600 readable lines excluding comments |
| bin/fm.mjs | new | session | Strict flat-subset frontmatter parser (scalar keys, flat string lists; rejects everything outside the subset). Module, not executable — the one exception to "everything in bin/ executes," listed here so it is not contamination |
| bin/feed-gate.mjs | new | session | Mechanical pre-stage gate. Interface and checks identical to feed-gate.sh: feed path + requires path in, silent success, named failure on stderr, nonzero exit |
| bin/mock-claude.mjs | new | session | Mock harness, CLAUDE_BIN stand-in. Frontmatter-driven, builds schema-conformant stubs from each stage's own feed.schema.json; scenario env surface unchanged (good, bad_feed, verdict_fail, verdict_halt, verdict_missing) |
| bin/seal-supply.mjs | new | session | Writes `_config/manifest.json` (path → sha256). Sealing is an explicit human act; run.mjs verifies and warns, never seals |
| bin/write-guard.sh | carried | supply | PreToolUse hook enforcing the verifier's single writable path (D1). CLI-invoked, canonical, untouched |
| bin/fetch.sh | carried | supply | Evidence-grade mechanical fetcher (D7): curl, raw bytes, status line, redirect chain. Untouched |

Retired from bin/, deliberately not carried: `run.sh`, `feed-gate.sh`,
`mock-claude`. v5.4 stays frozen at its own path per the published-
vertebra rule; v6.0 does not ship dead code beside its replacements.

---

## Runtime-created — never shipped

| Path | Created by | Purpose |
|---|---|---|
| log/run-report.md | run.mjs | The journal. v5.4 format unchanged; SATISFIED / DISPLACED lines added to the vocabulary |
| log/envelopes.jsonl | run.mjs | Per-invocation record. Gains `run_id` (additive; v5.x archive lines parse unchanged) |
| log/verdicts.jsonl | run.mjs | Verdict history line gains `run_id` (additive). The verdict file a verifier writes is frozen contract surface and does not change |
| log/receipts.jsonl | run.mjs | The trust ledger: pass-receipts, displacement events, fresh events. Append-only, never rotates — the one deliberate cross-run state |
| log/checks.log | run.mjs | check_cmd output, raw, under per-check `=== <run_id> <stage> <cmd> ===` header lines |
| log/stream/<run_id>/ | run.mjs | Stream traces in per-run directories — ends the overwrite class that made the F7 traces unrecoverable |
| log/.lock | run.mjs | Single-run lockfile; mock runs lock their sandbox, not the live tree |
| log/fixes.md | human | Fix reports per the RUNBOOK format; append-only |
| _archive/<run_id>/ | run.mjs | Displaced outputs keyed by the archiving run; per-archive manifest.json records producing run and displacement cause. Forensics only — no trust decision reads it; delete-anytime |
| _mock/mock-<ts>/ | run.mjs | Mock sandboxes: contract surface copied in, own ledger, own logs. Live trust is structurally unreachable from here; delete-anytime |
| _config/manifest.json | seal-supply.mjs | Sealed supply hashes, per project. The skeleton ships no manifest because its _config/ is empty |

---

## Assembly instruments — beside the skeleton, never inside it

| Path | Status | Purpose |
|---|---|---|
| V6-CUTOVER-KICKOFF.md | new | The builder prompt Claude Code executes on the Mac: strict supply list (the session artifacts above + the frozen v5.4 skeleton), staging order, amendment instructions for carried-and-amended supply files, acceptance tests (node --check, full mock PASS, the v5.4 negative tests, resume-specific tests), and the stop-at-report rule |

---

## Flags — contestable calls made in this file

1. feed-gate moves to Node: drops jq from the orchestration path and puts
   every control-flow file under one syntax gate. jq remains a deployment
   precondition only where project check_cmd strings use it.
2. mock-claude moves to Node: schema-driven stub fabrication is native
   JSON work, which is precisely what shell was worst at.
3. bin/fm.mjs exists as a shared module: one parser implementation beats
   two drifting copies of a parser whose strictness is the point.
4. seal-supply.mjs is a separate tool, not a run.mjs subcommand: sealing
   writes, verification reads, and the orchestrator must only read.
5. The laws layer (the F/H mechanism) is deferred to v6.1 and no _laws/
   ships: it adds a frontmatter key, and v6.0's acceptance story is zero
   contract drift proven by bin/-swap migration. Interim: integration
   laws (catch #14 included) live in build-doctrine and install by hand;
   the fix-report format makes paired amendment mandatory. Full design
   recorded in BUILD-NOTES.
6. CLAUDE.md is amended by pattern (stale `v5.x` strings located, shown,
   and replaced by the builder, each replacement reported) rather than
   reproduced here: the session has never seen its full v5.4 text and
   will not paraphrase a file it cannot transcribe — catch #14's law
   applied to this build itself. NEW-PROJECT-KICKOFF.md, whose source is
   on hand, is amended by exact old/new strings.