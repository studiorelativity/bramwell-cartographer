# Verified Rig v6.0 — L0

This folder is a rig: a stateless, headless staged pipeline run by `node bin/run.mjs`.
Stages run in folder order; within a stage, fittings run in folder order, one
fresh `claude -p` process each. No shared session, ever — everything that
crosses an invocation boundary is on disk. You are one fitting's worker or
verifier; the invoking prompt names which. Do nothing outside the files that
prompt names.

## Layout
- `NN_name/CONTEXT.md` — the stage contract (L2): what the stage is, its inputs,
  its fitting sequence (declared in frontmatter), its outputs.
- `NN_name/fittings/NN_x.md` — one fitting = one process. Frontmatter between
  `---` markers is orchestrator config: skip it. The body is your instruction.
- `NN_name/requires.json` — consumer-side gate: the feed keys this stage needs
  before it may START. Checked mechanically by `bin/feed-gate.mjs`.
- `NN_name/feed.schema.json` — producer-side check on the feed this stage writes.
- `NN_name/output/feed.json` — the sole canonical between-stage handoff. Only
  the one fitting whose contract names it may write it.
- `NN_name/output/raw/` — within-stage scratch for every other fitting. Heavy
  and untrusted material dies here; no downstream stage reads it.
- `NN_name/output/verdict.json` — a verifier's reading. Verifiers write this one
  file and never fix anything.
- `bin/` — the only place executables live: `run.mjs`, `fm.mjs`,
  `feed-gate.mjs`, `mock-claude.mjs`, `seal-supply.mjs`, `write-guard.sh`,
  `fetch.sh` (fm.mjs is a shared module the others import, not
  independently runnable). No shell script is ever embedded in a `.md`.
- `_config/` — reference material (L3). Load a file only if your fitting's Reads
  section names it.
- `log/` — run reports, verdict and envelope logs. Empty in a fresh skeleton.
- `run-input.md` — this run's brief (L4).
- `DEVIATIONS.md` — machine-vs-spec divergences only (D1–D6).
- `BUILD-NOTES.md` — build and design decisions. Never mixed into DEVIATIONS.

## Run
    node bin/run.mjs                        # production
    node bin/run.mjs --mock                 # free logic test with the mock harness

Per stage the orchestrator does: feed-gate → worker(s) → orchestrator-side
`check_cmd` → verifier → branch on `verdict.json`.

## Rules
- Read only what `CONTEXT.md` and your fitting's Reads section declare, plus this file.
- Write only what your fitting's Writes section declares.
- The feed is the only thing that crosses a stage boundary.
- Verdicts are `{"status": "pass"|"halt"|"fail", "reason": "<one sentence>"}`.
  Verifiers judge, never fix. Workers never read or write a verdict, and never
  grade themselves — deterministic checks run orchestrator-side.
- A gate failure is a `halt`, never a `fail`, and is never retried: the failing
  feed stays on disk as diagnostic evidence.
- No auto-retry anywhere in this version.
