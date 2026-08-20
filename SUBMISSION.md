# Submission — ICM Weekly Comp #11: The Cartographer

**Repo:** https://github.com/<USER>/bramwell-cartographer

**Entry, three sentences:**

I mapped the source of no.fail — a deployed Astro site whose next reader
is usually a cold model with a context budget — and the map's later
reader answers a question from the catalog plus one card, on tape, on
two models, in `receipts/`. What makes this entry different is that the
map was built and checked by a pipeline included in the repo: a
deterministic scanner extracts the dependency evidence, and a separate
verifier — not the process that wrote the cards — resolves and reads
every citation, checks every Hits line against the extracted graph and
every Does-not-hit as a genuine absence, and once, live, failed a map
whose 150 citations all resolved because two of them pointed at
neighbouring lines that said something else. The territory ships pinned
in the repo, so nothing here has to be taken on trust: clone it, re-run
the verification, plant a bad citation and watch it fail by name.

**Territory:** `_territory/` — the no.fail site source, pinned at commit
`16a4fc437b66fe860bb4247692070b6167cfc274`. Real, deployed, and the thing its next developer will change.

**Later reader:** a model, cold, or a human contractor — same map, same
two-hop walk. Transcripts included.

**Disclosure:** the five ICM files were written by hand to the brief's
spec. The map itself was produced and verified by the included pipeline
(`_rig/`), built on a stateless headless-orchestration skeleton; the
full run journal, including one recorded verification failure and its
fix, is in `_rig/log/`.
