# NEW-PROJECT-KICKOFF — jidoka cartographer (filled; execute in Claude Code)

You are the builder for a new rig project. The skeleton is already copied
and this file sits at its root. You configure; you do not run production.

## How the human uses this file
1. Skeleton already copied to `~/_git/sandbox/jidoka/_rig/` from
   verified-rig-v6.0. This file sits at that root.
2. Braces are filled. Nothing in `{{ }}` remains.
3. Drop the `_config/` files listed below into `_config/` before running.
4. Territory snapshot already staged at `../_territory/` — see Territory.
5. From `_rig/`, interactive `claude`: "Read NEW-PROJECT-KICKOFF.md and
   execute it. Work one file per response. Stop at the report."

## Supply list (strict)
You may read and use ONLY: this skeleton's existing files (`bin/`, docs,
stub stages), the `_config/` files listed below, the territory snapshot at
`../_territory/`, and this kickoff.
Missing supply → stop and report the gap. Never invent a substitute.

## Territory
- Path: `../_territory/` — a pinned snapshot of the nofail-jidoka site
  subtree (`04_assemble/output/site` at the pinned commit of the parent
  repo), extracted via `git archive`. Its root holds `src/`, `public/`,
  `functions/`, `astro.config.mjs`, `package.json`.
- Read-only to every fitting. No fitting or script ever writes under it.
- The pinned commit hash is recorded in `_config/territory.md` and in
  `run-input.md`. Every citation in every card carries this hash.
- Scope exclusions (never scanned, never carded): `node_modules/`,
  `dist/`, `.git/`, `.astro/`.
- If `../_territory/` is absent, or `_config/territory.md` has no commit
  hash, halt and report — do not scan an unpinned target.

## Project definition
- Name: `jidoka-cartographer`
- Domain, one line: takes a pinned snapshot of an Astro site repo and
  produces a verified system map — a catalog plus noun cards whose every
  factual claim cites `path:line@commit` and whose Hits / Does-not-hit
  lines are checked against an extracted dependency edge list.
- Run trigger (`run-input.md` fields): `territory_path`,
  `territory_commit`, `target_noun_count` (8–12), `quote_cap_lines` (5).

## Pipeline definition
Stages in order — derive from artifacts, not activities (RUNBOOK §2):

```
01_inventory — bin/scan.sh walks the territory into file list + import/link edge list; fitting adjudicates each noun live/leftover/ghost and nominates the card set — feed keys produced: file_list, edge_list, nouns — network: no
02_cards — writes catalog.md + one card per nominated noun from the manifest; every claim cites path:line@commit; Hits/Does-not-hit derived from edge_list — feed keys produced: catalog_path, card_index — network: no
03_verify — bin/cite-check.sh mechanically resolves every citation in every card; fitting inventories the results; verifier judges support, graph-match, and photocopy cap — feed keys produced: citation_report — network: no
```

Stage folder work: rename `01_research/` → `01_inventory/`,
`02_summarize/` → `02_cards/`, create `03_verify/` in the skeleton shape.

## Containment map
No stage has network access; the territory is the human's own repo, so
untrusted-input containment is light — but the mechanical/judgment split
holds anyway:
- Mechanical retrieval and resolution go through named `bin/` scripts
  (`bin/scan.sh`, `bin/cite-check.sh`), never a model tool. Fittings
  invoke the script and inventory what it wrote (the D7 pattern).
- One feed-writing fitting per stage. All scratch to `output/raw/`.
- `01_inventory`'s fitting reads scan output, not the raw territory,
  except to spot-check a ghost claim (the referencing line must be read
  to be quoted).
- `02_cards`' fitting reads the manifest plus ONLY the nominated files —
  it never walks the territory itself.

## Project-tier bin/ additions (pre-authorized by the human)
Two NEW scripts, project-tier, Astro-specific — not skeleton candidates.
Create them; never modify any existing `bin/` file or the orchestrator.
Log both in BUILD-NOTES.md. bash 3.2 clean, `bash -n` before any run.

- `bin/scan.sh <territory_path> <out_dir>` — walks the territory
  (exclusions above), writes `files.json` (every file, relative path) and
  `edges.json` (one edge per import/link statement parsed from `.astro`,
  `.js`, `.ts`, `.mjs`, `.css` files: `{"from": path, "to": path,
  "line": N}`). Unresolvable import targets are still emitted as edges —
  they are ghost evidence, not errors. Deterministic, zero AI. Print
  nothing on success; name the failure on stderr.
- `bin/cite-check.sh <cards_dir> <territory_path> <out_file>` — extracts
  every `path:line@commit` citation from every card, checks the path
  exists, the line exists, and the commit matches `territory_commit`;
  also counts quoted lines per card against `quote_cap_lines`. Writes a
  JSON report: per citation `{card, citation, resolved: true/false,
  reason}`, per card `{card, quoted_lines}`. Mechanical only — it never
  judges whether a cited line supports its claim.

