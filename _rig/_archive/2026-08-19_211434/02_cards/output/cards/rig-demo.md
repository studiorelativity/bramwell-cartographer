---
noun: Rig demo component
path: src/components/RigDemo.astro
status: live
---

## What it is

The interactive widget that walks a visitor through a gated three-stage
pipeline run. Its markup lays out three stage blocks, each holding a gate, a
work, and a verdict row, under a control group of three scenario buttons —
clean run, malformed handoff, bad work (src/components/RigDemo.astro:14@dcba75e,
src/components/RigDemo.astro:29@dcba75e, src/components/RigDemo.astro:35@dcba75e,
src/components/RigDemo.astro:41@dcba75e). Below the live view sits a full static
block reproducing each scenario's final frame, shown when the script has not
run (src/components/RigDemo.astro:67@dcba75e,
src/components/RigDemo.astro:339@dcba75e). A scoped style block and one inline
script follow the markup; the script holds the scenario table that drives every
step's state, the label strings, and the artifact payloads it reveals
(src/components/RigDemo.astro:158@dcba75e,
src/components/RigDemo.astro:351@dcba75e,
src/components/RigDemo.astro:403@dcba75e). It closes on the distinction it
exists to teach: a halt means the plumbing is suspect, a fail means the work
was judged bad (src/components/RigDemo.astro:155@dcba75e).

## Why it is shaped this way

The file declares itself self-contained — no imports, no dependencies, no
network, no storage, no free-text input — which is why 552 lines of markup,
style, and script live in one component rather than splitting into a script
module and a stylesheet (src/components/RigDemo.astro:3@dcba75e). Every node
the script touches already exists in the markup so the scoped styles apply to
it and the script only rewrites text and state attributes
(src/components/RigDemo.astro:20@dcba75e), and the static frames are duplicated
in markup so the teaching payload survives JavaScript being off
(src/components/RigDemo.astro:65@dcba75e).

## Hits

- src/pages/index.astro — the home page imports and places this component, so
  its size, its markup, and its whole scenario sequence land on the site's
  front page (edge: src/pages/index.astro:3@dcba75e)

## Does not hit

- src/pages/how-it-works.astro — looks related because it explains the same
  gated pipeline in prose and is the page a reader would expect this widget to
  illustrate; no edge exists from this noun to it, and none from it back — the
  widget appears only on the home page.
- src/styles/global.css — looks related because every rule in this file's
  scoped style block draws on the site tokens; no edge exists from this noun to
  it, since the tokens arrive through the layout that both files sit under.
