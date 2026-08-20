# Rig build doctrine (L3) — v6.0

Non-negotiable. A violation is a build failure, not a preference.
Canonical over any restatement — in the paper, the runbook, a kickoff,
or a fitting. On any conflict, this file wins.

## Execution model

- Each fitting is its own headless invocation (`claude -p`). No shared
  session, ever. State passes between stages on disk only.
- Interactive sessions are for humans (design, review, kickoff builds).
  Production runs are headless.
- One run at a time per rig tree. The orchestrator takes a lockfile
  (`log/.lock`) at startup and refuses to start over a live one. Mock
  runs lock their sandbox, not the live tree.
- The orchestrator is `bin/run.mjs`, executed by the Node runtime that
  ships as a precondition of the harness itself. The deployment target
  is a stock Mac with Claude Code installed; that set includes Node and
  excludes nothing else. No other runtime is assumed.

## The orchestrator never thinks

Restated for the new substrate, with teeth. Node's power is spent on
correctness — native JSON, real hashing, run identity — never on
judgment.

- The five-step loop is fixed: feed-gate, workers, check_cmd, verifier,
  branch. Its behavior is identical to v5.4's loop for every stage that
  executes.
- The orchestrator branches on verdict files only — never on prose,
  never on exit codes. The verifier invocation's own exit status is
  deliberately ignored; the verdict file is the only channel.
- The verdict vocabulary is `pass` | `halt` | `fail`. Any other status,
  a missing verdict, or an unparseable verdict is a `halt`. Unknown
  states fail closed.
- No retries, no heuristic recovery, no fallbacks, anywhere. A failed
  filesystem operation, a failed hash, a failed parse: halt, name the
  path, stop. The orchestrator never repairs, reinterprets, or retries
  anything.
- Trust decisions (below) are hash comparisons — byte equality, nothing
  semantic. "Semantic comparison" is the orchestrator thinking, and is
  banned by name.
- Complexity budgets, binding: `bin/run.mjs` ≤ 600 lines of readable
  source excluding comments and blank lines; the trust/receipt subsystem
  ≤ 150 of them; rotation, sandbox, and identity together ≤ 120. A
  budget overrun is a design smell to be argued in BUILD-NOTES before it
  is code.

## Handoffs

- `output/feed.json` is the sole between-stage handoff.
- A feed-gate (`bin/feed-gate.mjs`) runs before every gated stage:
  mechanical, orchestrator-side, zero AI. It checks existence,
  non-emptiness, JSON parse, required keys present and non-null
  (`required_keys[]`), and referenced paths existing as files
  (`path_keys[]`). Interface and failure naming are identical to the
  v5.4 shell gate; parity is proven by the cutover acceptance suite,
  with the v5.4 `.sh` as oracle.
- A gate failure is a `halt`, never a `fail`, and is never auto-retried.
  The failing feed stays on disk untouched — it is diagnostic evidence.
- A stage handing off a directory of artifacts gates on a manifest file
  indexing it, never on the directory itself.

## Verification

- A verifier runs after every executed stage: separate invocation,
  read-only tool scope plus exactly one writable path, its verdict file.
- Verifiers judge, never fix.
- Verdict format: `{"status": "pass"|"halt"|"fail", "reason": "<one
  sentence>"}`. This shape is frozen contract surface.
- Deterministic checks (`check_cmd`) run orchestrator-side, never inside
  the worker invocation. Workers never self-grade, and every fitting's
  Work section states that prohibition explicitly.
- The orchestrator deletes any stale `verdict.json` before each verifier
  invocation. A verifier that dies without writing yields a missing
  verdict — a halt — never a ghost pass.

## Trust, receipts, and resume

Resume is a pre-execution decision per stage, not a change to the loop.

- **Receipts.** On every stage pass, the orchestrator appends a receipt
  to `log/receipts.jsonl`: run id, stage, provenance (skeleton version,
  orchestrator sha256, CLI version), the closure hash map, the output
  tree hash map, and the two rollup hashes. Receipts are orchestrator-
  authored; workers and verifiers never read or write them. `fail` and
  `halt` produce no receipt.
- **The ledger.** `log/receipts.jsonl` is append-only and never rotates
  — the one deliberate piece of cross-run state. Pass-receipts,
  displacement events, and fresh events interleave in order. Nothing is
  ever edited or deleted; supersession is by position.
- **The closure.** A stage's closure is every byte its processes were
  instructed to read, plus the contracts that instructed them: all
  fitting files in the stage — workers and the verifier — CONTEXT.md,
  requires.json, feed.schema.json, every declared `_config/` read, and
  the upstream feed as consumed. A rubric change invalidates a pass:
  either side of the worker/verifier pair changing breaks trust.
