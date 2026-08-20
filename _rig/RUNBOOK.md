# RUNBOOK — creating and running a rig project (v6.0)

How to go from the skeleton to a running project. The skeleton is the
blueprint, a project is the factory, a run is the product. This document
covers building the factory, running it, reading what it says, and
migrating a project from v5.4.

---

## The three tiers

| Tier | What it is | Changes |
|------|-----------|---------|
| **Skeleton** | verified-rig vX.Y — `bin/`, doctrine, DEVIATIONS, conventions, VERSION | Rarely; every behavioral change bumps a version |
| **Project** | A copy of the skeleton configured for one use case — stages, fittings, `requires.json`, `_config/` | Once per client or use case |
| **Run** | One execution — feeds, verdicts, receipts, logs, the deliverable | Every execution |

**Boundary test — what you edit tells you which tier you're in.**
Editing fittings, `requires.json`, `_config/`, or stage names is project
work. Editing anything in `bin/` is a skeleton change leaking through:
stop, decide whether it is a real version bump, and make the change in
the skeleton — never patch `bin/` inside a project copy. A patched copy
silently forks from the blueprint and the next copy does not get the
fix.

---

## Step 0 — copy the right thing

Two starting points, one decision:

- **New domain** (first audit pipeline, first assessment pipeline):
  copy the **skeleton**, follow all six steps below.
- **Solved domain** (second client audit, same pipeline different
  client): copy the **previous project**, swap `_config/` and
  `run-input.md`, reseal (step 5), skip to step 6. Do not re-derive
  stages you have already derived. Delete the copied `log/`, `_archive/`,
  and `_mock/` — receipts are the previous project's trust, not yours,
  and a run against new `_config/` would displace everything anyway.

```
# New domain
cp -R ~/_git/frameworks/rig/verified-rig-v6.0 ~/projects/<project-name>

# Solved domain
cp -R ~/projects/<existing-project> ~/projects/<new-project>
```

---

## Steps 1–6 — configuring a new project

### 1. Rename the folder to the project

Done in the copy command above. The folder name is the project name.

### 2. Derive and create the stage folders

Derive stages from artifacts, not activities: list the intermediate
files that must exist between input and deliverable, and which you would
want to inspect before continuing. Each such artifact is a stage
boundary.

Tests for a real stage:
- You can name its feed keys. If not, it is part of an adjacent stage.
- You can write its verifier rubric. If the rubric is "check
  everything," split the stage where the rubric splits. If two adjacent
  rubrics are the same, merge the stages.
- The tool scope changes (web access on, write access off). A permission
  change is always a stage boundary.

If unsure whether something deserves its own stage, it does not. Start
at three or four; splitting later is a folder and a divided fitting.

Rename the skeleton's example stages to the derived pipeline. Keep
`NN_name/` numbering.

### 3. Write the fittings — the only real work

Per stage: worker fitting(s) and a verifier fitting in `fittings/`.
This is where the project's domain knowledge lives. Frontmatter is
machine config (role, tools, max_turns, budget_usd, output, schema,
reads, optional model); the body is the instruction (Reads / Work /
Writes). Frontmatter is the strict flat subset — scalar keys and flat
lists only; `bin/fm.mjs`'s header is the grammar, and anything outside
it is a parse error by file and line.

Rules that cannot bend (build-doctrine.md is canonical):
- One fitting per stage writes the feed. Scratch goes to `output/raw/`.
- Verifiers judge, never fix. Read-only plus their one verdict path.
- **Every `_config/` file a fitting reads is declared in its
  frontmatter `reads:`.** An undeclared read is a contract violation —
  resume trusts what is declared, and only what is declared.
- Worker and verifier are a pair. An obligation added to one side is
  added to the other in the same edit (the fix-loop section below makes
  this mechanical).
- No shell in any `.md`. Anything executable goes to `bin/` — and per
  the boundary test, needing a new `bin/` script is a skeleton
  conversation.

Design-shop pattern: derive stages and draft fittings in the rig Claude
project, land the files here, run on the Mac.

### 4. Chain the `requires.json` files

Each stage's `requires.json` lists exactly the keys the previous stage's
`feed.schema.json` declares it produces:

```json
{"required_keys": ["topic", "findings", "sources"], "path_keys": []}
```

`path_keys` is the subset whose values are file paths the gate should
existence-check — files, never directories; a directory hands off via a
manifest file. Stage 01 needs no `requires.json` unless it consumes a
pre-staged input.

### 5. Load `_config/` and seal it