Any further `bin/` need discovered during the build: report it, don't
make it.

## _config/ manifest
- `territory.md` — snapshot path, pinned commit hash, scope exclusions —
  read by all fittings via stage CONTEXT.md.
- `card-template.md` — the card contract: four sections (What it is /
  Why it is shaped this way / Hits / Does not hit), citation format
  `path:line@commit`, quote cap, the cite-never-copy rule, live/leftover/
  ghost badge — read by `02_cards` worker and both heavyweight verifiers.
- `noun-guidance.md` — what counts as a noun in an Astro repo
  (components, layouts, content collections, token/style sources,
  config), selection criteria, target count, the requirement to include
  at least one leftover or ghost if the inventory surfaces one — read by
  `01_inventory`'s adjudication fitting.
- `catalog-template.md` — catalog shape: one line per card, a door not a
  summary; catalog stores nothing the card holds — read by `02_cards`
  worker.

Stage CONTEXT.md frontmatter scopes reads; no fitting loads all of
`_config/`.

## Verifier rubric sources
- `01_inventory` verifier: derive from the fitting's Writes section, plus
  one explicit rule — every `ghost` status is evidence-backed: the
  referencing line exists at the cited location AND the target is absent
  from `files.json`. A ghost claim without both is a `fail`.
- `02_cards` verifier: derive from `card-template.md` — every card has
  all four sections, every factual claim carries a citation, every Hits
  entry names its supporting edge, every Does-not-hit entry names the
  absent edge it denies, catalog has one door per card and no orphans.
- `03_verify` verifier: written explicitly — this rubric is the product.
  Three numbered checks: (1) every citation in `cite-check`'s report is
  `resolved: true`, and for a sampled majority the cited line actually
  supports the card's claim; (2) every Hits line corresponds to an edge
  in `edges.json` and every Does-not-hit line corresponds to no edge;
  (3) no card exceeds `quote_cap_lines`. Any miss names the card and the
  line in the verdict reason. Judgment on support quality belongs here,
  not in the script.

## Model pins (legible, per template rule)
- `02_cards` worker, `02_cards` verifier, `03_verify` verifier: pin the
  frontier model — card writing and evidence adjudication are the
  judgment core.
- `01_inventory` adjudication fitting and verifier: pin the mid-tier
  model — status adjudication over a mechanical scan.
- The human may swap pins to whatever the CLI offers; the pin's presence
  is the point, per doctrine.

## Build order
1. Rename/create stage folders per Pipeline definition; empty `log/`.
2. `feed.schema.json` and `requires.json` per stage — each stage requires
   exactly what the previous declares it produces; `path_keys` only for
   values that are files (`file_list`, `edge_list`, `card_index`,
   `citation_report` are all file paths; card sets hand off via the
   `card_index` manifest, never a directory).
3. `bin/scan.sh` and `bin/cite-check.sh` (pre-authorized above), then
   `bash -n` both.
4. Fitting bodies: `02_cards` worker first (judgment-heavy), then
   `01_inventory`, then `03_verify`'s inventory fitting, then all
   verifiers.
5. Stage CONTEXT.md files, fitting sequence in frontmatter.
6. `run-input.md` stub per the Project definition.

## Rules that cannot bend (build-doctrine.md is canonical; read it first)
- Do not modify existing `bin/` files or the orchestrator. The two
  pre-authorized scripts are NEW files only. Anything further is a
  report, not a change.
- Workers never self-validate; deterministic checks go in `check_cmd`,
  and every fitting's Work section states this prohibition explicitly.
- `check_cmd` expressions stay simple; anything complex is already a
  named `bin/` script above, or becomes a request in the report.
- Cards cite, never copy. The quote cap is enforced twice: mechanically
  by `cite-check` and in judgment by the `03_verify` rubric.
- No fitting writes under `../_territory/`, ever. The map describes the
  territory; it does not touch it.
- No shell in any `.md`. bash 3.2 constraints per DEVIATIONS D2/D4/D5.
- Budgets are advisory (D6); no comparable envelope data exists for this
  pipeline — set generous caps and record actuals in BUILD-NOTES for the
  next run.

## Definition of done
1. Full scaffold per the pipeline definition; no `{{ }}` anywhere.
2. `node bin/run.mjs --mock` — all stages PASS.
3. Negative tests, each demonstrated: malformed feed → gate halts at the
   right stage; missing required key → same; verdict `fail` → run stops;
   missing verdict → halt.
4. One seeded-defect test beyond the standard set: hand-plant a card with
   a citation to a nonexistent line and confirm `03_verify` fails it by
   name. A verifier only proven on good work is unproven.
5. Report: what was built, what is stubbed, any supply gaps, any further
   `bin/` requests (not made), and the reminder that mock success is not
   live validation — first live run is a shakedown against the real
   territory snapshot, graded by the human.

Stop after the report.
