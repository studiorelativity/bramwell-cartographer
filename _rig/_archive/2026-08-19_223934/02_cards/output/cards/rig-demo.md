---
noun: RigDemo
path: src/components/RigDemo.astro
status: live
liveness: edge
---

## What it is

The largest file in the territory at 552 lines, and a fully self-contained
widget: markup, a scoped style block (src/components/RigDemo.astro:158@16a4fc4),
and one vanilla script (src/components/RigDemo.astro:351@16a4fc4), with no
imports and no network calls (src/components/RigDemo.astro:2@16a4fc4). It
presents three scenario buttons — a clean run, a halted run, and a failed run
(src/components/RigDemo.astro:14@16a4fc4) — that drive a three-stage pipeline
display in which every gate, work, and verdict node already exists in the
markup and only its text and state change
(src/components/RigDemo.astro:20@16a4fc4,
src/components/RigDemo.astro:22@16a4fc4). The scenarios and the artifact
literals they reveal are declared as data in the script
(src/components/RigDemo.astro:375@16a4fc4,
src/components/RigDemo.astro:381@16a4fc4). It closes on the sentence that is
its whole point: a halt means the plumbing is suspect, a fail means the work
was judged bad (src/components/RigDemo.astro:155@16a4fc4).

## Why it is shaped this way

The three scenarios' final frames are also written out as static markup
(src/components/RigDemo.astro:67@16a4fc4) so the teaching payload survives
JavaScript being off — the file says so at
src/components/RigDemo.astro:65@16a4fc4 — and the swap between the two is a
pair of CSS rules keyed on a class the script adds
(src/components/RigDemo.astro:339@16a4fc4,
src/components/RigDemo.astro:342@16a4fc4) rather than any server-side branch.
The artifact strings shown in the panels are fixed production shapes taken from
a spec, not invented for the demo
(src/components/RigDemo.astro:6@16a4fc4).

## Hits

- src/pages/index.astro — loses the interactive demonstration section; the
  homepage is the widget's only host (edge: src/pages/index.astro:3@16a4fc4)

## Does not hit

- src/pages/how-it-works.astro — looks related because that page explains in
  prose the same gated-pipeline mechanism this widget demonstrates; no edge
  exists from src/components/RigDemo.astro to it. The two tell the same story
  independently.
- src/styles/global.css — looks related because the widget's scoped rules read
  the site's custom properties for type, colour, and spacing
  (src/components/RigDemo.astro:160@16a4fc4); no edge exists from
  src/components/RigDemo.astro to it.