Project-level L3 material: voice files, standards, product doctrine.
A product doctrine (e.g. a site's Astro build rules) lives here in the
project copy — never in the skeleton.

Then seal:

```
node bin/seal-supply.mjs
```

The seal (`_config/manifest.json`) is the drift alarm: at every run
start the orchestrator warns on any `_config/` file that differs from
the seal, any sealed file missing, any unsealed file present — and
names as **UNCOVERED** any changed file that no stage declares in a
`reads:` line, which is the one change closure hashing cannot see.
Reseal deliberately after every intentional `_config/` change.
`node bin/seal-supply.mjs --check` prints the drift and writes nothing
(exit 1 on drift), for scripted pre-flight.

### 6. Mock first, then run

```
node --check bin/run.mjs        # syntax gate, habit from bash -n
node bin/run.mjs --mock         # full pipeline against the mock harness
node bin/run.mjs                # live
```

`run-input.md` is the trigger: what this run is about, in the shape the
first stage's fitting expects. It is in the first stage's closure — a
new brief invalidates stage 01's trust automatically, and the chain
carries the invalidation downstream.

---

## Running: what resume does by default

**The default is resume.** There is no flag to enable it. At each
stage-top the orchestrator validates the stage's latest receipt against
the world by byte-hash: contracts unchanged, outputs untouched, upstream
feed identical. All green — the stage is SATISFIED and skipped
entirely. Anything off — the old outputs are displaced to `_archive/`
and the stage runs the full five-step loop.

Operationally this means: **after a fix, just run again.** The files you
changed invalidate exactly the stages that read them; everything upstream
of the fix skips; everything downstream re-validates against the fresh
feed and re-runs only if the feed's bytes actually changed. A fix that
re-emits a byte-identical feed leaves downstream trust intact — a prose
clarification in a stage-02 fitting does not bill you for 03 and 04.

- `--fresh` — force a full run. Everything is displaced and re-executed,
  and the bypass is stamped into the receipts ledger as an event, on the
  record.
- There is no `--start-at`. A manual start asserts trust the machine
  cannot verify — where skipping is safe, the hashes already grant it.
- Do not hand-edit stage outputs. The outputs hash catches it, names the
  file, and re-runs the stage — the rig refuses to build on patched
  artifacts. Fix the source (fitting, rubric, `_config/`) instead.
- One run at a time: `log/.lock`. After a crash the lock may be stale —
  the startup error prints its pid and run id; inspect, then remove the
  file.

### Mock runs

```
node bin/run.mjs --mock                      # fresh sandbox
node bin/run.mjs --mock --mock-into _mock/s1 # reuse a sandbox
MOCK_SCENARIO=bad_feed MOCK_STAGE=02_copy node bin/run.mjs --mock
```

`--mock` copies the contract surface (stages minus outputs, `_config/`,
`bin/`, `run-input.md`, VERSION) into `_mock/mock-<timestamp>/` and runs
the identical code path there — own ledger, own logs, run ids prefixed
`mock-`. The live tree is untouched by construction, and the
orchestrator refuses a mock `CLAUDE_BIN` without `--mock`, so the
v5.4-era incident of a mock harness overwriting live artifacts is a
startup error now. Scenarios: `good` (default), `bad_feed`,
`verdict_fail`, `verdict_halt`, `verdict_missing`; `MOCK_STAGE` aims the
scenario at one stage. Running the same sandbox twice via `--mock-into`
is the resume demo: second run prints SATISFIED down the line.

---

## Reading a run

The journal is `log/run-report.md`; every line also prints to stdout.

Stage-top lines — the resume decision, one per stage:

| Line | Meaning |
|---|---|
| `SATISFIED — receipt <id>, closure <hex6>, chain ok` | Trusted and skipped. Nothing invoked, nothing billed. |
| `DISPLACED — <cause>; archived to _archive/<run>/<stage>` | Stale or invalidated; old outputs archived; stage re-runs. |
| `RUN — <cause>` | Stage runs; there was nothing to displace. |

The cause names the first check that broke trust:

| Cause | Meaning | Typical occasion |
|---|---|---|
| `no-receipt` | No recorded pass | First run, or last attempt failed/halted |
| `closure:<file>` | A contract or declared read changed | Expected after a fix — the named file is your edit |
| `outputs:<file>` | Output bytes differ from the receipt | Hand-edit or deletion; fix the source instead |
| `chain` | Upstream feed differs from the one consumed | Normal downstream of any re-run stage |
| `skeleton-version` | Receipt minted under a different skeleton | After a skeleton upgrade |
| `fresh` | `--fresh` was passed | On the ledger as an event |

Loop lines are unchanged from v5.4: `GATE — skipped`, `PASS`,
`HALT — <reason>`, `FAIL — fitting <name>: <reason>`. `WARN —` lines
never block: provenance drift (orchestrator or CLI differs from the
receipt), supply drift and unsealed files, torn ledger lines skipped.

- **pass** at every stage → deliverable is in the final stage's
  `output/`.
- **halt** → plumbing is suspect (failed gate, dead verifier, missing
  verdict, unparseable requires). Nothing was judged bad; something
  could not be judged. Inspect the named file, fix the cause, run again
  — resume re-runs from the halted stage. Never delete the failing feed
  before reading it.
- **fail** → the work was judged bad. Read the verdict's reason, fix the
  *source* (fitting, rubric, `_config/`), run again. Recurring
  hand-edits of the same kind mean the fitting is underspecified.

Cost per fitting: `log/envelopes.jsonl`, now stamped with `run_id`.
Verdict history: `log/verdicts.jsonl`, same. Full stream traces:
`log/stream/<run_id>/<stage>__<fitting>.jsonl`. check_cmd output:
`log/checks.log` under `=== <run_id> <stage> <cmd> ===` headers.

---

## The fix loop

The discipline that keeps fixes from re-introducing catch #10
(one-sided amendment) and catch #12 (gap-filling by the wrong author):

1. Read the verdict line and the named artifact. Classify: `fail` →
   judgment layer (fitting, rubric, supply). `halt` → machinery (feed,
   gate, verdict plumbing).
2. Amend at the source. **Worker and verifier amend as a pair, in the
   same fix** — an obligation without a check is unenforced, a check
   without an obligation is a trap. A fix that touches only one side
   states why in its flags line.
3. A missing string, value, or rule is a **supply gap**: close it in
   `_config/` (and reseal), never by letting a downstream fitting invent
   the content.
4. Append the fix report to `log/fixes.md`:

```
## fix <n> — <stage> — <one-line diagnosis>
verdict: "<reason, quoted verbatim>"
cause: <file> — <what was wrong, one line>
amended:
  - <worker fitting>: "<operative language added or changed, quoted>"
  - <verifier fitting>: "<the mirrored check, quoted>"
flags: <anything contestable, or "none">
not touched: <adjacent files deliberately left alone>
```

5. Run again. Resume scopes the re-run; the journal's DISPLACED line
   should name exactly the file you amended — if it names something
   else, stop and read before proceeding.

The report is written for an authorizer, not a proofreader: quoted
operative language, not summaries of it.

---

## The archive and the ledger

```
_archive/<run_id>/
├── manifest.json          # archived_by, archived_at,
│                          # stages: {<stage>: {producing_run_id, cause}}
└── NN_stage/output/       # the displaced tree, byte-for-byte
```

Archives are keyed by the run that **displaced** them; the manifest
records who produced them and why they were displaced. Lookup rule:
"which run overwrote it? — that run's archive directory has it."
Archives are forensics only. No trust decision ever reads them, so
deleting old ones can never change behavior. Retention is your
judgment.

`log/receipts.jsonl` is the trust ledger: pass-receipts, displacement
events, fresh events, append-only, never rotated, never edited. It is
the one deliberate piece of cross-run state. Treat it as you treat
`log/` generally: the project's memory, not run scratch.

---

## Migrating a project from v5.4

Migration is a skeleton swap. **No project-authored file changes:** no
fitting, schema, `requires.json`, `CONTEXT.md`, `_config/`, or
`run-input.md` edits. Two skeleton items move:

1. Wait for the project's current run and fix cycle to complete. Tier
   discipline: migration is not a fix.
2. Replace the project's `bin/` wholesale with the v6.0 skeleton's
   `bin/`, and copy the skeleton's `VERSION` file to the project root.
   VERSION is skeleton identity and travels with the skeleton's code —
   run.mjs refuses to run without it, deliberately.
3. Optional, recommended: amend `CLAUDE.md`'s invocation line to
   `node bin/run.mjs` and its version string to transcribe VERSION —
   documentation hygiene, not behavior; the rig runs either way.
4. Seal the supply: `node bin/seal-supply.mjs`. Skipping this costs one
   warning per run, nothing more.
5. First run: `node bin/run.mjs`. Every stage reads `no-receipt`;
   existing v5.4 outputs are DISPLACED into `_archive/<run_id>/` —
   your previous deliverable becomes the first archived generation, not
   a deletion — and the pipeline executes in full, minting receipts.
6. From the second run on, resume is live.

What carries without conversion: old `log/` files stay in place and
stay parseable — v6 lines add fields, never remove them. What narrows:
fittings written before the declared-reads law get closure coverage
only for what they declare; the seal's UNCOVERED warning is the net
underneath. Add `reads:` lines at the next natural contract amendment —
adding them is itself a contract change and invalidates the stage, so
batch it with a real fix rather than mass-editing for coverage.

---

## Handoff

A configured project is sealed: hand it off by copying the folder. The
recipient runs it and intervenes only at halts. They need: a Mac with
Claude Code installed (Node ships with it — that is the whole runtime),
the folder, and this runbook. `bin/` and DEVIATIONS.md are already
inside (D3). Residual shell (`check_cmd` strings, `write-guard.sh`,
`fetch.sh`) still assumes stock bash 3.2 per D2/D4/D5 — nothing to
install there either.

---

## The timing check

First production project from a fresh skeleton copy: steps 1–6 should
fit in an afternoon. If they do not, the skeleton is missing something —
record what it was in BUILD-NOTES.md and raise it as a skeleton change.
That is a finding, not a failure.
