# Territory

- **Path:** `../_territory/` (relative to rig root)
- **Source:** nofail-jidoka repo, subtree `04_assemble/output/site`,
  extracted with `git archive HEAD:04_assemble/output/site`
- **Pinned commit:** `16a4fc437b66fe860bb4247692070b6167cfc274`
- **Snapshot root contents:** `src/`, `public/`, `functions/`,
  `astro.config.mjs`, `package.json`

## Rules

- Read-only. No fitting or script writes under `../_territory/`, ever.
- Scan exclusions: `node_modules/`, `dist/`, `.git/`, `.astro/`.
- Every citation in every card uses the format `path:line@commit`, where
  `commit` is the first 7 characters of the pinned hash above and `path`
  is relative to the snapshot root (e.g. `src/styles/tokens.css:14@a1b2c3d`).
- If the snapshot and this file disagree — path missing, hash absent —
  the run halts. A map of an unpinned target cannot be verified.
