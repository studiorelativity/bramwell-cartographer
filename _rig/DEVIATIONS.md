# DEVIATIONS — framework spec vs the machine it runs on

This log records where the machine (CLI, shell, OS, runtime) diverges
from what the rig spec assumes. Design decisions do not belong here —
they go in BUILD-NOTES.md. Product-level doctrine (site rules, brand
rules) stays with its own workspace.

Every copied skeleton carries this file. Project-specific entries append
below the rig entries and continue the numbering — one file, one lineage
per copy. D7 began as a project entry on the first no.fail production
run and was promoted to the rig set when `bin/fetch.sh` entered the
skeleton at v5.4; project entries in copies of this skeleton therefore
start at **D8**.

Entry format: **Status / Expected / Observed / Workaround / Cost /
Rollback.** Entries are never deleted. A deviation that stops binding a
surface is re-dispositioned in place — status amended, original text
kept, a dated **disposition** field appended — because the record of why
a workaround existed is the defense against reintroducing the bug it
worked around.

## v6.0 re-disposition note

At skeleton v6.0, control flow left the shell: the orchestrator, the
feed-gate, and the mock harness are Node (`bin/run.mjs`,
`bin/feed-gate.mjs`, `bin/mock-claude.mjs`), executed by the Node
runtime that is a precondition of the harness itself — a machine with
Claude Code has the runtime by construction. Shell deviations D2, D4,
and D5 therefore no longer constrain control flow and are marked
**retired for control flow** below. They remain fully binding for
everything that is still shell: every `check_cmd` string (executed via
`/bin/bash -c`), `bin/write-guard.sh`, `bin/fetch.sh`, and any named
shell script a project adds to `bin/`.

D1, D6, and D7 are CLI-behavior deviations, not shell deviations. They
carry forward unchanged and are re-verified per their rollback lines.
No new machine divergences are recorded at v6.0 — nothing has executed
on the deployment target yet. The cutover acceptance run and the first
live run append here if the machine disagrees.

---

## D1 — Write(<path>) tool scoping is inert

**Status:** adopted (workaround is canonical)
**Expected:** per-tool write-path scoping constrains where a verifier can
write, in both allow and deny directions.
**Observed:** on CLI 2.1.226 the scoping is inert in both allow and deny
directions; combined with acceptEdits, a verifier could write anywhere.
**Workaround:** a PreToolUse hook (`bin/write-guard.sh`) generated into a
per-verifier settings file. `ALLOWED_WRITE` names the verdict path; paths
are realpath-normalized before comparison.
**Cost:** one hook script plus one settings file per verifier.
**Rollback:** retest on every CLI upgrade. If native scoping starts
working, the hook remains as belt-and-suspenders — it is not removable.
**v6.0 disposition:** carried. The settings-file generation and
`ALLOWED_WRITE` export move from `run.sh` to `run.mjs`; the hook script
itself is byte-identical and remains canonical per doctrine. Note for
operators: mock runs never invoke the real CLI, so mock acceptance does
not exercise this hook — re-verification happens on the first live v6.0
run and on every CLI upgrade thereafter. Last verified live on CLI
2.1.226 under v5.4.

## D2 — `mapfile` requires bash 4+

**Status:** retired for control flow at v6.0; binding for `check_cmd`
and residual shell
**Expected:** `mapfile`/`readarray` available for reading lines into
arrays.
**Observed:** macOS ships bash 3.2.
**Workaround:** portable `while IFS= read -r` loops everywhere shell
still runs.
**Cost:** more verbose loop bodies in residual shell.
**Rollback:** if the deployment target ever guarantees bash 4+, revert
in residual shell where it simplifies. Control flow does not roll back
to shell; that would be a version decision, not a deviation.
**v6.0 disposition:** the orchestrator, gate, and mock left bash for
Node, so this deviation stopped constraining them. It still constrains
every `check_cmd` string and every shell script in `bin/`. Entry
retained because the idiom must survive in residual shell and in any
project-added script.