- **Stage-top validation.** The loop visits every stage in order. At
  stage-top, the orchestrator validates the stage's latest pass-receipt
  against the current world: provenance (skeleton major/minor mismatch
  invalidates; orchestrator hash and CLI version mismatches warn only),
  closure hashes, output tree hashes, and the chain link — the receipt's
  recorded upstream-feed hash against the upstream feed's current bytes.
  All green: the stage is SATISFIED and fully skipped, gate included
  (receipt validation is strictly stronger than the gate — the feed
  provably hasn't changed since it last passed both gate and verifier).
  Any check failing: the stage's outputs are displaced and the full
  five-step loop runs. First failure names its cause in the journal.
- **Monotone forward validation.** Every stage, at its turn, is either
  fully revalidated against the world as it now stands or fully
  re-executed. Execution may have gaps; validation never does. No stage
  ever builds on unvalidated upstream.
- **Trust requires positive evidence.** Absence, ambiguity, torn ledger
  lines, unparseable receipts: re-run. The machine may only err toward
  re-running.
- **Hashes only.** sha256 over raw bytes; rollups over canonical JSON of
  the sorted path→digest map (sorted keys, no whitespace, rig-root-
  relative POSIX paths). No timestamps participate in trust.
- **`--fresh`** forces a full run, archives everything, ignores receipts
  for the run, and stamps `{"event":"fresh","run_id":…}` into the
  ledger: deliberate history bypass is itself on the record.
- **There is no `--start-at`.** A manual start flag is an operator
  asserting trust the machine cannot verify. Where an override would be
  safe, closure hashing already grants it mechanically.
- **Resume is not retry.** Retry re-runs a failed stage hoping for a
  different outcome; it stays banned. Resume skips passed stages that
  are mechanically proven unchanged; the failed stage always re-runs.

## Rotation and archives

- Before any stage executes with a non-empty `output/`, the orchestrator
  displaces that output to `_archive/<run_id>/NN_stage/output/`, writes
  the archive manifest (producing run id, displacement cause), appends a
  displacement event to the ledger, and recreates an empty `output/`.
  A worker can never see prior-run strata in its own output; a verifier
  judges exactly one run's output, by construction.
- Displacement is minimal: a run that halts at stage N never touches
  stage N+1's outputs. They sit in place with their receipts; if the
  eventual fix reconnects the chain, they revalidate without moving.
- Archives are forensics-only. No trust decision ever reads `_archive/`.
  Retention is operator judgment, not skeleton duty.
- Unreceipted partials from failed runs are preserved by the same
  displacement path — evidence preservation holds across runs, not just
  within them.

## Mock isolation

- `--mock` builds a sandbox under `_mock/`, copies the contract surface
  only (stages minus outputs, `_config/`, `bin/`, run-input.md,
  VERSION), chdirs in, and executes the identical code path: same loop,
  same rotation, same receipts, its own ledger and logs. Run ids carry
  the `mock-` prefix.
- The live ledger is structurally unreachable from a sandbox. Mock
  receipts can never mint live trust.
- The orchestrator refuses any CLAUDE_BIN whose basename contains `mock`
  unless `--mock` is set. Aiming the mock harness at the live tree is a
  startup error, not an incident.

## Run identity

- Run id format: `YYYY-MM-DD_HHMMSS`, suffix-bumped on same-second
  collision; `mock-` prefixed in sandboxes.
- Every envelope line and every verdict history line carries `run_id`
  (additive fields; v5.x archive lines parse unchanged). Stream traces
  live under `log/stream/<run_id>/`. checks.log entries sit under
  per-check `=== <run_id> <stage> <cmd> ===` headers. The journal and
  the ledger carry ids natively.
- The verdict file a verifier writes is frozen contract surface and
  gains nothing.

## Declared reads and sealed supply

- Every `_config/` file a fitting reads is declared in that fitting's
  frontmatter `reads:`. An undeclared read is a contract violation —
  resume's soundness is conditional on this discipline, so it is law,
  not style.
- `_config/manifest.json` (path → sha256) is written only by
  `bin/seal-supply.mjs`, an explicit human act. The orchestrator
  verifies at startup and warns on: any `_config/` file whose hash
  differs from the seal, any sealed file missing, any unsealed file
  present, and — specifically — any changed `_config/` file that no
  stage's closure covers. Uncovered drift is the one hazard closure
  hashing cannot see; the manifest exists to make it visible.
- The orchestrator reads the seal; it never writes it. Sealing writes,
  verification reads, and the orchestrator must only read.

## Integration laws (cross-cutting)

Until the laws layer ships (deferred, BUILD-NOTES), these install by
hand in every fitting that authors the relevant artifact class, and the
fix-report discipline (RUNBOOK) enforces paired amendment.

- **Transcription, not derivation.** Machine-readable outputs are
  transcribed from their governing prose, never re-derived from adjacent
  sources.
- **Prose is transcribed byte-for-byte; containers may be reshaped.**
  An assembler moving copy between structures carries the copy verbatim.
  Rewording during integration is a defect, not an improvement.
- **Plans are ceilings.** Producing more than the plan declares is a
  defect even when the surplus is good. Surplus goes to a declared bank,
  never into the deliverable.
- **Every displayed string is copy with one author.** A gap in supplied
  copy is recorded as a gap; the gap-recorder never fills it. A gap
  closes only by upstream supply in a later run.
- **Commitments are terms.** What-statements are allowed; when-statements
  and promise-statements require sourced supply.
- **Tokens by reference, never by value.** Design values travel as token
  references; a raw literal where a token exists is a defect in every
  stage that authors the artifact, not just the last one.

## Filesystem and naming

- Executables live in `bin/`. No shell embedded in any `.md`. Markdown
  is agent-readable context, nothing else.
- `bin/fm.mjs` is a shared module consumed by executables — the one
  non-executable in `bin/`, listed in the MANIFEST so it is not
  contamination.
- `NN_name/` is a stage and runs in order. `_name/` is non-sequential
  and never runs (`_archive/`, `_mock/`, `_config/`, `_supply/`). `bin/`
  keeps its established name as the one exception.
- Layer references use `L0`–`L4` form and are never conflated with stage
  numbers.
- VERSION is the single version source: one line, transcribed by every
  version statement in code, provenance, and docs. A literal version
  string anywhere else is a defect (defect J).

## Substrate and portability

- Control flow is Node (`.mjs`, ES modules), gated by `node --check`,
  runnable from committed source. **No npm runtime dependencies, ever.**
  No package.json, no lockfile, no node_modules, no bundler. Committed
  source is the artifact; reproduction is `cp`.
- Node builtins only: `fs`, `path`, `crypto`, `child_process`, `os`,
  `process`, `url`. A capability outside builtins is a design problem,
  not a dependency to add.
- The strict frontmatter subset (scalar keys, flat string lists) is
  parsed by `bin/fm.mjs`, which rejects everything outside the subset.
  Nothing richer ever gets in; the frontmatter-shell bug class stays
  dead.
- `check_cmd` strings still execute via `/bin/bash -c` with stage-dir
  cwd. D2/D4/D5 remain fully binding for check_cmd content and all
  residual shell (`write-guard.sh`, `fetch.sh`). Complex checks become
  named `bin/` scripts, never frontmatter one-liners.
- Budgets are advisory at the CLI (D6). Hard stops are orchestrator-
  side: bounded stages, capped turns, no unbounded loops.
- Dry-runs happen on the deployment machine. A mock run elsewhere proves
  logic, not deployment.

## Containment

- Untrusted input never authors the canonical record. The fitting that
  touches the outside world is forbidden the feed; a separate fitting
  with no network access distills raw material into the feed.
- Mechanical retrieval goes through `bin/fetch.sh` or a named `bin/`
  script wherever verbatim evidence matters (D7). Model fetch tools are
  not evidence-grade.
- The verifier's single writable path is enforced by the write-guard
  hook (D1). The hook is canonical and not removable.

## Packaging

- A shipped rig carries `bin/` and `DEVIATIONS.md` (D3). Every copied
  skeleton carries the deviations log; project entries append below the
  rig entries and continue the numbering.
- Kickoff prompts are self-contained: strict supply list, nothing
  referenced outside it, missing supply halts the build.

## Scope discipline

- `DEVIATIONS.md` records machine-vs-spec divergences only. Design and
  build decisions go in `BUILD-NOTES.md`. Doctrine is the law. Three
  books; never crossed.
- Product doctrine (site rules, brand rules, client conventions) lives
  in the product's own workspace, never in the skeleton.

## Versioning

- A behavioral change to gates, verdict semantics, trust semantics,
  rotation, or orchestrator branching bumps the skeleton version.
  Everything else is a patch, noted in BUILD-NOTES.
- A published vertebra is frozen. The spine grows by appending versions;
  v5.4 remains at its path, untouched, forever.