## D3 — deployment packaging

**Status:** adopted (rule)
**Expected:** the spec is silent on what a shipped rig must carry.
**Observed:** kickoffs that referenced artifacts outside their stated
supply behave unpredictably on a clean machine.
**Workaround:** any rig shipped for deployment MUST carry `bin/` (mock
harness + write guard) and this file. A kickoff prompt never references
artifacts outside its stated supply list.
**Cost:** slightly larger deployment folder.
**Rollback:** none intended — this is packaging law, recorded here
because it was learned as a divergence between spec assumptions and
clean-machine reality.
**v6.0 disposition:** carried unchanged. v6.0 adds MANIFEST.md as the
packing list the rule is checked against; the rule itself does not
change.

## D4 — empty-array expansion errors under `set -u`

**Status:** retired for control flow at v6.0; binding for `check_cmd`
and residual shell
**Expected:** `"${arr[@]}"` on an empty array expands to nothing.
**Observed:** bash 3.2 under `set -u` treats the empty expansion as an
unbound variable and aborts the script.
**Workaround:** the `${arr[@]+"${arr[@]}"}` idiom at every site where an
array may legitimately be empty.
**Cost:** ugly but mechanical.
**Rollback:** bash 4.4+ resolves this. Revert to plain expansion only if
the deployment target moves off 3.2.
**v6.0 disposition:** retired for control flow — Node has no analogue of
this failure. Binding wherever shell survives, same scope as D2.

## D5 — `realpath -m` unavailable

**Status:** retired for control flow at v6.0; noted for residual shell
**Expected:** `realpath -m` normalizes paths that do not yet exist.
**Observed:** macOS does not ship GNU coreutils realpath; `-m` is
unavailable on the deployment machine.
**Workaround:** none required in practice — non-blocking because the CLI
pre-absolutizes paths before scripts see them. Where normalization is
needed independently, use `cd` + `pwd -P` against existing directories.
**Cost:** none currently; revisit if a script must normalize a path the
CLI has not touched.
**Rollback:** if coreutils becomes a guaranteed dependency on the
target, revert.
**v6.0 disposition:** retired for control flow — `node:path` resolves,
relativizes, and normalizes natively, including paths that do not yet
exist, which is what the v5.2 staleness mechanism died for want of.
`bin/write-guard.sh` keeps the existing-directory `cd` + `pwd -P` idiom
unchanged.

## D6 — `--max-budget-usd` is a soft ceiling

**Status:** adopted
**Expected:** the flag hard-stops an invocation at the stated budget.
**Observed:** spend can exceed the flag before the halt takes effect.
**Workaround:** treat the flag as advisory. Hard stops live
orchestrator-side: max turns per stage, bounded stage count, no
unbounded loops anywhere. Never rely on the budget flag to break a loop.
**Cost:** orchestrator carries its own limit logic.
**Rollback:** if a future CLI enforces a hard cap, the flag may be
relied on — keep the orchestrator-side stops regardless.
**v6.0 disposition:** carried. `run.mjs` passes the flag per fitting
frontmatter and treats it as advisory exactly as `run.sh` did; hard
stops remain orchestrator-side (`--max-turns` per fitting, bounded stage
count, single-run lockfile, no unbounded loops). A possible hardening —
watching the stream-json output for cumulative spend and killing the
child at budget — is queued in BUILD-NOTES, unverified on the target,
and must not be relied on until a live run proves the stream carries
per-event spend. Re-verify the flag's behavior on every CLI upgrade.

## D7 — WebFetch is not an evidence-grade fetcher

**Status:** adopted (workaround is canonical)
**Expected:** the fitting with network tools can obtain what the audit's
evidence rule requires — the raw response body, the HTTP status line,
and the redirect chain — so that every downstream claim quotes an
observed string.
**Observed:** on the live no.fail run (2026-08-13_214225), `WebFetch`
supplied none of the three reliably. It returns sub-model-processed
markdown rather than the response body; it does not expose the status
line or the redirect chain for a successful fetch (status came back
`null` for homepage, robots, and both content pages, with codes visible
only when the tool itself reported a 404 or a 200); and on the first
homepage attempt it returned a refusal to reproduce content verbatim
plus a paraphrase. The consequences are not cosmetic: no raw `<head>`
markup was observable, so ABSENT verdicts on canonical, OG, and JSON-LD
rested on a sub-model's report rather than a quoted string, and rubric
§1's host-consolidation and error-handling criteria had nothing to score
against.
**Workaround:** `bin/fetch.sh` — a curl wrapper, the only fetch path for
fittings whose material is evidence. It writes the raw body
byte-for-byte to `output/raw/fetches/`, captures the status via
`curl -w`, and records the full redirect chain. The fetching fitting no
longer fetches by tool: it invokes the script and inventories what the
script wrote. WebFetch stays available to search-type fittings, where
the material is search results read as reported readings, not evidence
strings.
**Cost:** the fetching fitting needs `Bash` in its allowed tools, which
is a wider grant than the rest of the rig carries. It is bounded to the
one stage that already holds the network, and the script is in `bin/`
where every executable lives.
**Rollback:** retest on every CLI upgrade. If WebFetch ever exposes
status, redirect chain, and an unprocessed body, the tool path may
return — but `bin/fetch.sh` should stay as the default, because a
sub-model between the wire and the evidence file is a category error for
an audit, not a bug to wait out.
**v6.0 disposition:** carried unchanged; promoted from project entry to
rig entry alongside `bin/fetch.sh`'s entry into the skeleton at v5.4,
recorded here at v6.0 for lineage clarity. The script is untouched by
the substrate change.

---

*Project-specific entries continue below, numbered D8 onward.*
## D8 — the mock harness materializes one artifact per work fitting

**Status:** adopted (workaround is canonical for this project)
**Project:** jidoka-cartographer
**Expected:** a stage whose mechanical script writes several side files can
have every one of them existence-checked by the downstream `path_keys` gate
under `node bin/run.mjs --mock`.
**Observed:** `bin/mock-claude.mjs` writes exactly one file per work
fitting — the path in that fitting's frontmatter `output:` — and nothing
else ("The mock never manufactures side files", mock-claude.mjs header).
`bin/scan.sh` writes two products, `files.json` and `edges.json`; only one
of them can be a fitting's declared `output`, so only one exists in a mock
sandbox. A `path_keys` entry naming the other halts the gate under `--mock`
— correctly, per the harness's own contract, but it makes an all-green mock
run impossible for a two-product script.
**Workaround:** `path_keys` carries the file the downstream stage actually
OPENS, and the rest travel as plain `required_keys`. At the 01→02 boundary
that is `edge_list`: `02_cards` derives every Hits and Does-not-hit line
from `edges.json`, while `files.json` is provenance the card writer never
opens. `file_list`'s existence and parse are checked instead by
`01_inventory`'s verifier, rubric item 1. RUNBOOK §4 already frames
`path_keys` as "the subset whose values are file paths the gate should
existence-check", so the subset is contract, not evasion — but the reason
the subset is not the whole set is this harness limit, and it is recorded
here rather than left to be rediscovered.
**Cost:** one file path per stage boundary is gated mechanically, the rest
by a verifier that only judges on live runs. A live run where `bin/scan.sh`
wrote `edges.json` but not `files.json` would clear the 02_cards gate and be
caught one fitting later. The script writes both or neither, so the window
is narrow, but it is real and the first live shakedown should confirm both
files land.
**Rollback:** none needed if the skeleton ever lets a fitting declare more
than one output, or if the mock materializes a stage's declared `path_keys`
targets. Either change retires this entry; revert by moving `file_list`
into `02_cards/requires.json`'s `path_keys`.
